from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. APPLICATION_CREATED, DATA_TRANSFORMED, CONNECTOR_DISPATCH, DEPARTMENT_APPROVED, CONSENT_GRANTED
    entity = Column(String(50), nullable=False)  # e.g. APPLICATION, CONNECTOR, CONSENT, WORKFLOW
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
    application = relationship("Application", back_populates="audit_logs")
