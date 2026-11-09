"""Transactional email via Resend (password reset only)."""

from __future__ import annotations

import logging

import httpx

from .config import get_settings

logger = logging.getLogger("hd_biohack.mail")


def send_password_reset_email(*, to_email: str, reset_url: str) -> bool:
    """Send reset mail. Returns True if accepted by Resend.

    Missing API key → no-op success path (caller still returns generic message).
    Never logs the recipient address or reset URL.
    """
    settings = get_settings()
    key = (settings.resend_api_key or "").strip()
    if not key:
        logger.info("password_reset_mail_skipped reason=missing_resend_api_key")
        return False
    from_addr = (settings.resend_from_email or "").strip() or "Baseline <onboarding@resend.dev>"
    payload = {
        "from": from_addr,
        "to": [to_email],
        "subject": "Reset your Baseline password",
        "text": (
            "Choose a new password for Baseline:\n\n"
            f"{reset_url}\n\n"
            "This link expires soon and can only be used once. "
            "If you did not ask for a reset, you can ignore this email."
        ),
    }
    try:
        res = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json=payload,
            timeout=15.0,
        )
        if res.status_code >= 400:
            logger.warning("password_reset_mail_failed status=%s", res.status_code)
            return False
        return True
    except Exception:
        logger.warning("password_reset_mail_failed reason=transport", exc_info=False)
        return False
