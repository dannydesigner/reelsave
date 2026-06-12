@echo off
echo ============================================================
echo API Setup and Dependency Installation
echo ============================================================
echo.

echo Step 1: Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.8 or higher from python.org
    pause
    exit /b 1
)
python --version
echo [OK] Python is installed
echo.

echo Step 2: Creating virtual environment...
if exist .venv (
    echo [INFO] Virtual environment already exists
) else (
    python -m venv .venv
    echo [OK] Virtual environment created
)
echo.

echo Step 3: Activating virtual environment...
call .venv\Scripts\activate.bat
echo [OK] Virtual environment activated
echo.

echo Step 4: Upgrading pip...
python -m pip install --upgrade pip --quiet
echo [OK] pip upgraded
echo.

echo Step 5: Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Python dependencies installed
echo.

echo Step 6: Checking yt-dlp installation...
python -c "import yt_dlp; print('[OK] yt-dlp version:', yt_dlp.version.__version__)"
if %errorlevel% neq 0 (
    echo [ERROR] yt-dlp is not properly installed
    pause
    exit /b 1
)
echo.

echo Step 7: Checking ffmpeg availability...
where ffmpeg >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] ffmpeg is installed
    ffmpeg -version | findstr "ffmpeg version"
) else (
    echo [WARNING] ffmpeg is NOT installed
    echo.
    echo ffmpeg is recommended for better video quality merging.
    echo.
    echo To install ffmpeg on Windows:
    echo 1. Download from: https://www.gyan.dev/ffmpeg/builds/
    echo 2. Extract and add to PATH
    echo 3. Or use chocolatey: choco install ffmpeg
    echo 4. Or use scoop: scoop install ffmpeg
    echo.
    echo The API will work without ffmpeg but some high-quality formats may be unavailable.
    echo.
)
echo.

echo Step 8: Checking .env file...
if exist .env (
    echo [OK] .env file exists
) else (
    echo [WARNING] .env file not found
    echo Creating .env from .env.example...
    copy .env.example .env >nul
    echo [OK] .env file created
)
echo.

echo Step 9: Creating required directories...
if not exist tmp mkdir tmp
if not exist logs mkdir logs
echo [OK] Directories created
echo.

echo ============================================================
echo Setup Complete!
echo ============================================================
echo.
echo You can now start the API server with:
echo   npm run dev
echo.
echo Or manually:
echo   .venv\Scripts\activate
echo   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
echo.
pause
