"""
Structured logging configuration for monitoring and abuse detection.
"""
from __future__ import annotations

import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from .config import settings


class JSONFormatter(logging.Formatter):
    """Format logs as JSON for easy parsing and monitoring."""

    def format(self, record: logging.LogRecord) -> str:
        log_data: dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
        }

        # Add extra fields if present
        if hasattr(record, "client_ip"):
            log_data["client_ip"] = record.client_ip
        if hasattr(record, "url"):
            log_data["url"] = record.url
        if hasattr(record, "platform"):
            log_data["platform"] = record.platform
        if hasattr(record, "status"):
            log_data["status"] = record.status
        if hasattr(record, "reason"):
            log_data["reason"] = record.reason
        if hasattr(record, "user_agent"):
            log_data["user_agent"] = record.user_agent
        if hasattr(record, "duration_ms"):
            log_data["duration_ms"] = record.duration_ms
        if hasattr(record, "filesize_mb"):
            log_data["filesize_mb"] = record.filesize_mb

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)


def setup_logging() -> logging.Logger:
    """
    Configure application logging.
    Logs to both file and stdout for flexibility.
    """
    logger = logging.getLogger("social_downloader")
    logger.setLevel(logging.INFO)

    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()

    # Console handler with JSON format
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(JSONFormatter())
    logger.addHandler(console_handler)

    # File handler with JSON format (if log directory exists)
    if settings.log_directory.exists():
        log_file = settings.log_directory / "api.log"
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(JSONFormatter())
        logger.addHandler(file_handler)

    return logger


# Global logger instance
app_logger = setup_logging()


def log_request(
    client_ip: str,
    endpoint: str,
    url: str | None = None,
    status: str = "success",
    reason: str | None = None,
    user_agent: str | None = None,
    duration_ms: float | None = None,
    filesize_mb: float | None = None,
) -> None:
    """
    Log API request with relevant details.

    Args:
        client_ip: Client IP address
        endpoint: API endpoint (metadata or download)
        url: Requested video URL
        status: success, rate_limited, blocked, error
        reason: Reason for rejection if applicable
        user_agent: Client user agent
        duration_ms: Request duration in milliseconds
        filesize_mb: Downloaded file size in MB
    """
    extra: dict[str, Any] = {
        "client_ip": client_ip,
    }

    if url:
        extra["url"] = url
    if user_agent:
        extra["user_agent"] = user_agent
    if reason:
        extra["reason"] = reason
    if duration_ms is not None:
        extra["duration_ms"] = round(duration_ms, 2)
    if filesize_mb is not None:
        extra["filesize_mb"] = round(filesize_mb, 2)

    message = f"{endpoint} request from {client_ip}: {status}"

    if status == "success":
        app_logger.info(message, extra=extra)
    elif status == "rate_limited":
        app_logger.warning(message, extra=extra)
    elif status == "blocked":
        app_logger.warning(message, extra=extra)
    else:
        app_logger.error(message, extra=extra)


def log_cleanup(client_ip: str, work_dir: Path, reason: str) -> None:
    """Log cleanup operations."""
    app_logger.info(
        f"Cleanup triggered for {work_dir.name}",
        extra={"client_ip": client_ip, "reason": reason},
    )


def log_rate_limiter_stats(stats: dict[str, Any]) -> None:
    """Log rate limiter statistics (for monitoring)."""
    app_logger.info(
        f"Rate limiter stats: {stats['active_ips']} active IPs, "
        f"{stats['total_storage_kb']:.2f} KB memory"
    )
