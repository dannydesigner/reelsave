import pytest
from fastapi import HTTPException

from app.security import validate_public_url


@pytest.mark.parametrize(
    "url",
    [
        "ftp://example.com/video",
        "http://localhost/video",
        "http://127.0.0.1/video",
        "http://10.0.0.2/video",
        "http://172.16.0.2/video",
        "http://192.168.1.10/video",
        "http://[::1]/video",
    ],
)
def test_validate_public_url_rejects_private_urls(url: str) -> None:
    with pytest.raises(HTTPException):
        validate_public_url(url)


def test_validate_public_url_accepts_public_http_url() -> None:
    assert validate_public_url("https://example.com/video") == "https://example.com/video"
