from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from app.core.database import Base

class DocumentVerification(Base):
    __tablename__ = "document_verifications"

    id = Column(Integer, primary_key=True)

    document_id = Column(Integer)

    status = Column(String, default="PENDING")

    remarks = Column(String)

    verified_by = Column(Integer)

    verified_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)