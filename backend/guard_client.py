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
_TOKEN = os.getenv("SECURE_GUARD_TOKEN") or os.getenv("GUARD_TOKEN", "")
_TIMEOUT = float(os.getenv("GUARD_TIMEOUT_SECONDS", "8.0"))
_MAX_RETRY = int(os.getenv("GUARD_MAX_RETRIES", "2"))

# The confirmed working endpoint for the SecureAI Guard API
_PROMPT_ENDPOINT = "/v1/check/prompt"


@dataclass
class GuardResult:
    blocked: bool
    reason: str = ""
    confidence: float = 0.0
    raw: dict = field(default_factory=dict)
    unavailable: bool = False


def _parse_guard_response(data: dict) -> GuardResult:
    """Parse the SecureAI Guard API response shape.

    The API returns:
      {
        "allowed": bool,
        "checks": { "injection": {"flagged": bool, "confidence": "HIGH"|...}, ... },
        "flags": ["injection", ...],
        "status": "complete"
      }
    blocked = not allowed
    """
    # Primary signal: allowed field (SecureAI Guard v1 shape)
    if "allowed" in data:
        blocked = not bool(data["allowed"])
    else:
        # Fallback for other possible shapes
        blocked = bool(
            data.get("blocked")
            or data.get("is_blocked")
            or data.get("is_malicious")
            or data.get("flagged")
            or data.get("unsafe")
            or (data.get("result") in ("blocked", "malicious", "unsafe"))
            or (data.get("action") in ("block", "deny", "reject"))
        )

    # Build a human-readable reason from the flags / checks
    flags: list[str] = data.get("flags", [])
    checks: dict = data.get("checks", {})
    if flags:
        reason_parts = []
        for flag in flags:
            check = checks.get(flag, {})
            conf = check.get("confidence", "")
            types = check.get("types", [])
            detail = f"{flag}"
            if conf:
                detail += f" (confidence: {conf})"
            if types:
                detail += f" [{', '.join(types)}]"
            reason_parts.append(detail)
        reason = "Blocked by SecureAI Guard: " + "; ".join(reason_parts)
    elif blocked:
        reason = data.get("reason") or data.get("message") or "Blocked by SecureAI Guard"
    else:
        reason = ""

    # Derive a numeric confidence from the injection check if present
    injection_conf_map = {"HIGH": 0.95, "MEDIUM": 0.65, "LOW": 0.35}
    inj_check = checks.get("injection", {})
    raw_conf = inj_check.get("confidence", "")
    confidence = injection_conf_map.get(str(raw_conf).upper(), 0.0)
    if not confidence:
        confidence = float(data.get("confidence") or data.get("score") or data.get("probability") or 0.0)

    return GuardResult(blocked=blocked, reason=reason, confidence=confidence, raw=data)


async def check_prompt(text: str, resource: str) -> GuardResult:
    """Call the SecureAI Guard API to analyze a prompt.

    Uses the confirmed endpoint POST /v1/check/prompt with payload {"text": ...}.
    Retries up to _MAX_RETRY times on network errors.
    Returns GuardResult(blocked=False, unavailable=True) if the API is unreachable (fail-open).
    """
    if not _BASE_URL or not _TOKEN:
        logger.warning("SECURE_GUARD_API_URL or SECURE_GUARD_TOKEN not set; skipping guard check")
        return GuardResult(blocked=False, unavailable=True, reason="Guard not configured")

    headers = {
        "Authorization": f"Bearer {_TOKEN}",
        "Content-Type": "application/json",
    }
    # The SecureAI Guard API expects {"text": "..."} — not {"prompt": ...}
    payload = {"text": text}
    url = f"{_BASE_URL}{_PROMPT_ENDPOINT}"

    for attempt in range(_MAX_RETRY + 1):
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.post(url, json=payload, headers=headers)

                if resp.status_code == 403:
                    return GuardResult(
                        blocked=True,
                        reason="Blocked by SecureAI Guard (403 Forbidden)",
                        confidence=1.0,
                    )
                if 200 <= resp.status_code < 300:
                    raw = resp.json() if resp.content else {}
                    return _parse_guard_response(raw)

                # Non-2xx, non-403 — distinguishable from a network timeout:
                # 429 = rate-limited Guard endpoint, 5xx = Guard server error.
                # Log with event=guard_degraded so monitoring can alert on a
                # running-but-overwhelmed Guard separately from a missing Guard.
                logger.warning(
                    "guard_degraded: Guard API returned HTTP %d on attempt %d "
                    "(event=guard_degraded url=%s): %s",
                    resp.status_code, attempt + 1, url, resp.text[:200],
                )
                if attempt < _MAX_RETRY:
                    continue
                return GuardResult(
                    blocked=False,
                    unavailable=True,
                    reason=f"Guard returned HTTP {resp.status_code}",
                )

        except (httpx.TimeoutException, httpx.ConnectError, httpx.NetworkError) as exc:
            logger.warning(
                "guard_unavailable: network error on attempt %d (event=guard_unavailable url=%s): %s",
                attempt + 1, url, exc,
            )
            if attempt == _MAX_RETRY:
                return GuardResult(blocked=False, unavailable=True, reason=str(exc))
        except Exception as exc:
            logger.warning(
                "guard_unavailable: unexpected error (event=guard_unavailable url=%s): %s",
                url, exc,
            )
            return GuardResult(blocked=False, unavailable=True, reason=str(exc))

    return GuardResult(blocked=False, unavailable=True, reason="Guard unavailable")
