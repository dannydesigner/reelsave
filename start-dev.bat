@echo off
echo Starting Social Video Downloader - Development Environment
echo ============================================================
echo.

echo Checking API dependencies...
if not exist "services\api\.venv" (
    echo [WARNING] API virtual environment not found!
    echo.
    echo Please run setup first:
    echo   cd services\api
    echo   setup-and-fix.bat
    echo.
    echo Press any key to continue anyway or Ctrl+C to cancel...
    pause >nul
)

echo Starting API Server (Port 8000)...
start "API Server" cmd /k "cd services\api && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Web Frontend (Port 3000)...
start "Web Frontend" cmd /k "cd apps\web && npm run dev"

echo.
echo ============================================================
echo Both services are starting...
echo - API: http://127.0.0.1:8000
echo - Web: http://localhost:3000
echo - API Docs: http://127.0.0.1:8000/docs
echo ============================================================
echo.
echo If you get 500 errors, run: cd services\api ^&^& setup-and-fix.bat
echo.
echo Press any key to close this window (services will keep running)
pause >nul
