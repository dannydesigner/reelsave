@echo off
echo Opening important URLs in your default browser...
echo.

timeout /t 2 /nobreak >nul

echo Opening API Health Check...
start http://127.0.0.1:8000/health

timeout /t 1 /nobreak >nul

echo Opening API Documentation...
start http://127.0.0.1:8000/docs

timeout /t 1 /nobreak >nul

echo Opening Frontend...
start http://localhost:3000

echo.
echo All URLs opened!
echo If any page fails to load, the service might not be running.
echo Run start-dev.bat to start all services.
echo.
pause
