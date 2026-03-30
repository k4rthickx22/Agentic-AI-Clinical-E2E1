import os
import warnings
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Suppress passlib warnings about bcrypt
warnings.filterwarnings("ignore", category=UserWarning)

SECRET_KEY = os.getenv("SECRET_KEY", "ai-clinic-super-secret-key-2026-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# sha256_crypt: fully compatible with passlib 1.7.4, no length limit, fast.
# Note: bcrypt 5.x breaks passlib 1.7.4 (ValueError on hash), so we use sha256_crypt.
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)



def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> int:
    """FastAPI dependency — extracts user_id from bearer token."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token payload invalid")
    return int(user_id)


def get_current_user_id_from_token(token: str) -> Optional[int]:
    """Decode user_id from a raw token string (no FastAPI DI)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except Exception:
        return None


def get_optional_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> Optional[int]:
    """Returns user_id if token present, None otherwise (for public routes)."""
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except Exception:
        return None
