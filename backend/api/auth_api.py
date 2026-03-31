from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session

from database.models import User
from database.db import SessionLocal
from auth.auth_handler import (
    hash_password, verify_password,
    create_access_token, get_current_user_id
)

router = APIRouter(prefix="/auth", tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Schemas ────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    # Role is always 'patient' — doctors don't use this product


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    name: str


# ── Routes ─────────────────────────────────────────
@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        hashed_password=hash_password(req.password),
        role="patient",  # Always patient
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Update last login timestamp
    user.last_login = datetime.utcnow()
    db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    }


@router.get("/me")
def get_me(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }


@router.put("/profile/update")
def update_profile(req: ProfileUpdateRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.name = req.name.strip()
    db.commit()
    return {"message": "Profile updated successfully.", "name": user.name, "role": user.role}


@router.get("/activity")
def get_activity(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Fetch the authenticated user's own consultation history."""
    from database.models import Consultation
    consultations = (
        db.query(Consultation)
        .filter(Consultation.user_id == user_id)
        .order_by(Consultation.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": c.id,
            "disease": c.predicted_disease,
            "triage": c.triage.get("level") if c.triage else "N/A",
            "drug": c.treatment.get("recommended_drug") if c.treatment else "N/A",
            "symptoms": c.symptoms,
            "age": c.age,
            "gender": c.gender,
            "date": c.created_at.strftime("%b %d, %Y · %I:%M %p") if c.created_at else "N/A",
            "lifestyle": c.treatment.get("lifestyle", []) if c.treatment else [],
            "dosage": c.treatment.get("dosage", "As prescribed") if c.treatment else "As prescribed",
            "duration": c.treatment.get("duration", "As advised") if c.treatment else "As advised",
        }
        for c in consultations
    ]

class ForgotPasswordRequest(BaseModel):
    email: str
    new_password: str


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Reset password by email. In production, this would require email verification.
    For now, allows reset if the email exists."""
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email address.")
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")
    
    user.hashed_password = hash_password(req.new_password)
    user.last_login = datetime.utcnow()
    db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "message": "Password reset successfully. You are now logged in.",
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    }