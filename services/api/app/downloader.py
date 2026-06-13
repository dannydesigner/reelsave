from __future__ import annotations

import glob
import logging
import math
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any

from fastapi import HTTPException, status
from yt_dlp import DownloadError, YoutubeDL

from .config import settings
from .models import FormatInfo, MetadataResponse, Quality

logger = logging.getLogger("social_downloader.ytdlp")


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def yt_dlp_available() -> bool:
    try:
        import yt_dlp  # noqa: F401
    except Exception:
        return False
    return True


def _get_runtime_version(cmd: str) -> str | None:
    """Get the version string of a JS runtime, or None if unavailable."""
    try:
        result = subprocess.run(
            [cmd, "--version"],
            capture_output=True, text=True, timeout=5,
        )
        return result.stdout.strip().splitlines()[0] if result.returncode == 0 else None
    except (FileNotFoundError, subprocess.TimeoutExpired, IndexError):
        return None


def log_ytdlp_environment() -> dict[str, Any]:
    """Log yt-dlp version and JS runtime availability for diagnostics."""
    import yt_dlp as _yt_dlp

    ytdlp_version = getattr(_yt_dlp.version, "__version__", "unknown")
    node_version = _get_runtime_version("node")
    deno_version = _get_runtime_version("deno")
    has_ffmpeg = ffmpeg_available()

    env_info: dict[str, Any] = {
        "yt_dlp_version": ytdlp_version,
        "node_version": node_version or "not found",
        "deno_version": deno_version or "not found",
        "ffmpeg_available": has_ffmpeg,
    }

    # Warn about known compatibility issues
    warnings: list[str] = []
    if node_version and not deno_version:
        # Check if Node version is too old for newer yt-dlp
        try:
            major = int(node_version.lstrip("v").split(".")[0])
            if major < 22:
                warnings.append(
                    f"Node.js {node_version} detected but yt-dlp >=2026.6.9 requires Node v22+. "
                    f"Current yt-dlp pin keeps compatibility, but upgrading Node or installing Deno "
                    f"is recommended before unpinning yt-dlp."
                )
        except (ValueError, IndexError):
            pass

    if not node_version and not deno_version:
        warnings.append(
            "No JS runtime (Node.js or Deno) found. YouTube downloads will fail "
            "because yt-dlp cannot solve JS challenges without a runtime."
        )

    if not has_ffmpeg:
        warnings.append("ffmpeg not found. Merged best-quality downloads may be unavailable.")

    env_info["warnings"] = warnings

    logger.info(
        "yt-dlp environment: version=%s node=%s deno=%s ffmpeg=%s",
        ytdlp_version,
        node_version or "unavailable",
        deno_version or "unavailable",
        has_ffmpeg,
    )
    for w in warnings:
        logger.warning("yt-dlp env warning: %s", w)

    return env_info


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


def _non_negative_finite_float(value: Any) -> float | None:
    if value is None or isinstance(value, bool):
        return None

    try:
        number = float(value)
    except (TypeError, ValueError):
        return None

    if not math.isfinite(number) or number < 0:
        return None
    return number


def _rounded_int(value: Any) -> int | None:
    number = _non_negative_finite_float(value)
    if number is None:
        return None
    return int(math.floor(number + 0.5))


def _whole_seconds(value: Any) -> int | None:
    return _rounded_int(value)


def _byte_count(value: Any) -> int | None:
    bytes_value = _non_negative_finite_float(value)
    if bytes_value is None:
        return None
    return int(math.ceil(bytes_value))


def _format_filesize(format_info: dict[str, Any]) -> int | None:
    for key in ("filesize", "filesize_approx"):
        filesize = _byte_count(format_info.get(key))
        if filesize is not None:
            return filesize
    return None


def _format_label(format_info: dict[str, Any]) -> str:
    resolution = format_info.get("resolution")
    height = _rounded_int(format_info.get("height"))
    ext = format_info.get("ext")
    fps = _non_negative_finite_float(format_info.get("fps"))
    filesize = _format_filesize(format_info)
    parts: list[str] = []

    if resolution and resolution != "audio only":
        parts.append(str(resolution))
    elif height is not None:
        parts.append(f"{height}p")
    elif format_info.get("vcodec") == "none":
        parts.append("Audio")
    else:
        parts.append("Auto")

    if fps is not None:
        parts.append(f"{fps:g}fps")
    if ext:
        parts.append(str(ext).upper())
    if filesize is not None:
        parts.append(f"{filesize / (1024 * 1024):.1f} MB")

    return " · ".join(parts)


def _extract_formats(info: dict[str, Any]) -> list[FormatInfo]:
    seen: set[str] = set()
    formats: list[FormatInfo] = []
    raw_formats = info.get("formats")

    if not isinstance(raw_formats, list):
        return formats

    for item in raw_formats:
        if not isinstance(item, dict):
            continue

        format_id = item.get("format_id")
        if not format_id or format_id in seen:
            continue
        if item.get("protocol") in {"mhtml", "storyboard"}:
            continue
        
        # Validate file size against limit
        filesize = _format_filesize(item)
        if filesize is not None and filesize > settings.max_download_bytes:
            continue  # Skip formats that exceed size limit
        
        seen.add(format_id)
        height = _rounded_int(item.get("height"))
        formats.append(
            FormatInfo(
                format_id=str(format_id),
                label=_format_label(item),
                ext=item.get("ext"),
                resolution=item.get("resolution")
                or (f"{height}p" if height is not None else None),
                filesize=filesize,
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


def _friendly_error(error: Exception, *, url: str = "unknown") -> HTTPException:
    message = str(error)
    lower = message.lower()

    # Log the raw yt-dlp error so the exact cause is always in server logs
    logger.error(
        "yt-dlp extraction failed: url=%s error_type=%s message=%s",
        url, type(error).__name__, message,
    )

    # Detect JS-challenge / format-related failures specifically
    if "no video formats" in lower or "js challenge" in lower or "n-challenge" in lower:
        detail = (
            "The video could not be fetched — YouTube's anti-bot challenge could not be solved. "
            "This usually means the server's JS runtime (Node.js/Deno) is missing or outdated. "
            "Please contact the site administrator."
        )
        code = status.HTTP_502_BAD_GATEWAY
    elif "private" in lower or "login" in lower or "sign in" in lower or "cookies" in lower:
        detail = "This link appears to require login, cookies, or private access. Public links only are supported."
        code = status.HTTP_403_FORBIDDEN
    elif "unsupported url" in lower or "no suitable extractor" in lower:
        detail = "This site or URL shape is not supported by the downloader right now."
        code = status.HTTP_422_UNPROCESSABLE_ENTITY
    elif "file is larger than max-filesize" in lower or "larger than max" in lower:
        max_mb = settings.max_download_bytes // (1024 * 1024)
        detail = f"This video exceeds the maximum allowed size of {max_mb} MB."
        code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    elif "timed out" in lower or "timeout" in lower:
        detail = "The download operation timed out. The video may be too large or the source is too slow."
        code = status.HTTP_504_GATEWAY_TIMEOUT
    else:
        detail = "The video could not be fetched. The platform may have changed or blocked public extraction."
        code = status.HTTP_502_BAD_GATEWAY

    return HTTPException(status_code=code, detail=detail)


def get_metadata(url: str) -> MetadataResponse:
    options = _base_options() | {"skip_download": True}
    warnings: list[str] = []

    if not ffmpeg_available():
        warnings.append("ffmpeg was not found, so some best-quality merged downloads may be unavailable.")

    logger.info("Fetching metadata: url=%s", url)
    start = time.monotonic()

    try:
        with YoutubeDL(options) as ydl:
            info = ydl.extract_info(url, download=False)
    except DownloadError as error:
        raise _friendly_error(error, url=url) from error

    elapsed_ms = (time.monotonic() - start) * 1000

    if not isinstance(info, dict):
        logger.error("yt-dlp returned non-dict info for url=%s", url)
        raise HTTPException(status_code=502, detail="The downloader returned an unexpected response.")

    if info.get("_type") in {"playlist", "multi_video"}:
        raise HTTPException(status_code=422, detail="Playlists are not supported in this version.")

    platform = _platform(info)
    logger.info(
        "Metadata fetched: url=%s platform=%s duration_ms=%.1f formats=%d",
        url, platform, elapsed_ms, len(info.get("formats") or []),
    )

    # Check if video duration suggests a file too large
    raw_duration = _non_negative_finite_float(info.get("duration"))
    duration = _whole_seconds(raw_duration)
    if raw_duration is not None and raw_duration > 1800:  # 30 minutes
        warnings.append("Long videos may exceed the size limit. Consider selecting a lower quality format.")

    title = info.get("title") or "Untitled video"
    return MetadataResponse(
        title=title,
        webpage_url=info.get("webpage_url") or url,
        platform=platform,
        thumbnail=info.get("thumbnail"),
        duration=duration,
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


def _validate_downloaded_file(file_path: Path) -> None:
    """Validate downloaded file size."""
    file_size = file_path.stat().st_size
    max_size = settings.max_download_bytes
    
    if file_size > max_size:
        max_mb = max_size // (1024 * 1024)
        actual_mb = file_size / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Downloaded file ({actual_mb:.1f} MB) exceeds maximum allowed size of {max_mb} MB.",
        )


def download_video(url: str, format_id: str | None, quality: Quality) -> tuple[Path, str, Path]:
    settings.temp_root.mkdir(parents=True, exist_ok=True)
    work_dir = Path(tempfile.mkdtemp(prefix="socialdl-", dir=settings.temp_root))
    output_template = str(work_dir / "%(title).120B-%(id)s.%(ext)s")

    options = _base_options() | {
        "format": _format_selector(format_id, quality),
        "outtmpl": output_template,
        "merge_output_format": "mp4",
    }

    # Note: Signal-based timeout removed due to thread-safety issues with uvicorn workers.
    # Relying on yt-dlp's built-in socket_timeout and max_filesize options instead.

    logger.info("Starting download: url=%s format=%s quality=%s", url, format_id, quality)
    start = time.monotonic()

    try:
        with YoutubeDL(options) as ydl:
            info = ydl.extract_info(url, download=True)
    except DownloadError as error:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise _friendly_error(error, url=url) from error
    except Exception:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise

    candidates = [Path(path) for path in glob.glob(str(work_dir / "*")) if Path(path).is_file()]
    if not candidates:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise HTTPException(status_code=502, detail="The downloader did not produce a media file.")

    file_path = max(candidates, key=lambda path: path.stat().st_size)
    
    # Validate file size
    _validate_downloaded_file(file_path)
    
    elapsed_ms = (time.monotonic() - start) * 1000
    logger.info(
        "Download complete: url=%s file=%s size_mb=%.1f duration_ms=%.1f",
        url, file_path.name, file_path.stat().st_size / (1024 * 1024), elapsed_ms,
    )

    filename = os.path.basename(file_path)

    requested = info.get("requested_downloads") if isinstance(info, dict) else None
    if requested and requested[0].get("filename"):
        requested_path = Path(requested[0]["filename"])
        if requested_path.exists():
            file_path = requested_path
            filename = requested_path.name
            # Validate again in case it's a different file
            _validate_downloaded_file(file_path)

    return file_path, filename, work_dir
