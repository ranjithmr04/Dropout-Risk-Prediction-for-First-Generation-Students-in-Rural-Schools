import os
import bcrypt

from datetime import datetime, timedelta, timezone

from fastapi.security import OAuth2PasswordBearer
from jose import jwt


# ============================================================
# JWT SETTINGS
# ============================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "dropout-risk-secret-key-change-this"
)

ALGORITHM = "HS256"


# ============================================================
# OAUTH TOKEN
# ============================================================

token = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise ValueError(
            "Password must be 72 bytes or less."
        )

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


# ============================================================
# PASSWORD VERIFICATION
# ============================================================

def verify_password(
    password: str,
    password_hash: str
) -> bool:

    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        return False

    try:
        return bcrypt.checkpw(
            password_bytes,
            password_hash.encode("utf-8")
        )

    except (ValueError, TypeError):
        return False


# ============================================================
# CREATE JWT TOKEN
# ============================================================

def create_access_token(
    data: dict,
    expires_minutes: int = 60
):

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# JWT DECODE FUNCTION
# ============================================================

def decode(
    token_value: str,
    key: str = SECRET_KEY,
    algorithms=None
):

    if algorithms is None:
        algorithms = [ALGORITHM]

    return jwt.decode(
        token_value,
        key,
        algorithms=algorithms
    )