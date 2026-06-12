@echo off
echo ============================================================
echo Service Health Check
echo ============================================================
echo.

echo Checking if API is running on port 8000...
netstat -ano | findstr ":8000" > nul
if %errorlevel% equ 0 (
    echo [OK] API server appears to be running on port 8000
) else (
    echo [ERROR] API server is NOT running on port 8000
    echo Please start the API server first!
)
echo.

echo Checking if Frontend is running on port 3000...
netstat -ano | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo [OK] Frontend server appears to be running on port 3000
) else (
    echo [ERROR] Frontend server is NOT running on port 3000
    echo Please start the frontend server!
)
echo.

echo Testing API health endpoint...
curl -s http://127.0.0.1:8000/health > nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] API health endpoint is responding
    curl -s http://127.0.0.1:8000/health
) else (
    echo [ERROR] Cannot reach API health endpoint
    echo Make sure the API server is running: cd services\api ^& npm run dev
)
echo.

echo ============================================================
echo.
pause
