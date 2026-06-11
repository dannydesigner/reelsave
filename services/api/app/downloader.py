from __future__ import annotations

import glob
import os
import shutil
import tempfile
from pathlib import Path
from typing import Any

from fastapi import HTTPException, status
from yt_dlp import DownloadError, YoutubeDL

from .config import settings
from .models import FormatInfo, MetadataResponse, Quality


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def yt_dlp_available() -> bool:
    try:
        import yt_dlp  # noqa: F401
    except Exception:
        return False
    return True


def _base_options() -> dict[str, Any]:
    return {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "socket_timeout": settings.socket_timeout_seconds,
        "max_filesize": settings.max_download_bytes,
        "restrictfilenames": True,
        "ignore_no_formats_error": False,
    }


def _format_label(format_info: dict[str, Any]) -> str:
    resolution = format_info.get("resolution")
    height = format_info.get("height")
    ext = format_info.get("ext")
    fps = format_info.get("fps")
    filesize = format_info.get("filesize") or format_info.get("filesize_approx")
    parts: list[str] = []

    if resolution and resolution != "audio only":
        parts.append(str(resolution))
    elif height:
        parts.append(f"{height}p")
    elif format_info.get("vcodec") == "none":
        parts.append("Audio")
    else:
        parts.append("Auto")

    if fps:
        parts.append(f"{fps}fps")
    if ext:
        parts.append(str(ext).upper())
    if filesize:
        parts.append(f"{filesize / (1024 * 1024):.1f} MB")

    return " · ".join(parts)


def _extract_formats(info: dict[str, Any]) -> list[FormatInfo]:
    seen: set[str] = set()
    formats: list[FormatInfo] = []

    for item in info.get("formats") or []:
        format_id = item.get("format_id")
        if not format_id or format_id in seen:
            continue
        if item.get("protocol") in {"mhtml", "storyboard"}:
            continue
        seen.add(format_id)
        formats.append(
            FormatInfo(
                format_id=str(format_id),
                label=_format_label(item),
                ext=item.get("ext"),
                resolution=item.get("resolution")
                or (f"{item.get('height')}p" if item.get("height") else None),
                filesize=item.get("filesize") or item.get("filesize_approx"),
                vcodec=item.get("vcodec"),
                acodec=item.get("acodec"),
            )
        )

    return formats[:30]


def _platform(info: dict[str, Any]) -> str:
    return (
        info.get("extractor_key")
        or info.get("extractor")
        or info.get("webpage_url_domain")
        or "Supported site"
    )


def _friendly_error(error: Exception) -> HTTPException:
    message = str(error)
    lower = message.lower()

    if "private" in lower or "login" in lower or "sign in" in lower or "cookies" in lower:
        detail = "This link appears to require login, cookies, or private access. Public links only are supported."
        code = status.HTTP_403_FORBIDDEN
    elif "unsupported url" in lower or "no suitable extractor" in lower:
        detail = "This site or URL shape is not supported by the downloader right now."
        code = status.HTTP_422_UNPROCESSABLE_ENTITY
    elif "file is larger than max-filesize" in lower or "larger than max" in lower:
        detail = "This video is larger than the configured download limit."
        code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    else:
        detail = "The video could not be fetched. The platform may have changed or blocked public extraction."
        code = status.HTTP_502_BAD_GATEWAY

    return HTTPException(status_code=code, detail=detail)


def get_metadata(url: str) -> MetadataResponse:
    options = _base_options() | {"skip_download": True}
    warnings: list[str] = []

    if not ffmpeg_available():
        warnings.append("ffmpeg was not found, so some best-quality merged downloads may be unavailable.")

    try:
        with YoutubeDL(options) as ydl:
            info = ydl.extract_info(url, download=False)
    except DownloadError as error:
        raise _friendly_error(error) from error

    if not isinstance(info, dict):
        raise HTTPException(status_code=502, detail="The downloader returned an unexpected response.")

    if info.get("_type") in {"playlist", "multi_video"}:
        raise HTTPException(status_code=422, detail="Playlists are not supported in this version.")

    title = info.get("title") or "Untitled video"
    return MetadataResponse(
        title=title,
        webpage_url=info.get("webpage_url") or url,
        platform=_platform(info),
        thumbnail=info.get("thumbnail"),
        duration=info.get("duration"),
        formats=_extract_formats(info),
        warnings=warnings,
    )


def _format_selector(format_id: str | None, quality: Quality) -> str:
    if format_id:
        return format_id
    if quality == "medium":
        return "best[height<=720]/best"
    if quality == "audio":
        return "bestaudio/best"
    return "bestvideo+bestaudio/best"


def download_video(url: str, format_id: str | None, quality: Quality) -> tuple[Path, str, Path]:
    settings.temp_root.mkdir(parents=True, exist_ok=True)
    work_dir = Path(tempfile.mkdtemp(prefix="socialdl-", dir=settings.temp_root))
    output_template = str(work_dir / "%(title).120B-%(id)s.%(ext)s")

    options = _base_options() | {
        "format": _format_selector(format_id, quality),
        "outtmpl": output_template,
        "merge_output_format": "mp4",
    }

    try:
        with YoutubeDL(options) as ydl:
            info = ydl.extract_info(url, download=True)
    except DownloadError as error:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise _friendly_error(error) from error
    except Exception:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise

    candidates = [Path(path) for path in glob.glob(str(work_dir / "*")) if Path(path).is_file()]
    if not candidates:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise HTTPException(status_code=502, detail="The downloader did not produce a media file.")

    file_path = max(candidates, key=lambda path: path.stat().st_size)
    filename = os.path.basename(file_path)

    requested = info.get("requested_downloads") if isinstance(info, dict) else None
    if requested and requested[0].get("filename"):
        requested_path = Path(requested[0]["filename"])
        if requested_path.exists():
            file_path = requested_path
            filename = requested_path.name

    return file_path, filename, work_dir
