# Error Diagnosis & Solution

## Your Error Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. You open: http://localhost:3000                              │
│    Frontend loads successfully ✓                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. You paste a video URL and click "Analyze"                    │
│    Frontend makes request to: http://127.0.0.1:8000/api/metadata│
└─────────────────────────────────────────────────────────────────┘
                            ↓
                   ╔════════════════╗
                   ║  ERROR PATH    ║
                   ╚════════════════╝
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3a. CORS Error (First Error You See)                            │
│                                                                  │
│ Error: "Access to fetch at 'http://127.0.0.1:8000/api/metadata' │
│        from origin 'http://localhost:3000' has been blocked     │
│        by CORS policy"                                           │
│                                                                  │
│ Cause: API server is NOT running on port 8000                   │
│ Result: Browser blocks the request immediately                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3b. 500 Error (After You Start API)                             │
│                                                                  │
│ Error: "POST http://127.0.0.1:8000/api/metadata                 │
│        net::ERR_FAILED 500 (Internal Server Error)"             │
│                                                                  │
│ Cause: API is running but dependencies are missing              │
│ Result: API crashes when processing the request                 │
└─────────────────────────────────────────────────────────────────┘
```

## Root Causes

### Error 1: CORS (No 'Access-Control-Allow-Origin')
```
Frontend (localhost:3000)
    ↓ tries to fetch
    ↓
API (127.0.0.1:8000) ← NOT RUNNING!
    ↓
Browser: "No server responding, CORS error!"
```

**Why:** When nothing is listening on port 8000, browsers report it as a CORS issue.

**Fix:** Start the API server

---

### Error 2: 500 Internal Server Error
```
Frontend (localhost:3000)
    ↓ tries to fetch
    ↓
API (127.0.0.1:8000) ← RUNNING but...
    ↓ tries to import yt_dlp
    ↓
Python: "ModuleNotFoundError: No module named 'yt_dlp'" ← CRASH!
    ↓
Returns: 500 Internal Server Error
```

**Why:** API can't process requests because required Python packages aren't installed.

**Fix:** Install dependencies with `setup-and-fix.bat`

---

## Solution Path

```
                   ╔════════════════╗
                   ║ SOLUTION PATH  ║
                   ╚════════════════╝
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Install Dependencies                                    │
│                                                                  │
│ Run: fix-all-issues.bat                                         │
│                                                                  │
│ This installs:                                                   │
│  ✓ Python packages (yt-dlp, fastapi, uvicorn)                  │
│  ✓ Frontend packages (React, Next.js)                          │
│  ✓ Creates .env configuration files                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Services Start Automatically                            │
│                                                                  │
│ Terminal 1: API Server                                           │
│   services/api/.venv/Scripts/python.exe                         │
│   ↓ runs uvicorn                                                │
│   ↓ imports yt_dlp ✓                                           │
│   ↓ imports fastapi ✓                                          │
│   ✓ Listening on http://127.0.0.1:8000                         │
│                                                                  │
│ Terminal 2: Frontend                                             │
│   ✓ Next.js running on http://localhost:3000                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Everything Works!                                       │
│                                                                  │
│ Frontend (localhost:3000)                                        │
│     ↓ makes request                                             │
│     ↓                                                            │
│ API (127.0.0.1:8000) ← RUNNING ✓                               │
│     ↓ has yt-dlp ✓                                             │
│     ↓ processes request ✓                                       │
│     ↓ returns metadata ✓                                        │
│     ↓                                                            │
│ Frontend receives data ✓                                         │
│     ↓ displays video info ✓                                     │
│     ↓ downloads work ✓                                          │
│     ↓                                                            │
│ ✓ NO CORS ERRORS                                                │
│ ✓ NO 500 ERRORS                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dependency Chain

