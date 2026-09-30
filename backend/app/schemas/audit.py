from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    application_id: Optional[int] = None
    action: str
    entity: str
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
