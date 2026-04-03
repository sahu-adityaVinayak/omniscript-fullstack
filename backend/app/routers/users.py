from datetime import datetime, timedelta, timezone
from random import randint

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.mailer import send_otp_email
from app.db import get_db
from app.deps import get_current_user
from app.models import PasswordOtp, User
from app.schemas import (
    MessageResponse,
    PasswordOtpRequest,
    PasswordOtpRequestResponse,
    PasswordOtpVerifyRequest,
    ProfileUpdateRequest,
    UserResponse,
)
from app.security import get_password_hash

router = APIRouter(prefix="/api/v1/users", tags=["users"])


def normalize_email(email: str) -> str:
    return email.strip().lower()


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(id=current_user.id, name=current_user.name, email=current_user.email)


@router.put("/me", response_model=UserResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    next_email = normalize_email(payload.email)

    existing = db.query(User).filter(User.email == next_email, User.id != current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    current_user.name = payload.name.strip()
    current_user.email = next_email
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return UserResponse(id=current_user.id, name=current_user.name, email=current_user.email)


@router.post("/password/request-otp", response_model=PasswordOtpRequestResponse)
def request_password_otp(
    payload: PasswordOtpRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    email = normalize_email(payload.email)
    if email != current_user.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email must match your account")

    db.query(PasswordOtp).filter(PasswordOtp.user_id == current_user.id, PasswordOtp.used.is_(False)).update(
        {PasswordOtp.used: True}, synchronize_session=False
    )

    otp_code = f"{randint(100000, 999999)}"
    otp = PasswordOtp(
        user_id=current_user.id,
        otp_code=otp_code,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.otp_expire_minutes),
        used=False,
    )
    db.add(otp)
    db.commit()

    sent = send_otp_email(current_user.email, otp_code)

    if sent:
        return PasswordOtpRequestResponse(message="OTP sent to your email")

    # Dev fallback when SMTP is not configured.
    if settings.dev_return_otp:
        return PasswordOtpRequestResponse(
            message="SMTP not configured. OTP returned for development only.",
            dev_otp_code=otp_code,
        )

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to send OTP email. Configure SMTP settings.",
    )


@router.post("/password/verify-otp", response_model=MessageResponse)
def verify_password_otp(
    payload: PasswordOtpVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    email = normalize_email(payload.email)
    if email != current_user.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email must match your account")

    otp = (
        db.query(PasswordOtp)
        .filter(
            PasswordOtp.user_id == current_user.id,
            PasswordOtp.otp_code == payload.otp_code.strip(),
            PasswordOtp.used.is_(False),
        )
        .order_by(PasswordOtp.created_at.desc())
        .first()
    )

    if not otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")

    now = datetime.now(timezone.utc)
    expires = otp.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if expires < now:
        otp.used = True
        db.add(otp)
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")

    current_user.hashed_password = get_password_hash(payload.new_password)
    otp.used = True
    db.add(current_user)
    db.add(otp)
    db.commit()

    return MessageResponse(message="Password updated successfully")