### What the API Needs:
```
API Server (app/main.py)
├─ FastAPI ← Python package
├─ Uvicorn ← Python package
├─ yt-dlp ← Python package (THIS IS CRITICAL!)
│   └─ Downloads videos from social media
├─ slowapi ← Python package (rate limiting)
└─ python-multipart ← Python package

If ANY of these are missing → 500 Error!
```

### How Dependencies Get Installed:
```
fix-all-issues.bat
    ↓ runs
services/api/setup-and-fix.bat
    ↓ creates
.venv/ (virtual environment)
    ↓ installs into
.venv/Lib/site-packages/
    ├─ fastapi/
    ├─ uvicorn/
    ├─ yt_dlp/ ← CRITICAL!
    ├─ slowapi/
    └─ multipart/
```

---

## Configuration Flow

### 1. API Configuration (`.env` file)
```
services/api/.env
├─ CORS_ORIGINS=http://localhost:3000,... ← Allows frontend
├─ ENABLE_USER_AGENT_VALIDATION=false     ← Relaxed for dev
└─ ENABLE_REFERER_VALIDATION=false        ← Relaxed for dev
```

### 2. Frontend Configuration (`.env.local` file)
```
apps/web/.env.local
└─ NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 ← Points to API
```

### 3. They Must Match!
```
Frontend config:           NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
                                    ↓
                          Frontend makes request to
                                    ↓
API must be listening on:  http://127.0.0.1:8000 ✓
API must allow origin:     http://localhost:3000 ✓ (in .env)
```

---

## Verification Steps

### ✓ Step 1: Check Python
```bash
python --version
```
Should show: `Python 3.8.x` or higher

### ✓ Step 2: Check Virtual Environment
```bash
dir services\api\.venv
```
Should exist after running `setup-and-fix.bat`

### ✓ Step 3: Check Dependencies
```bash
cd services\api
.venv\Scripts\activate
pip list
```
Should show: fastapi, uvicorn, yt-dlp, slowapi, python-multipart

### ✓ Step 4: Check API Running
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000
```
Should show a process ID

### ✓ Step 5: Check API Health
```
Open: http://127.0.0.1:8000/health
```
Should return:
```json
{
  "status": "ok",
  "yt_dlp_available": true,
  "ffmpeg_available": true,
  "max_download_mb": 250
}
```

If `yt_dlp_available` is `false` → Dependencies not installed!

### ✓ Step 6: Test Full Flow
1. Open http://localhost:3000
2. Paste URL: `https://www.tiktok.com/@username/video/1234567890`
3. Click "Analyze video"
4. Check browser console (F12):
   - ❌ No CORS errors
   - ❌ No 500 errors
   - ✓ Request completes successfully

---

## Quick Diagnosis

### Symptom: CORS Error
**Diagnosis:** API not running
**Command:** `netstat -ano | findstr :8000`
**Expected:** Should show process ID
**Fix:** `start-dev.bat`

### Symptom: 500 Error
**Diagnosis:** Dependencies missing
**Command:** `cd services\api && .venv\Scripts\activate && python -c "import yt_dlp"`
**Expected:** No error
**Fix:** `cd services\api && setup-and-fix.bat`

### Symptom: "ModuleNotFoundError"
**Diagnosis:** Virtual environment not used
**Command:** `where python` (should point to .venv)
**Expected:** `.venv\Scripts\python.exe`
**Fix:** `npm run dev` (uses .venv automatically)

---

## Summary

```
┌──────────────────────┐
│ YOUR ISSUE:          │
│ CORS + 500 Errors    │
└──────────────────────┘
         ↓
┌──────────────────────┐
│ ROOT CAUSE:          │
│ Missing dependencies │
└──────────────────────┘
         ↓
┌──────────────────────┐
│ SOLUTION:            │
│ fix-all-issues.bat   │
└──────────────────────┘
         ↓
┌──────────────────────┐
│ RESULT:              │
│ ✓ Everything works!  │
└──────────────────────┘
```

## Action Required

**Run this now:**
```bash
fix-all-issues.bat
```

Then open: http://localhost:3000

**Done!** 🎉
