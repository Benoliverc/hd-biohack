"""Single shared Pro / biohacking entitlement helper."""

from __future__ import annotations

from .config import get_settings


def user_has_biohacking(user) -> bool:
    """Pro entitlements for Protocols / Soul / People.

    BETA_FULL_ACCESS, when on, grants Pro to every signed-in user without
    rewriting subscription_tier. The flag defaults off, so Free/Pro gates
    follow the stored plan only.
    """
    if get_settings().beta_full_access:
        return True
    return bool(
        getattr(user, "biohacking_enabled", False)
        or getattr(user, "subscription_tier", None) == "biohacker_pro"
    )
