from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.consent import ConsentStatus

class ConsentCreate(BaseModel):
    data_scope: str = "Identity, Business Details, Premises Address, Contact"
    purpose: str = "Inter-departmental verification for Single Window Restaurant Clearance"

class ConsentOut(BaseModel):
    id: int
    application_id: int
    user_id: int
    data_scope: str
    purpose: str
    granted_at: datetime
    revoked_at: Optional[datetime] = None
    status: ConsentStatus

    class Config:
        from_attributes = True
