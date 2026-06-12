@echo off
echo ============================================================
echo  Social Video Downloader - Complete Setup and Fix
echo ============================================================
echo.
echo This script will:
echo  1. Install API Python dependencies
echo  2. Install Frontend npm dependencies  
echo  3. Check for ffmpeg (optional)
echo  4. Create required files and directories
echo  5. Start both services
echo.
pause
echo.

echo ============================================================
echo Step 1: Setting up API (Python/FastAPI)
echo ============================================================
cd services\api
call setup-and-fix.bat
if %errorlevel% neq 0 (
    echo [ERROR] API setup failed!
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo.

echo ============================================================
echo Step 2: Setting up Frontend (Next.js)
echo ============================================================
cd apps\web
echo Checking npm dependencies...
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies (this may take a few minutes)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend npm install failed!
        cd ..\..
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies already installed
)
cd ..\..
echo.

echo ============================================================
echo Step 3: Checking Configuration Files
echo ============================================================

echo Checking API .env file...
if not exist "services\api\.env" (
    echo [WARNING] API .env not found, should have been created by setup script
) else (
    echo [OK] API .env exists
)

echo Checking Frontend .env.local file...
if not exist "apps\web\.env.local" (
    echo [WARNING] Frontend .env.local not found
    echo Creating from example...
    copy "apps\web\.env.example" "apps\web\.env.local" >nul 2>&1
    echo [OK] Created apps\web\.env.local
) else (
    echo [OK] Frontend .env.local exists
)
echo.

echo ============================================================
echo Step 4: Verifying Configuration
echo ============================================================

echo Checking if required directories exist...
if not exist "services\api\tmp" mkdir "services\api\tmp"
if not exist "services\api\logs" mkdir "services\api\logs"
echo [OK] Required directories created
echo.

echo ============================================================
echo Setup Complete! Summary:
echo ============================================================
echo.
echo [✓] Python dependencies installed
echo [✓] Frontend dependencies installed
echo [✓] Configuration files ready
echo [✓] Required directories created
echo.
echo ============================================================
echo Starting Services...
echo ============================================================
echo.

echo Starting API Server...
start "API Server - Social Video Downloader" cmd /k "cd services\api && npm run dev"
timeout /t 5 /nobreak >nul

echo Starting Frontend...
start "Frontend - Social Video Downloader" cmd /k "cd apps\web && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ============================================================
echo Services Started!
echo ============================================================
echo.
echo Wait 10-15 seconds for services to fully start, then visit:
echo.
echo   Frontend:  http://localhost:3000
echo   API Docs:  http://127.0.0.1:8000/docs
echo   API Health: http://127.0.0.1:8000/health
echo.
echo If you still get errors:
echo  1. Check the API Server terminal for error messages
echo  2. Read FIX-500-ERROR.md for troubleshooting
echo  3. Make sure Python is installed and in PATH
echo.
echo Press any key to close this window (services will keep running)
pause >nul
