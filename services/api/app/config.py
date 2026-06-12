from __future__ import annotations

import os
from pathlib import Path


class Settings:
    app_name = "Social Video Downloader API"
    temp_root = Path(os.getenv("DOWNLOAD_TEMP_ROOT", Path.cwd() / "tmp"))
    log_directory = Path(os.getenv("LOG_DIRECTORY", Path.cwd() / "logs"))
    
    # File size limits
    max_download_bytes = int(os.getenv("MAX_DOWNLOAD_BYTES", str(250 * 1024 * 1024)))  # 250 MB
    
    # Timeout settings
    download_timeout_seconds = int(os.getenv("DOWNLOAD_TIMEOUT_SECONDS", "300"))  # 5 minutes
    socket_timeout_seconds = int(os.getenv("SOCKET_TIMEOUT_SECONDS", "20"))
    yt_dlp_timeout_seconds = int(os.getenv("YT_DLP_TIMEOUT_SECONDS", "240"))  # 4 minutes
    
    # Rate limiting (requests per hour per IP)
    rate_limit_metadata = int(os.getenv("RATE_LIMIT_METADATA", "60"))
    rate_limit_download = int(os.getenv("RATE_LIMIT_DOWNLOAD", "20"))
    rate_limit_window_seconds = 3600  # 1 hour
    
    # Bot protection
    enable_user_agent_validation = os.getenv("ENABLE_USER_AGENT_VALIDATION", "true").lower() == "true"
    enable_referer_validation = os.getenv("ENABLE_REFERER_VALIDATION", "false").lower() == "true"
    
    # CORS and referer validation
    cors_origins = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,https://reelsave.me,https://www.reelsave.me",
        ).split(",")
        if origin.strip()
    ]
    
    allowed_referers = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_REFERERS",
            "http://localhost:3000,http://127.0.0.1:3000,https://reelsave.me,https://www.reelsave.me",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
