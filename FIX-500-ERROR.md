# Fix 500 Internal Server Error

## Current Issue
You're seeing a **500 Internal Server Error** when trying to analyze videos. This means the API server is running but crashing when processing requests.

## Most Common Causes

### 1. Missing Python Dependencies (Most Likely)
The API requires `yt-dlp` and other Python packages to be installed.

**Solution:**
```bash
cd services\api
setup-and-fix.bat
```

This script will:
- ✅ Check Python installation
- ✅ Create virtual environment
- ✅ Install all required dependencies
- ✅ Check for yt-dlp
- ✅ Check for ffmpeg
- ✅ Create required directories

### 2. yt-dlp Not Installed or Outdated

**Check if yt-dlp is installed:**
```bash
cd services\api
.venv\Scripts\activate
python -c "import yt_dlp; print(yt_dlp.version.__version__)"
```

**If missing, install it:**
```bash
cd services\api
.venv\Scripts\activate
pip install yt-dlp[default]>=2026.3.17
```

### 3. Virtual Environment Not Activated

The API must run in its virtual environment where dependencies are installed.

**Wrong way (causes 500 error):**
```bash
cd services\api
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**Correct way:**
```bash
cd services\api
.venv\Scripts\activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Or use the npm script (recommended):**
```bash
cd services\api
npm run dev
```

The npm script automatically uses the virtual environment.

### 4. Missing ffmpeg (Warning, not critical)

ffmpeg is recommended but not required. Without it, some high-quality merged formats won't work.

**Check if installed:**
```bash
ffmpeg -version
```

**Install on Windows:**

**Option A - Chocolatey:**
```bash
choco install ffmpeg
```

**Option B - Scoop:**
```bash
scoop install ffmpeg
```

**Option C - Manual:**
1. Download from: https://www.gyan.dev/ffmpeg/builds/
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your PATH

## Step-by-Step Fix

### Step 1: Run the Setup Script
```bash
cd services\api
setup-and-fix.bat
```

Wait for it to complete. It will show you what's installed and what's missing.

### Step 2: Stop the Current API Server
If the API is currently running and showing 500 errors:
1. Find the terminal window running the API
2. Press `Ctrl + C` to stop it
3. Close that terminal

### Step 3: Start the API Properly
```bash
cd services\api
npm run dev
```

Watch the terminal output for errors.

### Step 4: Verify It Works
Open: http://127.0.0.1:8000/health

**Should see:**
```json
{
  "status": "ok",
  "yt_dlp_available": true,
  "ffmpeg_available": true,
  "max_download_mb": 250
}
```

If `yt_dlp_available` is `false`, dependencies are not properly installed.

### Step 5: Test the Frontend
1. Open: http://localhost:3000
2. Paste a video URL
3. Click "Analyze video"
4. Should work without 500 errors!

## Check Server Logs

The API now provides better error messages. Check the terminal where the API is running for detailed error traces.

**Common error messages and fixes:**

### Error: "ModuleNotFoundError: No module named 'yt_dlp'"
**Fix:** Run `setup-and-fix.bat` or manually install dependencies:
```bash
cd services\api
.venv\Scripts\activate
pip install -r requirements.txt
```

### Error: "ModuleNotFoundError: No module named 'fastapi'"
**Fix:** Virtual environment not activated or dependencies not installed:
```bash
cd services\api
setup-and-fix.bat
```

### Error: "[WinError 2] The system cannot find the file specified"
**Fix:** This usually means the script is trying to run Python but can't find it:
```bash
# Check Python installation
python --version

# If not found, install Python from python.org
# Make sure to check "Add Python to PATH" during installation
```

## Alternative: Manual Dependency Installation

If the setup script doesn't work:

### 1. Create Virtual Environment
```bash
cd services\api
python -m venv .venv
```

### 2. Activate Virtual Environment
```bash
.venv\Scripts\activate
```

### 3. Upgrade pip
```bash
python -m pip install --upgrade pip
```

### 4. Install Dependencies
```bash
pip install fastapi>=0.136
pip install uvicorn[standard]>=0.35
pip install "yt-dlp[default]>=2026.3.17"
pip install slowapi>=0.1.9
pip install python-multipart>=0.0.9
```

### 5. Verify Installation
```bash
python -c "import fastapi; print('FastAPI:', fastapi.__version__)"
python -c "import yt_dlp; print('yt-dlp:', yt_dlp.version.__version__)"
```

### 6. Start Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Updated Files

I've enhanced error handling in the API:
- ✅ Better error messages with stack traces
- ✅ More detailed logging
- ✅ Helpful error responses

The server will now show you exactly what went wrong in the terminal.

## Quick Verification Commands

**Check Python:**
```bash
python --version
```

**Check if API virtual environment exists:**
```bash
dir services\api\.venv
```

**Check if dependencies are installed:**
```bash
cd services\api
.venv\Scripts\activate
pip list
```

Should show: fastapi, uvicorn, yt-dlp, slowapi, python-multipart

## Starting Fresh

If nothing works, completely reset:

### 1. Delete Virtual Environment
```bash
cd services\api
rmdir /s /q .venv
```

### 2. Run Setup
```bash
setup-and-fix.bat
```

### 3. Start Server
```bash
npm run dev
```

## Testing Without the Frontend

Use the API docs interface to test directly:

1. Start API: `cd services\api && npm run dev`
2. Open: http://127.0.0.1:8000/docs
3. Try the `/health` endpoint first
4. Then try `/api/metadata` with a test URL like:
   ```json
   {
     "url": "https://www.tiktok.com/@test/video/1234567890"
   }
   ```

This bypasses any frontend issues and tests the API directly.

## Summary

The 500 error is almost always due to:
1. **Missing Python dependencies** → Run `setup-and-fix.bat`
2. **Virtual environment not activated** → Use `npm run dev`
3. **yt-dlp not installed** → Run setup script

After running `setup-and-fix.bat`, the API should work correctly!

## Need Help?

1. Run `setup-and-fix.bat` and copy the output
2. Start the API with `npm run dev` and copy any error messages
3. Check the terminal output for specific error details
4. The enhanced error handling now shows exactly what went wrong
