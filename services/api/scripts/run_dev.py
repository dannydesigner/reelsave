from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def python_executable() -> str:
    windows_venv = ROOT / ".venv" / "Scripts" / "python.exe"
    posix_venv = ROOT / ".venv" / "bin" / "python"
    if windows_venv.exists():
        return str(windows_venv)
    if posix_venv.exists():
        return str(posix_venv)
    return sys.executable


if __name__ == "__main__":
    env = os.environ.copy()
    env.setdefault("PYTHONPATH", str(ROOT))
    raise SystemExit(
        subprocess.call(
            [
                python_executable(),
                "-m",
                "uvicorn",
                "app.main:app",
                "--host",
                "127.0.0.1",
                "--port",
                "8000",
                "--reload",
            ],
            cwd=ROOT,
            env=env,
        )
    )
