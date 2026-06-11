# 🏗️ System Architecture

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / CLIENTS                          │
│        (Web Browsers: Chrome, Safari, Firefox, Edge)            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CDN / EDGE NETWORK                          │
│                      (Vercel Edge Network)                       │
│                   - Static asset caching                         │
│                   - Global distribution                          │
│                   - SSL termination                              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               FRONTEND - Next.js Application                     │
│                 (Hosted on Vercel)                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Page Components                                          │  │
│  │  - Home page (main downloader UI)                        │  │
│  │  - About page                                            │  │
│  │  - Privacy policy                                        │  │
│  │  - Terms of service                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React Components                                         │  │
│  │  - URL input with clipboard paste                        │  │
│  │  - Platform detector                                     │  │
│  │  - Metadata display (thumbnail, title, duration)         │  │
│  │  - Format selector                                       │  │
│  │  - Download button with progress                         │  │
│  │  - Footer with links                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  State Management                                         │  │
│  │  - React useState hooks                                  │  │
│  │  - Form handling                                         │  │
│  │  - Loading states                                        │  │
│  │  - Error handling                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ REST API (JSON)
                 │ POST /api/metadata
                 │ POST /api/download
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND - FastAPI Application                      │
│                 (Hosted on Railway)                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  API Endpoints                                            │  │
│  │  - GET  /health           (health check)                 │  │
│  │  - POST /api/metadata     (get video info)               │  │
│  │  - POST /api/download     (download video)               │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Security Layer                                           │  │
│  │  - URL validation                                        │  │
│  │  - Private IP blocking                                   │  │
│  │  - CORS middleware                                       │  │
│  │  - Rate limiting (future)                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Business Logic                                           │  │
│  │  - Video metadata extraction                             │  │
│  │  - Format selection                                      │  │
│  │  - Quality optimization                                  │  │
│  │  - Error handling                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  yt-dlp Integration                                       │  │
│  │  - Platform extractor selection                          │  │
│  │  - Video download                                        │  │
│  │  - Format merging (video + audio)                        │  │
│  │  - Error translation                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  File Management                                          │  │
│  │  - Temporary directory creation                          │  │
│  │  - File streaming                                        │  │
│  │  - Background cleanup                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP Requests
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SOCIAL MEDIA PLATFORMS                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ TikTok   │ │Instagram │ │ Facebook │ │ YouTube  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Twitter  │ │ Reddit   │ │ Vimeo    │ │   +995   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  Public video APIs and scraping endpoints                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagrams

### 1️⃣ Metadata Extraction Flow

```
User pastes URL
       ↓
Frontend validates input
       ↓
POST /api/metadata {"url": "https://..."}
       ↓
Backend receives request
       ↓
Security: validate_public_url(url)
├─ Check protocol (HTTP/HTTPS only)
├─ Check for private IPs
├─ Check for localhost
└─ DNS resolution check
       ↓
yt-dlp: extract_info(url, download=False)
├─ Select platform extractor
├─ Fetch video metadata
├─ Parse available formats
└─ Check for errors
       ↓
Format metadata response
├─ title, thumbnail, duration
├─ platform name
├─ available formats (id, resolution, size)
└─ warnings (ffmpeg, etc.)
       ↓
Return JSON to frontend
       ↓
Frontend displays:
├─ Video thumbnail
├─ Title and duration
├─ Platform badge
├─ Format selection buttons
└─ Download button enabled
```

---

### 2️⃣ Video Download Flow

```
User clicks "Download video"
       ↓
Frontend sends download request
POST /api/download {
  "url": "https://...",
  "quality": "best",
  "format_id": "http-1080"
}
       ↓
Backend receives request
       ↓
Security: validate_public_url(url)
       ↓
Create temporary directory
/tmp/downloads/socialdl-abc123/
       ↓
yt-dlp: extract_info(url, download=True)
├─ Select format (by ID or quality)
├─ Download video stream
├─ Download audio stream (if separate)
├─ Merge with ffmpeg (if needed)
└─ Save to temp directory
       ↓
Find downloaded file
├─ Scan temp directory
├─ Select largest file
└─ Get final filename
       ↓
Stream file to client
├─ Set Content-Disposition header
├─ Set media type (video/mp4)
├─ Stream file bytes
└─ Schedule background cleanup
       ↓
Browser receives file stream
├─ Create blob URL
├─ Trigger download
└─ Save to Downloads folder
       ↓
Background cleanup task
├─ Wait for streaming to complete
└─ Delete temp directory recursively
       ↓
User has video file! ✅
```

