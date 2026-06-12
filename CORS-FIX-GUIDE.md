# CORS Error Fix Guide

## Problem
The error you're seeing:
```
Access to fetch at 'http://127.0.0.1:8000/api/metadata' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

This happens when the API server is either:
1. Not running
2. Not configured to allow requests from your frontend origin

## Solution Applied

### 1. Created `.env` file for API
Created `services/api/.env` with proper CORS configuration:
- Includes both `localhost:3000` and `127.0.0.1:3000`
- Disabled strict bot protection for development
- Configured local paths for temp files and logs

### 2. Enhanced CORS Middleware
Updated `services/api/app/main.py`:
- Added rate limit headers to exposed headers
- Added preflight request caching (max_age=3600)
- Ensures all CORS headers are properly sent

### 3. Created Easy Startup Script
Created `start-dev.bat` to launch both services with one click.

## How to Start Development Servers

### Option 1: Using the Batch File (Easiest)
1. Double-click `start-dev.bat` in the project root
2. Two command windows will open:
   - API Server on http://127.0.0.1:8000
   - Web Frontend on http://localhost:3000

### Option 2: Manual Start (Separate Windows)

**Terminal 1 - Start API:**
```bash
cd services/api
npm run dev
```

**Terminal 2 - Start Web Frontend:**
```bash
cd apps/web
npm run dev
```

## Verify It's Working

1. **Check API is running:**
   - Open: http://127.0.0.1:8000/health
   - Should see: `{"status":"ok", ...}`

2. **Check API Docs:**
   - Open: http://127.0.0.1:8000/docs
   - Should see interactive API documentation

3. **Test Frontend:**
   - Open: http://localhost:3000
   - Try downloading a video
   - Check browser console - no CORS errors should appear

## Troubleshooting

### API Won't Start
**Problem:** Python or dependencies missing
**Solution:**
```bash
cd services/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
npm run dev
```

### Still Getting CORS Errors
**Check these:**
1. API is actually running (visit http://127.0.0.1:8000/health)
2. Frontend is using the correct API URL (check `apps/web/.env.local`)
3. Both services are running (not just the frontend)
4. No firewall blocking localhost connections

### Port Already in Use
**Problem:** Port 8000 or 3000 already taken
**Solution:**
- Find and stop the process using the port
- Or change the port in the respective `.env` file

**Find what's using a port (Windows):**
```bash
netstat -ano | findstr :8000
netstat -ano | findstr :3000
```

## Development Best Practices

1. **Always start the API first** (before the frontend)
2. **Check browser console** for errors during development
3. **Use the API docs** at http://127.0.0.1:8000/docs to test endpoints
4. **Monitor both terminal windows** for errors

## Environment Variables

### API (`services/api/.env`)
- `CORS_ORIGINS`: Allowed frontend URLs
- `ENABLE_USER_AGENT_VALIDATION`: Set to `false` for dev
- `ENABLE_REFERER_VALIDATION`: Set to `false` for dev

### Web (`apps/web/.env.local`)
- `NEXT_PUBLIC_API_URL`: Must match API server URL (http://127.0.0.1:8000)
- `NEXT_PUBLIC_SITE_URL`: Your frontend URL (http://localhost:3000)

## Production Notes

When deploying to production:
1. Update `CORS_ORIGINS` in API `.env` to include your production domain
2. Set `ENABLE_USER_AGENT_VALIDATION=true`
3. Consider setting `ENABLE_REFERER_VALIDATION=true` for extra security
4. Use HTTPS URLs in production environment variables
