from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


Quality = Literal["best", "medium", "audio"]


class MetadataRequest(BaseModel):
    url: HttpUrl


class DownloadRequest(BaseModel):
    url: HttpUrl
    format_id: str | None = Field(default=None, max_length=80)
    quality: Quality = "best"


class FormatInfo(BaseModel):
    format_id: str
    label: str
    ext: str | None = None
    resolution: str | None = None
    filesize: int | None = None
    vcodec: str | None = None
    acodec: str | None = None


class MetadataResponse(BaseModel):
    title: str
    webpage_url: str
    platform: str
    thumbnail: str | None = None
    duration: int | None = None
    formats: list[FormatInfo]
    warnings: list[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: Literal["ok"]
    yt_dlp_available: bool
    ffmpeg_available: bool
    max_download_mb: int
