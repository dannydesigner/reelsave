"""
Bot and abuse protection mechanisms.
"""
from __future__ import annotations

from fastapi import HTTPException, Request, status

from .config import settings


# Suspicious bot user agents (common scrapers, bots, command-line tools)
# NOTE: Be conservative - overly broad patterns cause false positives
BLOCKED_USER_AGENTS = {
    "curl",
    "wget",
    "python-requests",
    "python-urllib",
    "go-http-client",
    "apache-httpclient",
    "scrapy",
    "headlesschrome",
    "phantomjs",
}

# Explicitly allowed user agents (legitimate bots we want to allow)
ALLOWED_USER_AGENTS = {
    # Social media preview bots (needed for share cards)
    "twitterbot",
    "facebookexternalhit",
    "linkedinbot",
    "slackbot",
    "whatsapp",
    "telegrambot",
    "discordbot",
    # Add monitoring tools here if needed
}


def is_suspicious_user_agent(user_agent: str) -> bool:
    """Check if user agent appears to be a bot or scraper."""
    if not user_agent:
        return True

    user_agent_lower = user_agent.lower()

    # Check if explicitly allowed
    for allowed in ALLOWED_USER_AGENTS:
        if allowed.lower() in user_agent_lower:
            return False

    # Check against blocked patterns
    for blocked in BLOCKED_USER_AGENTS:
        if blocked in user_agent_lower:
            return True

    return False


def validate_user_agent(request: Request) -> None:
    """
    Validate that the request has an acceptable user agent.
    Raises HTTPException if suspicious.
    """
    user_agent = request.headers.get("User-Agent", "")

    if not user_agent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing User-Agent header. Please use a standard web browser.",
        )

    if is_suspicious_user_agent(user_agent):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Automated requests are not permitted. Please use the web interface at reelsave.me",
        )


def validate_referer(request: Request, strict: bool = False) -> None:
    """
    Validate that request comes from legitimate frontend.

    Args:
        request: FastAPI request object
        strict: If True, require referer to match allowed origins
    """
    if not settings.enable_referer_validation:
        return

    referer = request.headers.get("Referer", "")

    # In strict mode, referer must be present and match allowed origins
    if strict:
        if not referer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Direct API access is not permitted. Please use the web interface at reelsave.me",
            )

        # Check if referer starts with any allowed origin
        referer_lower = referer.lower()
        allowed = any(
            referer_lower.startswith(origin.lower())
            for origin in settings.allowed_referers
        )

        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Request origin not authorized. Please use the web interface at reelsave.me",
            )


def validate_content_type(request: Request) -> None:
    """
    Validate that POST requests have appropriate content type.
    Prevents form submissions and other abuse vectors.
    """
    if request.method == "POST":
        content_type = request.headers.get("Content-Type", "")
        if not content_type.startswith("application/json"):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Content-Type must be application/json",
            )
