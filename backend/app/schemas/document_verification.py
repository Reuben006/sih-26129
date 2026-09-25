from pydantic import BaseModel
from typing import Optional


class VerificationAction(BaseModel):
    status: str
    remarks: Optional[str] = None