from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DocumentOut(BaseModel):
    id: int
    document_type: str
    file_name: str
    file_path: str

    verification_status: str
    verified_by: Optional[int] = None
    verification_remarks: Optional[str] = None
    verified_at: Optional[datetime] = None

    created_at: datetime

    class Config:
        from_attributes = True