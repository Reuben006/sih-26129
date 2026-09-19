from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole
from app.schemas.auth import UserRegister, UserLogin, UserOut, Token
from app.api.deps import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/auth", tags=["Authentication & Identity"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower(),
        password_hash=hash_password(user_in.password),
        role=user_in.role or UserRole.CITIZEN
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    AuditService.log(
        db=db,
        action="USER_REGISTERED",
        entity="USER",
        user_id=user.id,
        details={"email": user.email, "role": user.role.value}
    )

    token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    AuditService.log(
        db=db,
        action="USER_LOGIN",
        entity="USER",
        user_id=user.id,
        details={"email": user.email, "role": user.role.value}
    )

    token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
