from __future__ import annotations

import shutil

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from .config import settings
from .downloader import download_video, ffmpeg_available, get_metadata, yt_dlp_available
from .models import DownloadRequest, HealthResponse, MetadataRequest, MetadataResponse
from .security import validate_public_url


app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        yt_dlp_available=yt_dlp_available(),
        ffmpeg_available=ffmpeg_available(),
        max_download_mb=settings.max_download_bytes // (1024 * 1024),
    )


@app.post("/api/metadata", response_model=MetadataResponse)
def metadata(request: MetadataRequest) -> MetadataResponse:
    url = validate_public_url(str(request.url))
    return get_metadata(url)


@app.post("/api/download")
def download(request: DownloadRequest) -> FileResponse:
    url = validate_public_url(str(request.url))
    file_path, filename, work_dir = download_video(url, request.format_id, request.quality)
    return FileResponse(
        path=file_path,
        media_type="application/octet-stream",
        filename=filename,
        background=BackgroundTask(lambda: shutil.rmtree(work_dir, ignore_errors=True)),
    )
