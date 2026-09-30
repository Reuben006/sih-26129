from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole
from app.models.department import Department
from app.schemas.auth import UserRegister, UserLogin, UserOut, Token
from app.api.deps import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/auth", tags=["Authentication & Identity"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    if user_in.role != UserRole.CITIZEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only citizen accounts can be self-registered."
        )

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

PORTAL_DEFINITIONS = {
    "CITIZEN": {"role": UserRole.CITIZEN, "department_code": None},
    "MUNICIPALITY": {"role": UserRole.OFFICIAL, "department_code": "MUNICIPALITY"},
    "FSSAI": {"role": UserRole.OFFICIAL, "department_code": "FSSAI"},
    "FIRE": {"role": UserRole.OFFICIAL, "department_code": "FIRE"},
    "GST": {"role": UserRole.OFFICIAL, "department_code": "GST"},
    "SHOPS": {"role": UserRole.OFFICIAL, "department_code": "SHOPS"},
    "ADMIN": {"role": UserRole.ADMIN, "department_code": None},
}


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    portal = login_in.portal.strip().upper()
    definition = PORTAL_DEFINITIONS.get(portal)
    if not definition:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown portal. Please select a valid GovConnect portal."
        )

    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if user.role != definition["role"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account cannot sign in to the {portal} portal."
        )

    expected_department = definition["department_code"]
    if expected_department:
        department = db.query(Department).filter(
            Department.code == expected_department
        ).first()
        if not department or user.department_id != department.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This account is not assigned to the {portal} department."
            )
    elif user.role == UserRole.OFFICIAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Department officials must sign in through their assigned department portal."
        )

    AuditService.log(
        db=db,
        action="USER_LOGIN",
        entity="USER",
        user_id=user.id,
        details={"email": user.email, "role": user.role.value, "portal": portal}
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
