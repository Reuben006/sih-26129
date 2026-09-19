import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base

class ConsentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"

class Consent(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    data_scope = Column(String(255), nullable=False) # e.g. "Identity, Business Details, Premises Address, Contact"
    purpose = Column(Text, nullable=False) # e.g. "Inter-departmental verification for Single Window Restaurant Clearance"
    granted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    status = Column(SQLEnum(ConsentStatus), default=ConsentStatus.ACTIVE, nullable=False)

    # Relationships
    application = relationship("Application", back_populates="consents")
    user = relationship("User", back_populates="consents")
