from __future__ import annotations

import shutil
import time
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask

from .bot_protection import validate_content_type, validate_referer, validate_user_agent
from .config import settings
from .downloader import download_video, ffmpeg_available, get_metadata, yt_dlp_available
from .logging_config import log_cleanup, log_request
from .models import DownloadRequest, HealthResponse, MetadataRequest, MetadataResponse
from .rate_limiter import get_client_ip, rate_limiter
from .security import validate_public_url


app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    max_age=3600,  # Cache preflight requests for 1 hour
)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """
    Global middleware for rate limiting and bot protection.
    Applied to all endpoints except health check.
    """
    # Skip rate limiting for health check
    if request.url.path == "/health":
        return await call_next(request)

    # Get client IP
    client_ip = get_client_ip(request)

    # Bot protection for POST endpoints
    if request.method == "POST" and settings.enable_user_agent_validation:
        try:
            validate_user_agent(request)
            validate_content_type(request)
        except HTTPException as e:
            log_request(
                client_ip=client_ip,
                endpoint=request.url.path,
                status="blocked",
                reason=e.detail,
                user_agent=request.headers.get("User-Agent", ""),
            )
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail},
            )

    # Rate limiting
    if request.url.path == "/api/metadata":
        limit = settings.rate_limit_metadata
        window = settings.rate_limit_window_seconds
    elif request.url.path == "/api/download":
        limit = settings.rate_limit_download
        window = settings.rate_limit_window_seconds
    else:
        # No rate limit for other endpoints
        return await call_next(request)

    # Check rate limit
    is_allowed, info = rate_limiter.check_rate_limit(
        identifier=f"ip:{client_ip}:{request.url.path}",
        max_requests=limit,
        window_seconds=window,
    )

    if not is_allowed:
        reset_time = datetime.fromtimestamp(info["reset"], tz=timezone.utc)
        reset_str = reset_time.strftime("%Y-%m-%d %H:%M:%S UTC")

        log_request(
            client_ip=client_ip,
            endpoint=request.url.path,
            status="rate_limited",
            reason=f"Exceeded {limit} requests per hour",
            user_agent=request.headers.get("User-Agent", ""),
        )

        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": f"Rate limit exceeded. You can make {limit} requests per hour. Try again after {reset_str}",
                "retry_after": info["reset"] - int(time.time()),
                "reset_time": reset_str,
            },
            headers={
                "Retry-After": str(info["reset"] - int(time.time())),
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": str(info["remaining"]),
                "X-RateLimit-Reset": str(info["reset"]),
            },
        )

    # Add rate limit headers to response
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
    response.headers["X-RateLimit-Reset"] = str(info["reset"])

    return response


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        yt_dlp_available=yt_dlp_available(),
        ffmpeg_available=ffmpeg_available(),
        max_download_mb=settings.max_download_bytes // (1024 * 1024),
    )


@app.post("/api/metadata", response_model=MetadataResponse)
def metadata(request: MetadataRequest, req: Request) -> MetadataResponse:
    client_ip = get_client_ip(req)
    start_time = time.time()

    try:
        url = validate_public_url(str(request.url))
        result = get_metadata(url)

        duration_ms = (time.time() - start_time) * 1000
        log_request(
            client_ip=client_ip,
            endpoint="/api/metadata",
            url=url,
            status="success",
            user_agent=req.headers.get("User-Agent", ""),
            duration_ms=duration_ms,
        )

        return result

    except HTTPException as e:
        duration_ms = (time.time() - start_time) * 1000
        log_request(
            client_ip=client_ip,
            endpoint="/api/metadata",
            url=str(request.url),
            status="error",
            reason=e.detail,
            user_agent=req.headers.get("User-Agent", ""),
            duration_ms=duration_ms,
        )
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_msg = f"Unexpected error: {str(e)}"
        log_request(
            client_ip=client_ip,
            endpoint="/api/metadata",
            url=str(request.url),
            status="error",
            reason=error_msg,
            user_agent=req.headers.get("User-Agent", ""),
            duration_ms=duration_ms,
        )
        # Log the full traceback for debugging
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}. Check server logs for details.",
        )


@app.post("/api/download")
def download(request: DownloadRequest, req: Request) -> FileResponse:
    client_ip = get_client_ip(req)
    start_time = time.time()

    # Optional: Enforce referer validation for download endpoint
    if settings.enable_referer_validation:
        try:
            validate_referer(req, strict=False)
        except HTTPException as e:
            log_request(
                client_ip=client_ip,
                endpoint="/api/download",
                status="blocked",
                reason=e.detail,
                user_agent=req.headers.get("User-Agent", ""),
            )
            raise

    try:
        url = validate_public_url(str(request.url))
        file_path, filename, work_dir = download_video(url, request.format_id, request.quality)

        # Calculate file size
        filesize_mb = file_path.stat().st_size / (1024 * 1024)
        duration_ms = (time.time() - start_time) * 1000

        log_request(
            client_ip=client_ip,
            endpoint="/api/download",
            url=url,
            status="success",
            user_agent=req.headers.get("User-Agent", ""),
            duration_ms=duration_ms,
            filesize_mb=filesize_mb,
        )

        def cleanup():
            log_cleanup(client_ip, work_dir, "normal_completion")
            shutil.rmtree(work_dir, ignore_errors=True)

        return FileResponse(
            path=file_path,
            media_type="application/octet-stream",
            filename=filename,
            background=BackgroundTask(cleanup),
        )

    except HTTPException as e:
        duration_ms = (time.time() - start_time) * 1000
        log_request(
            client_ip=client_ip,
            endpoint="/api/download",
            url=str(request.url),
            status="error",
            reason=e.detail,
            user_agent=req.headers.get("User-Agent", ""),
            duration_ms=duration_ms,
        )
        raise
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        error_msg = f"Unexpected error: {str(e)}"
        log_request(
            client_ip=client_ip,
            endpoint="/api/download",
            url=str(request.url),
            status="error",
            reason=error_msg,
            user_agent=req.headers.get("User-Agent", ""),
            duration_ms=duration_ms,
        )
        # Log the full traceback for debugging
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}. Check server logs for details.",
        )


@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup."""
    # Create log directory if it doesn't exist
    settings.log_directory.mkdir(parents=True, exist_ok=True)
    # Create temp directory if it doesn't exist
    settings.temp_root.mkdir(parents=True, exist_ok=True)
