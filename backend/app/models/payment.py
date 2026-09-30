import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Float, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"


class ApplicationPayment(Base):
    __tablename__ = "application_payments"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    amount = Column(Float, nullable=False, default=500.0)
    status = Column(SQLEnum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    transaction_id = Column(String(100), unique=True, nullable=True)
    receipt_number = Column(String(100), unique=True, nullable=True)
    license_number = Column(String(100), unique=True, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    application = relationship("Application", back_populates="payment")