---

## 🗄️ Data Models

### Request Models (Pydantic)

```python
# Metadata Request
class MetadataRequest:
    url: HttpUrl  # Validated URL

# Download Request
class DownloadRequest:
    url: HttpUrl
    format_id: str | None  # Optional specific format
    quality: "best" | "medium" | "audio"
```

### Response Models

```python
# Format Information
class FormatInfo:
    format_id: str        # "http-1080"
    label: str            # "1080p · MP4 · 15.2 MB"
    ext: str | None       # "mp4"
    resolution: str | None # "1080p"
    filesize: int | None  # 15932416 bytes
    vcodec: str | None    # "h264"
    acodec: str | None    # "aac"

# Metadata Response
class MetadataResponse:
    title: str
    webpage_url: str
    platform: str
    thumbnail: str | None
    duration: int | None      # seconds
    formats: list[FormatInfo]
    warnings: list[str]

# Health Response
class HealthResponse:
    status: "ok"
    yt_dlp_available: bool
    ffmpeg_available: bool
    max_download_mb: int
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                        │
└─────────────────────────────────────────────────────────┘

Layer 1: Network Level
├─ Vercel DDoS Protection
├─ Railway Infrastructure Security
└─ HTTPS Everywhere (TLS 1.2+)

Layer 2: Application Gateway (CORS)
├─ Allowed Origins Whitelist
├─ Credentials: False
├─ Methods: GET, POST, OPTIONS
└─ Headers: All allowed for flexibility

Layer 3: URL Validation
├─ Protocol Check (HTTP/HTTPS only)
│   ├─ Block: ftp://, file://, javascript:
│   └─ Allow: http://, https://
├─ Hostname Validation
│   ├─ Block: localhost, 127.0.0.1
│   ├─ Block: Private IPs (10.x, 172.16.x, 192.168.x)
│   ├─ Block: Link-local (169.254.x.x)
│   └─ Block: Reserved IP ranges
└─ DNS Resolution Check
    ├─ Resolve hostname to IP
    └─ Verify IP is public

Layer 4: Rate Limiting (Future)
├─ Per IP: 100 requests/hour
├─ Per endpoint: 20 requests/minute
└─ Global: 1000 requests/hour

Layer 5: Resource Limits
├─ Max file size: 250 MB
├─ Download timeout: 5 minutes
├─ Socket timeout: 20 seconds
└─ Temp file cleanup: Immediate after stream

Layer 6: Error Handling
├─ Generic error messages (no info leak)
├─ Logging with correlation IDs
└─ Sanitized error responses
```

---

## 💾 Storage Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FILE STORAGE                           │
└─────────────────────────────────────────────────────────┘

Temporary Storage (Railway)
/tmp/downloads/
├─ socialdl-abc123/           ← Request 1
│   └─ video-title-id.mp4
├─ socialdl-def456/           ← Request 2
│   └─ video-title-id.mp4
└─ socialdl-ghi789/           ← Request 3
    └─ video-title-id.mp4

Lifecycle:
1. Create unique temp directory
2. Download video to temp directory
3. Stream file to client
4. Delete temp directory (background task)

Retention:
- Active: During download/stream
- Cleanup: Immediate after stream completes
- Orphaned files: Cleaned on next restart

Static Assets (Vercel CDN)
/public/
├─ favicon.ico
├─ logo.svg
└─ images/
    ├─ platform-icons/
    └─ promotional/

