"""Password hashing + test-user seed helpers."""

from __future__ import annotations

import bcrypt
from sqlalchemy.orm import Session

from .models import User

# Explicit test accounts for local / demo login (username → password, tier).
PASSWORD_USERS: list[tuple[str, str, str]] = [
    ("Benjamin", "Wolkje", "biohacker_pro"),
    ("Achi", "Kengnai", "biohacker_pro"),
    ("Katherine", "Max", "biohacker_pro"),
    ("Sam", "sam123", "free"),
    ("Alex", "alex123", "free"),
    ("Jordan", "jordan123", "biohacker_pro"),
    ("Riley", "riley123", "free"),
    ("Casey", "casey123", "free"),
    ("Morgan", "morgan123", "biohacker_pro"),
    ("Taylor", "taylor123", "free"),
]


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def seed_password_users(db: Session) -> None:
    """Idempotent upsert of the 10 username/password test users. Does not wipe charts."""
    for username, password, tier in PASSWORD_USERS:
        email = f"{username.lower()}@test.hd-biohack.local"
        existing = (
            db.query(User)
            .filter((User.username == username) | (User.email == email))
            .first()
        )
        pw_hash = hash_password(password)
        pro = tier == "biohacker_pro"
        if existing:
            existing.username = username
            existing.email = email
            existing.display_name = username
            existing.password_hash = pw_hash
            existing.auth_provider = "password"
            existing.subscription_tier = tier
            existing.biohacking_enabled = pro
        else:
            db.add(
                User(
                    email=email,
                    username=username,
                    display_name=username,
                    password_hash=pw_hash,
                    auth_provider="password",
                    subscription_tier=tier,
                    biohacking_enabled=pro,
                )
            )
    db.commit()


def ensure_dev_users(db: Session) -> None:
    """Keep Dev Free / Dev Pro present (no password). Safe on existing DBs."""
    specs = [
        ("dev.free@example.com", "Dev Free", "free", False),
        ("dev.pro@example.com", "Dev Pro", "biohacker_pro", True),
    ]
    for email, name, tier, enabled in specs:
        row = db.query(User).filter(User.email == email).first()
        if row:
            if not row.username:
                # Leave username null for pure Dev switcher accounts
                pass
            row.auth_provider = "dev"
            row.subscription_tier = tier
            row.biohacking_enabled = enabled
            row.display_name = name
            continue
        db.add(
            User(
                email=email,
                display_name=name,
                auth_provider="dev",
                subscription_tier=tier,
                biohacking_enabled=enabled,
                username=None,
                password_hash=None,
            )
        )
    db.commit()
