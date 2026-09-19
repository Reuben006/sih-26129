from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Swayam Dudhela"])
    email: EmailStr = Field(..., examples=["swayam@example.com"])
    password: str = Field(..., min_length=6, max_length=100, examples=["SecretPass123!"])
    role: Optional[UserRole] = UserRole.CITIZEN

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
