from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    application_id = Column(
        Integer,
        ForeignKey("applications.id"),
        nullable=True
    )

    document_type = Column(String(50), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)

    verification_status = Column(
        String(30),
        default="PENDING"
    )

    verified_by = Column(
        Integer,
        nullable=True
    )

    verification_remarks = Column(
        String(500),
        nullable=True
    )

    verified_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship("User")


    application = relationship(
        "Application",
        back_populates="documents"
    )