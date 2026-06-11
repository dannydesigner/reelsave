from __future__ import annotations

import os
from pathlib import Path


class Settings:
    app_name = "Social Video Downloader API"
    temp_root = Path(os.getenv("DOWNLOAD_TEMP_ROOT", Path.cwd() / "tmp"))
    max_download_bytes = int(os.getenv("MAX_DOWNLOAD_BYTES", str(250 * 1024 * 1024)))
    download_timeout_seconds = int(os.getenv("DOWNLOAD_TIMEOUT_SECONDS", "300"))
    socket_timeout_seconds = int(os.getenv("SOCKET_TIMEOUT_SECONDS", "20"))
    cors_origins = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,https://reelsave.me,https://www.reelsave.me",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
