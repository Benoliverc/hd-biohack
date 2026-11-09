"""Opaque bearer session tokens + password-reset tokens.

Chosen over httpOnly cookies because the Vercel FE and Railway API are
cross-origin: Absolute NEXT_PUBLIC_API_URL means credentialed cookies need
SameSite=None + exact CORS origin lists and break the same-origin Next rewrite
path. A signed opaque bearer in Authorization works for both modes; the API
stores only a SHA-256 hash so logout can revoke the row.
"""

from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from .config import get_settings
from .database import get_db
from .models import AuthSession, PasswordResetToken, User

GENERIC_AUTH_ERROR = "Email or password didn't work. Try again."
GENERIC_RESET_OK = "If that email is on Baseline, we sent a reset link."


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def create_session(db: Session, user: User) -> str:
    settings = get_settings()
    raw = secrets.token_urlsafe(32)
    row = AuthSession(
        user_id=user.id,
        token_hash=_hash_token(raw),
        expires_at=datetime.utcnow() + timedelta(hours=settings.session_ttl_hours),
    )
    db.add(row)
    db.commit()
    return raw


def revoke_session(db: Session, raw_token: str | None) -> None:
    if not raw_token:
        return
    row = (
        db.query(AuthSession)
        .filter(AuthSession.token_hash == _hash_token(raw_token), AuthSession.revoked_at.is_(None))
        .first()
    )
    if row:
        row.revoked_at = datetime.utcnow()
        db.commit()


def revoke_all_sessions_for_user(db: Session, user_id: int) -> None:
    now = datetime.utcnow()
    rows = (
        db.query(AuthSession)
        .filter(AuthSession.user_id == user_id, AuthSession.revoked_at.is_(None))
        .all()
    )
    for row in rows:
        row.revoked_at = now
    if rows:
        db.commit()


def resolve_session_user(db: Session, raw_token: str | None) -> User | None:
    if not raw_token:
        return None
    row = (
        db.query(AuthSession)
        .filter(AuthSession.token_hash == _hash_token(raw_token), AuthSession.revoked_at.is_(None))
        .first()
    )
    if not row:
        return None
    if row.expires_at < datetime.utcnow():
        row.revoked_at = datetime.utcnow()
        db.commit()
        return None
    user = db.get(User, row.user_id)
    return user


def bearer_from_header(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.strip().split(None, 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip() or None


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    token = bearer_from_header(authorization)
    user = resolve_session_user(db, token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user


def get_optional_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    return resolve_session_user(db, bearer_from_header(authorization))


def require_self(user: User, user_id: int) -> None:
    if user.id != user_id:
        raise HTTPException(403, "Forbidden")


def create_password_reset_token(db: Session, user: User) -> str:
    settings = get_settings()
    # Invalidate prior unused tokens for this user
    prior = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
        .all()
    )
    now = datetime.utcnow()
    for row in prior:
        row.used_at = now
    raw = secrets.token_urlsafe(32)
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=_hash_token(raw),
            expires_at=now + timedelta(minutes=settings.reset_token_ttl_minutes),
        )
    )
    db.commit()
    return raw


def consume_password_reset_token(db: Session, raw: str) -> User | None:
    row = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == _hash_token(raw))
        .first()
    )
    if not row or row.used_at is not None:
        return None
    if row.expires_at < datetime.utcnow():
        return None
    user = db.get(User, row.user_id)
    if not user:
        return None
    row.used_at = datetime.utcnow()
    db.commit()
    return user


# --- simple in-process rate limits (best-effort; not multi-worker durable) ---
_rate: dict[str, list[float]] = {}


def rate_limit(key: str, *, limit: int, window_sec: float, request: Request | None = None) -> None:
    import time

    ip = ""
    if request is not None:
        ip = (request.client.host if request.client else "") or ""
    bucket = f"{key}:{ip}"
    now = time.time()
    hits = [t for t in _rate.get(bucket, []) if now - t < window_sec]
    if len(hits) >= limit:
        raise HTTPException(429, "Too many attempts. Try again later.")
    hits.append(now)
    _rate[bucket] = hits
