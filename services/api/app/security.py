from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urlparse

from fastapi import HTTPException, status


PRIVATE_HOSTNAMES = {"localhost", "localhost.localdomain"}


def _is_blocked_ip(host: str) -> bool:
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        return False

    return any(
        [
            ip.is_private,
            ip.is_loopback,
            ip.is_link_local,
            ip.is_multicast,
            ip.is_reserved,
            ip.is_unspecified,
        ]
    )


def validate_public_url(raw_url: str) -> str:
    parsed = urlparse(raw_url)
    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only http and https URLs are supported.",
        )

    host = parsed.hostname
    if not host:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter a valid public URL.",
        )

    normalized_host = host.strip(".").lower()
    if normalized_host in PRIVATE_HOSTNAMES or normalized_host.endswith(".localhost"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Local or private network URLs are not allowed.",
        )

    if _is_blocked_ip(normalized_host):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Local or private network URLs are not allowed.",
        )

    try:
        addresses = socket.getaddrinfo(normalized_host, None, proto=socket.IPPROTO_TCP)
    except socket.gaierror:
        return raw_url

    for address in addresses:
        ip = address[4][0]
        if _is_blocked_ip(ip):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Local or private network URLs are not allowed.",
            )

    return raw_url
