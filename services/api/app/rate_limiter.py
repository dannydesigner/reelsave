"""
In-memory rate limiter for IP-based abuse protection.
Lightweight solution suitable for single-server deployments.
"""
from __future__ import annotations

import time
from collections import defaultdict
from threading import Lock
from typing import Any

from fastapi import Request


class InMemoryRateLimiter:
    """
    Thread-safe in-memory rate limiter using token bucket algorithm.
    Suitable for single-server deployments without Redis.
    """

    def __init__(self) -> None:
        self._storage: dict[str, dict[str, Any]] = defaultdict(dict)
        self._lock = Lock()
        self._cleanup_interval = 3600  # Clean up old entries every hour
        self._last_cleanup = time.time()

    def _cleanup_old_entries(self) -> None:
        """Remove expired entries to prevent memory bloat."""
        now = time.time()
        if now - self._last_cleanup < self._cleanup_interval:
            return

        with self._lock:
            keys_to_delete = []
            for key, data in self._storage.items():
                if now - data.get("last_request", 0) > self._cleanup_interval:
                    keys_to_delete.append(key)

            for key in keys_to_delete:
                del self._storage[key]

            self._last_cleanup = now

    def check_rate_limit(
        self, identifier: str, max_requests: int, window_seconds: int
    ) -> tuple[bool, dict[str, Any]]:
        """
        Check if request should be allowed.

        Returns:
            tuple: (is_allowed, info_dict)
            info_dict contains: remaining, reset_time
        """
        self._cleanup_old_entries()

        now = time.time()
        with self._lock:
            if identifier not in self._storage:
                self._storage[identifier] = {
                    "count": 1,
                    "window_start": now,
                    "last_request": now,
                }
                return True, {
                    "remaining": max_requests - 1,
                    "reset": int(now + window_seconds),
                }

            data = self._storage[identifier]
            window_start = data["window_start"]

            # Reset window if expired
            if now - window_start >= window_seconds:
                self._storage[identifier] = {
                    "count": 1,
                    "window_start": now,
                    "last_request": now,
                }
                return True, {
                    "remaining": max_requests - 1,
                    "reset": int(now + window_seconds),
                }

            # Check if limit exceeded
            if data["count"] >= max_requests:
                reset_time = int(window_start + window_seconds)
                return False, {
                    "remaining": 0,
                    "reset": reset_time,
                }

            # Increment counter
            data["count"] += 1
            data["last_request"] = now
            return True, {
                "remaining": max_requests - data["count"],
                "reset": int(window_start + window_seconds),
            }

    def get_stats(self) -> dict[str, Any]:
        """Get rate limiter statistics."""
        with self._lock:
            return {
                "active_ips": len(self._storage),
                "total_storage_kb": len(str(self._storage)) / 1024,
            }


# Global rate limiter instance
rate_limiter = InMemoryRateLimiter()


def get_client_ip(request: Request) -> str:
    """
    Extract client IP from request.
    
    SECURITY: Only trusts X-Real-IP header set by our nginx proxy.
    X-Forwarded-For is NOT used as it can be spoofed by clients.
    """
    # Trust only X-Real-IP (set by our nginx, not spoofable by client)
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    # Fallback to direct connection IP (if not behind proxy)
    if request.client:
        return request.client.host

    return "unknown"