Cached:
- Edge locations worldwide
- Automatic optimization
- Gzip/Brotli compression
```

---

## 🔄 Deployment Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                 CI/CD PIPELINE                           │
└─────────────────────────────────────────────────────────┘

Developer
    ↓ git push origin main
GitHub Repository
    ↓ Webhook triggers
┌───────────────┐           ┌───────────────┐
│ GitHub Actions│           │               │
│  ├─ Lint      │           │               │
│  ├─ Test      │           │               │
│  └─ Build     │           │               │
└───────┬───────┘           │               │
        ↓                   │               │
    ✅ Success              │               │
        ↓                   │               │
┌───────────────┐           ┌───────────────┐
│ Vercel Deploy │           │Railway Deploy │
│               │           │               │
│ 1. Clone      │           │ 1. Clone      │
│ 2. Install    │           │ 2. Build      │
│ 3. Build      │           │    Dockerfile │
│ 4. Deploy     │           │ 3. Push image │
│    to Edge    │           │ 4. Deploy     │
└───────┬───────┘           └───────┬───────┘
        ↓                           ↓
   ┌─────────┐               ┌──────────┐
   │Frontend │               │ Backend  │
   │  Live   │               │   Live   │
   └─────────┘               └──────────┘
        ↓                           ↓
    Users can access the updated application
```

---

## 📊 Monitoring & Observability

```
┌─────────────────────────────────────────────────────────┐
│              MONITORING ARCHITECTURE                     │
└─────────────────────────────────────────────────────────┘

Frontend Monitoring (Vercel)
├─ Page Load Times
├─ Core Web Vitals (LCP, FID, CLS)
├─ Error tracking
├─ Geographic distribution
└─ Browser analytics

Backend Monitoring (Railway)
├─ CPU usage
├─ Memory usage
├─ Network I/O
├─ Request latency
├─ Error rates
└─ Logs (stdout/stderr)

Application Logging
├─ Request logging
│   ├─ URL (sanitized)
│   ├─ Response time
│   ├─ Status code
│   └─ Error messages
├─ Download metrics
│   ├─ File size
│   ├─ Platform
│   ├─ Format selected
│   └─ Success/failure
└─ Security events
    ├─ Blocked IPs
    ├─ Invalid URLs
    └─ Rate limit hits (future)
```

---

## 🔧 Technology Stack Details

### Frontend Technologies
```
Next.js 16.2.6
├─ App Router (file-based routing)
├─ React Server Components
├─ Image Optimization
├─ Font Optimization (Geist)
└─ Automatic Code Splitting

React 19.2.4
├─ Hooks (useState, useEffect, useMemo)
├─ Client Components ("use client")
└─ Form handling

Tailwind CSS 4
├─ Utility-first styling
├─ Custom color palette
├─ Responsive design
└─ PostCSS processing

TypeScript 5
├─ Type safety
├─ IntelliSense support
└─ Compile-time error checking

Lucide React
└─ Modern icon library (tree-shakeable)
```

### Backend Technologies
```
FastAPI 0.136
├─ Async/await support
├─ Automatic API docs (/docs)
├─ Pydantic validation
├─ OpenAPI schema generation
└─ CORS middleware

Uvicorn
├─ ASGI server
├─ HTTP/1.1 support
├─ WebSocket support
└─ Hot reload (development)

yt-dlp 2026.3.17
├─ 1000+ site extractors
├─ Format selection
├─ Metadata extraction
└─ Active maintenance

ffmpeg
├─ Video/audio merging
├─ Format conversion
├─ Quality optimization
└─ Codec support

Python 3.11
├─ Type hints
├─ async/await
├─ dataclasses
└─ Performance improvements
```

---

## 🌐 Infrastructure

### Vercel (Frontend)
```
Global Edge Network
├─ 100+ edge locations
├─ Automatic SSL
├─ DDoS protection
└─ Instant cache invalidation

Features:
├─ Zero-config deployment
├─ Preview deployments (PRs)
├─ Analytics included
└─ Environment variables
```

### Railway (Backend)
```
Container Platform
├─ Automatic Dockerfile detection
├─ Auto-scaling
├─ Health checks
└─ Automatic SSL

Features:
├─ One-click deploy
├─ Environment variables
├─ Custom domains
└─ Logs & metrics
```

---

This architecture provides:
✅ **Scalability** - Handle traffic spikes  
✅ **Security** - Multiple protection layers  
✅ **Reliability** - Auto-healing and backups  
✅ **Performance** - Global CDN and caching  
✅ **Maintainability** - Clean separation of concerns  

