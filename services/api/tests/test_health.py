from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint() -> None:
    response = TestClient(app).get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "yt_dlp_available" in data
    assert "ffmpeg_available" in data
