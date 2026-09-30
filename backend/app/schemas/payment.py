from datetime import datetime
from pydantic import BaseModel


class PaymentOut(BaseModel):
    id: int
    application_id: int
    amount: float
    status: str
    transaction_id: str | None = None
    receipt_number: str | None = None
    license_number: str | None = None
    paid_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True
