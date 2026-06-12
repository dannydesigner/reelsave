# 🚀 START HERE - Fix Download & CORS Errors

## Problem You're Facing
Downloads fail with this error in the browser console:
```
Access to fetch at 'http://127.0.0.1:8000/api/metadata' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Why This Happens
The **API server is not running**. The frontend tries to call the API, but nothing is listening on port 8000.

---

## ✅ SOLUTION (Choose One)

### Solution A: One-Click Start (Recommended)
1. **Double-click** `start-dev.bat` in the project root
2. Wait 5-10 seconds for both services to start
3. Open http://localhost:3000 in your browser
4. Try downloading a video - it should work now!

### Solution B: Manual Start (Two Terminals)

**Terminal 1 - API Server:**
```bash
cd services\api
npm run dev
```
Wait until you see: `Uvicorn running on http://127.0.0.1:8000`

**Terminal 2 - Frontend:**
```bash
cd apps\web
npm run dev
```
Wait until you see: `Ready on http://localhost:3000`

---

## 🔍 Verify Everything Works

### 1. Check API is Running
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

### 2. Check API Documentation
Open: http://127.0.0.1:8000/docs

You should see interactive API documentation (Swagger UI)

### 3. Test the Frontend
1. Open: http://localhost:3000
2. Paste a TikTok or Instagram video URL
3. Click "Analyze video"
4. Click "Download video"
5. **No CORS errors should appear!**

---

## 🛠️ Troubleshooting

### API Won't Start - Missing Python Dependencies

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Fix:**
```bash
cd services\api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
npm run dev
```

### Port 8000 Already in Use

**Find what's using it:**
```bash
netstat -ano | findstr :8000
```

**Kill the process:**
```bash
taskkill /PID <process_id> /F
```

Or change the port in `services/api/app/main.py`:
```python
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Changed to 8001
```

Then update `apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
```

### Frontend Won't Start - Missing Dependencies

**Error:** `Cannot find module 'next'`

**Fix:**
```bash
cd apps\web
npm install
npm run dev
```

### Still Getting CORS Errors After Starting API

**Check these:**
1. ✅ API is actually running (visit http://127.0.0.1:8000/health)
2. ✅ No firewall blocking localhost
3. ✅ Using the correct URL in frontend (check `apps/web/.env.local`)
4. ✅ Browser cache cleared (Ctrl + Shift + Delete)

**Verify CORS is configured:**
```bash
# Check the API .env file exists
dir services\api\.env
```

If it doesn't exist, it was just created for you with proper CORS settings.

---

## 📱 Use the Helper Scripts

### `check-services.bat`
Diagnoses which services are running and tests the API endpoint
```bash
check-services.bat
```

### `start-dev.bat`
Starts both services automatically
```bash
start-dev.bat
```

---

## 🎯 Files Changed to Fix Your Issue

1. **Created:** `services/api/.env`
   - Added proper CORS origins for localhost
   - Disabled strict bot protection for development
   - Configured local file paths

2. **Updated:** `services/api/app/main.py`
   - Enhanced CORS middleware configuration
   - Added preflight request caching
   - Exposed rate limit headers

3. **Created:** Helper scripts
   - `start-dev.bat` - One-click startup
   - `check-services.bat` - Health checker
   - This guide!

---

## 📚 Additional Documentation

- **Full CORS Guide:** `CORS-FIX-GUIDE.md`
- **Project Overview:** `README.md`
- **Deployment Guide:** `DEPLOYMENT.md`

---

## 💡 Development Tips

1. **Always start the API before the frontend**
2. **Check browser console** for errors (F12)
3. **Use API docs** at http://127.0.0.1:8000/docs for testing
4. **Monitor terminal output** for error messages
5. **Restart services** if you change `.env` files

---

## ✨ What Changed in the Fix

### CORS Configuration
The API now explicitly allows requests from:
- `http://localhost:3000` ✅
- `http://127.0.0.1:3000` ✅
- Production domains

### Bot Protection
Temporarily disabled for local development:
- `ENABLE_USER_AGENT_VALIDATION=false`
- `ENABLE_REFERER_VALIDATION=false`

### Middleware Enhancement
Added proper CORS headers including:
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`
- Rate limit headers exposure

---

## 🎉 You're All Set!

Now you can:
- ✅ Download TikTok videos without watermark
- ✅ Save Instagram Reels
- ✅ Extract Facebook videos
- ✅ No CORS errors!

**Need help?** Check the error messages in:
- Browser console (F12)
- API terminal output
- Frontend terminal output
