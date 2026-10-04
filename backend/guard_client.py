"""
guard_client.py – Async SecureGuard API client for PrismGuard.

Reads SECURE_GUARD_API_URL (or GUARD_URL) and GUARD_TOKEN from .env.
Fails open: returns GuardResult(blocked=False) if the API is unreachable.
"""

import logging
import os
from dataclasses import dataclass, field
from pathlib import Path

import httpx
from dotenv import load_dotenv

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_PROJECT_ROOT / ".env")

logger = logging.getLogger(__name__)

_BASE_URL = (os.getenv("SECURE_GUARD_API_URL") or os.getenv("GUARD_URL", "")).rstrip("/")
_TOKEN = os.getenv("GUARD_TOKEN", "")
_TIMEOUT = float(os.getenv("GUARD_TIMEOUT_SECONDS", "8.0"))
_MAX_RETRY = int(os.getenv("GUARD_MAX_RETRIES", "2"))

# Candidate endpoints to try, in order
_CANDIDATE_ENDPOINTS = ["/guard", "/check", "/analyze", "/v1/guard"]

# Cache the working endpoint so discovery only runs once per process
_discovered_endpoint: str | None = None


@dataclass
class GuardResult:
    blocked: bool
    reason: str = ""
    confidence: float = 0.0
    raw: dict = field(default_factory=dict)
    unavailable: bool = False


def _parse_guard_response(data: dict) -> GuardResult:
    """Gracefully parse multiple possible JSON shapes from the guard API."""
    blocked = bool(
        data.get("blocked")
        or data.get("is_blocked")
        or data.get("is_malicious")
        or data.get("flagged")
        or data.get("unsafe")
        or (data.get("result") in ("blocked", "malicious", "unsafe"))
        or (data.get("action") in ("block", "deny", "reject"))
    )
    reason = (
        data.get("reason")
        or data.get("message")
        or data.get("detail")
        or ("Blocked by SecureGuard" if blocked else "")
    )
    confidence = float(data.get("confidence") or data.get("score") or data.get("probability") or 0.0)
    return GuardResult(blocked=blocked, reason=str(reason), confidence=confidence, raw=data)


async def check_prompt(text: str, resource: str) -> GuardResult:
    """Call the SecureGuard API to analyze a prompt.

    Tries each candidate endpoint in order. Retries up to _MAX_RETRY times on
    network errors. Returns GuardResult(blocked=False, unavailable=True) if the
    API is unreachable (fail-open).
    """
    global _discovered_endpoint

    if not _BASE_URL or not _TOKEN:
        logger.warning("GUARD_URL or GUARD_TOKEN not set; skipping guard check")
        return GuardResult(blocked=False, unavailable=True, reason="Guard not configured")

    headers = {
        "Authorization": f"Bearer {_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {"prompt": text, "context": resource}

    for attempt in range(_MAX_RETRY + 1):
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                # If we already know a working endpoint, use it directly
                if _discovered_endpoint is not None:
                    endpoints_to_try = [_discovered_endpoint]
                else:
                    endpoints_to_try = _CANDIDATE_ENDPOINTS

                for ep in endpoints_to_try:
                    try:
                        resp = await client.post(
                            f"{_BASE_URL}{ep}",
                            json=payload,
                            headers=headers,
                        )
                        if resp.status_code == 403:
                            # 403 can itself be a "blocked" signal
                            _discovered_endpoint = ep
                            return GuardResult(blocked=True, reason="Blocked by SecureGuard (403)", confidence=1.0)
                        if resp.status_code < 500:
                            # 2xx or 4xx (other than 403) — usable response
                            _discovered_endpoint = ep
                            raw = resp.json() if resp.content else {}
                            return _parse_guard_response(raw)
                        # 5xx — try next endpoint
                    except (httpx.TimeoutException, httpx.ConnectError, httpx.NetworkError):
                        # Network issue on this specific endpoint — try next
                        continue
                    except Exception as exc:
                        logger.warning("Guard API endpoint %s unexpected error: %s", ep, exc)
                        continue

                # All endpoints failed this attempt
                if attempt < _MAX_RETRY:
                    logger.warning("Guard API: all endpoints failed on attempt %d, retrying", attempt + 1)
                    continue
                else:
                    logger.warning("Guard API: all endpoints exhausted after %d attempts; failing open", _MAX_RETRY + 1)
                    return GuardResult(blocked=False, unavailable=True, reason="Guard unavailable")

        except (httpx.TimeoutException, httpx.ConnectError, httpx.NetworkError) as exc:
            logger.warning("Guard API network error on attempt %d: %s", attempt + 1, exc)
            if attempt == _MAX_RETRY:
                return GuardResult(blocked=False, unavailable=True, reason=str(exc))
        except Exception as exc:
            logger.warning("Guard API unexpected error: %s", exc)
            return GuardResult(blocked=False, unavailable=True, reason=str(exc))

    return GuardResult(blocked=False, unavailable=True, reason="Guard unavailable")
