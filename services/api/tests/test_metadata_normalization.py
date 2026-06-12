from __future__ import annotations

from typing import Any

from app import downloader
from app.models import MetadataResponse


class FakeYoutubeDL:
    def __init__(self, options: dict[str, Any]) -> None:
        self.options = options

    def __enter__(self) -> "FakeYoutubeDL":
        return self

    def __exit__(self, *args: object) -> None:
        return None

    def extract_info(self, url: str, download: bool = False) -> dict[str, Any]:
        return {
            "title": "Fractional metadata",
            "webpage_url": url,
            "extractor_key": "Example",
            "thumbnail": None,
            "duration": 40.766,
            "formats": [
                {
                    "format_id": "18",
                    "ext": "mp4",
                    "height": 720.0,
                    "fps": 29.97,
                    "filesize_approx": 1234.2,
                    "vcodec": "h264",
                    "acodec": "aac",
                },
                {
                    "format_id": "140",
                    "ext": "m4a",
                    "filesize": None,
                    "filesize_approx": "unknown",
                    "vcodec": "none",
                    "acodec": "aac",
                },
            ],
        }


def test_get_metadata_normalizes_fractional_yt_dlp_numbers(monkeypatch) -> None:
    monkeypatch.setattr(downloader, "YoutubeDL", FakeYoutubeDL)
    monkeypatch.setattr(downloader, "ffmpeg_available", lambda: True)

    metadata = downloader.get_metadata("https://example.com/video")

    assert isinstance(metadata, MetadataResponse)
    assert metadata.duration == 41
    assert metadata.formats[0].filesize == 1235
    assert metadata.formats[0].resolution == "720p"
    assert "29.97fps" in metadata.formats[0].label
    assert metadata.formats[1].filesize is None


def test_metadata_normalization_handles_missing_numeric_values() -> None:
    formats = downloader._extract_formats(
        {
            "formats": [
                None,
                {
                    "format_id": "missing-numbers",
                    "ext": "mp4",
                    "height": None,
                    "filesize": None,
                    "filesize_approx": None,
                    "vcodec": "h264",
                    "acodec": "aac",
                }
            ]
        }
    )

    assert len(formats) == 1
    assert formats[0].filesize is None
    assert formats[0].resolution is None


def test_metadata_normalization_handles_malformed_formats_container() -> None:
    assert downloader._extract_formats({"formats": "unexpected"}) == []
