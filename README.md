# Social Video Downloader (ReelSave)

## ⚠️ IMPORTANT - Fix CORS & 500 Errors

If you're seeing these errors:
```
❌ CORS policy: No 'Access-Control-Allow-Origin' header
❌ 500 (Internal Server Error)
```

**SOLUTION:** Run this command to fix everything automatically:
```bash
fix-all-issues.bat
```

This will:
- ✅ Install all Python dependencies (yt-dlp, fastapi, etc.)
- ✅ Install all frontend dependencies
- ✅ Create proper configuration files
- ✅ Start both API and frontend servers

**After running, wait 10-15 seconds then visit:** http://localhost:3000

---

## Quick Start - Fix CORS Error

If you're seeing this error:
```
Access to fetch at 'http://127.0.0.1:8000/api/metadata' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Root Cause:** The API server is not running or dependencies are missing.

### Solution 1: Complete Fix (Recommended)
Double-click: `fix-all-issues.bat`

### Solution 2: Manual Fix
```bash
# Terminal 1 - Setup and Start API
cd services/api
setup-and-fix.bat
npm run dev

# Terminal 2 - Start Frontend
cd apps/web
npm run dev
```

### Verify it's working:
- API Health: http://127.0.0.1:8000/health (should show `{"status":"ok"}`)
- API Docs: http://127.0.0.1:8000/docs  
- Frontend: http://localhost:3000

### Need Help?
📖 **Complete Guide:** Read `SOLUTION-SUMMARY.md`
📖 **500 Error Fix:** Read `FIX-500-ERROR.md`
📖 **Quick Start:** Read `START-HERE.md`

Run `check-services.bat` to diagnose any issues!

---

# Social Video Downloader

A modern two-service downloader for public social media videos.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Features

- 📹 Download videos from TikTok, Instagram, Facebook, YouTube Shorts, and more
- 🎨 Modern, responsive UI built with Next.js and Tailwind CSS
- ⚡ Fast API powered by FastAPI and yt-dlp
- 🔒 Security-first: Public links only, no credentials collected
- 📦 Multiple quality options and format selection
- 🧹 Automatic cleanup of temporary files
- 🌐 SEO optimized with structured data

## 🏗️ Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11, yt-dlp, Uvicorn
- **Package Manager**: pnpm workspace
- **Deployment**: Vercel (frontend) + Railway (backend)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and pnpm
- Python 3.11+
- ffmpeg (optional but recommended)
- Git

### Local Development

```powershell
# Clone the repository
git clone https://github.com/yourusername/social-video-downloader.git
cd social-video-downloader

# Install dependencies
pnpm install

# Setup Python environment
python -m venv services/api/.venv
services\api\.venv\Scripts\activate
pip install -r services/api/requirements.txt -r services/api/requirements-dev.txt

# Run both services in development mode
pnpm dev
```

This starts:
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://127.0.0.1:8000
- 📚 API Docs: http://127.0.0.1:8000/docs

### Environment Variables

**Backend** (`services/api/.env`):
```env
MAX_DOWNLOAD_BYTES=262144000
DOWNLOAD_TIMEOUT_SECONDS=300
SOCKET_TIMEOUT_SECONDS=20
DOWNLOAD_TEMP_ROOT=./tmp
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## 📦 Project Structure

```
social-video-downloader/
├── apps/
│   └── web/                 # Next.js frontend
│       ├── src/
│       │   ├── app/        # App Router pages
│       │   └── components/ # React components
│       └── public/         # Static assets
│
├── services/
│   └── api/                # FastAPI backend
│       ├── app/
│       │   ├── main.py           # API endpoints
│       │   ├── downloader.py     # yt-dlp integration
│       │   ├── models.py         # Pydantic models
│       │   ├── security.py       # URL validation
│       │   └── config.py         # Configuration
│       ├── tests/                # Pytest tests
│       └── Dockerfile            # Container config
│
└── Root configuration files
```

## 🧪 Testing

```powershell
# Run API tests
pnpm test

# Or with pytest directly
cd services/api
pytest

# Run frontend linting
pnpm lint
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel + Railway

1. **Deploy Backend to Railway**:
   - Push code to GitHub
   - Connect Railway to your repo
   - Set root directory: `services/api`
   - Add environment variables
   - Deploy (uses Dockerfile)

2. **Deploy Frontend to Vercel**:
   - Connect Vercel to your repo
   - Set root directory: `apps/web`
   - Add environment variable: `NEXT_PUBLIC_API_BASE_URL`
   - Deploy

3. **Add Custom Domain** (optional):
   - Configure DNS records
   - Add domain in Vercel/Railway dashboard
   - Auto SSL certificates generated

## 🔌 API Endpoints

### `GET /health`
Check API status and dependencies

### `POST /api/metadata`
Get video metadata without downloading
```json
{
  "url": "https://www.tiktok.com/@user/video/123"
}
```

### `POST /api/download`
Download video with specified quality
```json
{
  "url": "https://www.tiktok.com/@user/video/123",
  "quality": "best",
  "format_id": null
}
```

**Quality Options**: `best` | `medium` | `audio`

## 🎨 Features

### Frontend
- 🔗 Auto-detect social media platforms
- 📋 Clipboard paste integration
- 📊 Video metadata preview (thumbnail, title, duration)
- 🎬 Format selection (resolution, codec, file size)
- ⚙️ Quality presets (Best, Medium, Audio only)
- 📱 Fully responsive mobile design
- ♿ Accessibility compliant
- 🔍 SEO optimized with JSON-LD structured data

### Backend
- 🚀 Fast async API with FastAPI
- 🎥 Support for 1000+ sites via yt-dlp
- 🔒 URL security validation (blocks private IPs)
- 📏 Configurable file size limits
- ⏱️ Timeout protection
- 🧹 Automatic temporary file cleanup
- 🌐 CORS configuration
- 🎬 ffmpeg integration for best quality merging

## 🔒 Security

- ✅ Public URLs only (no login/cookies)
- ✅ Private IP and localhost blocking
- ✅ SSRF protection
- ✅ File size limits
- ✅ Timeout protection
- ✅ CORS configuration
- ✅ HTTPS enforced in production
- ✅ No user data storage

## 📝 Supported Platforms

Via yt-dlp, supports 1000+ websites including:
- TikTok
- Instagram (Videos, Reels, Stories)
- Facebook
- YouTube Shorts
- Twitter/X
- Reddit
- Pinterest
- Vimeo
- Dailymotion
- LinkedIn
- And many more...

## ⚠️ Important Notes

- This app supports **public links only**
- Cannot bypass logins, private accounts, DRM, or paywalls
- Social platforms change frequently; yt-dlp must be updated
- Users must respect copyright and platform terms of service
- No content is stored permanently

## 📜 Scripts

```json
{
  "dev": "Run all services in development",
  "dev:web": "Run frontend only",
  "dev:api": "Run backend only",
  "build": "Build frontend for production",
  "lint": "Lint frontend code",
  "test": "Run backend tests",
  "check": "Run lint + tests"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Universal video downloader
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Deployment platform
- [Railway](https://railway.app/) - Backend hosting

## 📞 Support

- 📧 Email: support@codeoralabs.com
- 🌐 Website: https://codeoralabs.com
- 📖 Documentation: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## ⚖️ Legal Disclaimer

This tool is provided for personal use only. Users are responsible for:
- Respecting copyright laws
- Following platform terms of service
- Obtaining necessary permissions for content use
- Compliance with local laws and regulations

We do not host, store, or distribute copyrighted content.

---

Made with ❤️ by [Codeora Labs](https://codeoralabs.com)
