from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.models import User, OTPSession
from schema.schema import UserRegister, UserLogin, OTPVerification
from core.authentication import hash_password, verify_password, create_jwt_token
from core.otp import generate_otp, verify_otp
from core.authentication import generate_otp_secret
from core.email import send_otp_email, send_welcome_email
from datetime import datetime, timedelta
import secrets
from core.config import OTP_SESSION_EXPIRATION_MINUTES, JWT_EXPIRATION_HOURS, OTP_IS_ENABLED

auth_router = APIRouter(tags=["Authentication"])

@auth_router.post("/auth/register")
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    password_hash = hash_password(user_data.password)
    otp_secret = generate_otp_secret()

    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=password_hash,
        otp_secret=otp_secret
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Send welcome email
    email_sent = send_welcome_email(user.email, user.username)

    return {
        "message": "User registered successfully",
        "note": "Welcome email sent to your email address" if email_sent else "Registration successful"
    }

@auth_router.post("/auth/login")
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and optionally initiate OTP verification"""
    user = db.query(User).filter(
        User.username == login_data.username,
        User.is_active == True
    ).first()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not OTP_IS_ENABLED:
        jwt_token = create_jwt_token(user.id, user.username)
        return {
            "message": "Login successful (OTP disabled)",
            "access_token": jwt_token,
            "token_type": "bearer",
            "expires_in_hours": JWT_EXPIRATION_HOURS,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        }

    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_SESSION_EXPIRATION_MINUTES)

    otp_session = OTPSession(
        user_id=user.id,
        session_token=session_token,
        expires_at=expires_at,
        is_verified=False
    )

    db.add(otp_session)
    db.commit()

    current_otp = generate_otp(user.otp_secret)

    # Send OTP to user's email
    email_sent = send_otp_email(user.email, current_otp, user.username)

    if not email_sent:
        # Clean up session if email failed
        db.delete(otp_session)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email. Please try again or contact support."
        )

    return {
        "message": "Login successful. OTP sent to your email address.",
        "session_token": session_token,
        "expires_in_minutes": OTP_SESSION_EXPIRATION_MINUTES,
        "note": f"Please check {user.email} for your verification code"
    }

@auth_router.post("/auth/verify-otp")
def verify_user_otp(otp_data: OTPVerification, db: Session = Depends(get_db)):
    """Verify OTP and return JWT token (or bypass if OTP is disabled)"""

    if not OTP_IS_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP verification is currently disabled."
        )

    session = db.query(OTPSession).join(User).filter(
        OTPSession.session_token == otp_data.session_token,
        OTPSession.expires_at > datetime.utcnow(),
        OTPSession.is_verified == False
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired session token"
        )

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user or not verify_otp(user.otp_secret, otp_data.otp_code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP code"
        )

    session.is_verified = True
    user.last_login_at = datetime.utcnow()
    db.commit()

    jwt_token = create_jwt_token(user.id, user.username)

    return {
        "message": "OTP verified successfully",
        "access_token": jwt_token,
        "token_type": "bearer",
        "expires_in_hours": JWT_EXPIRATION_HOURS,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }
