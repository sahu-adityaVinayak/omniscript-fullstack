from datetime import datetime, timedelta, timezone
import base64
import hashlib
import hmac
import os

from jose import JWTError, jwt

from app.core.config import settings


PBKDF2_ITERATIONS = 390000
HASH_SCHEME = "pbkdf2_sha256"


def _pbkdf2_hash(password: str, salt: bytes) -> str:
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return base64.urlsafe_b64encode(dk).decode("utf-8")


def get_password_hash(password: str) -> str:
    salt = os.urandom(16)
    salt_encoded = base64.urlsafe_b64encode(salt).decode("utf-8")
    digest = _pbkdf2_hash(password, salt)
    return f"{HASH_SCHEME}${PBKDF2_ITERATIONS}${salt_encoded}${digest}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        scheme, iterations_str, salt_encoded, expected_digest = hashed_password.split("$", 3)
        if scheme != HASH_SCHEME:
            return False

        iterations = int(iterations_str)
        if iterations != PBKDF2_ITERATIONS:
            return False

        salt = base64.urlsafe_b64decode(salt_encoded.encode("utf-8"))
        actual_digest = _pbkdf2_hash(plain_password, salt)
        return hmac.compare_digest(actual_digest, expected_digest)
    except Exception:
        return False


def create_token(subject: str, token_type: str, expires_in_minutes: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_in_minutes)
    payload = {"sub": subject, "type": token_type, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str) -> str:
    return create_token(subject=subject, token_type="access", expires_in_minutes=settings.access_token_expire_minutes)


def create_refresh_token(subject: str) -> str:
    return create_token(subject=subject, token_type="refresh", expires_in_minutes=settings.refresh_token_expire_minutes)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc
