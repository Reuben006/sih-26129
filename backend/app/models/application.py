import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class OverallStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"

class DepartmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ERROR = "ERROR"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    application_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    
    # Common Canonical Data
    business_name = Column(String(200), nullable=False)
    owner_name = Column(String(150), nullable=False)
    address = Column(String(300), nullable=False)
    pan = Column(String(10), index=True, nullable=False)
    mobile = Column(String(15), nullable=False)
    
    # Full canonical JSON payload (supports extensible attributes like seating_capacity, building_area, etc.)
    canonical_payload = Column(JSON, nullable=True)
    
    current_step_order = Column(Integer, default=1, nullable=False)
    overall_status = Column(SQLEnum(OverallStatus), default=OverallStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="applications")
    workflow = relationship("Workflow", back_populates="applications")
    documents = relationship(
        "Document",
        back_populates="application"
    )
    department_statuses = relationship("ApplicationDepartment", back_populates="application", cascade="all, delete-orphan", order_by="ApplicationDepartment.id")
    consents = relationship("Consent", back_populates="application", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="application", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="application", cascade="all, delete-orphan")

class ApplicationDepartment(Base):
    __tablename__ = "application_departments"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    
    status = Column(SQLEnum(DepartmentStatus), default=DepartmentStatus.PENDING, nullable=False)
    external_reference = Column(String(100), nullable=True) # e.g. MUNI-93821, FSSAI-48211
    
    submitted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Transformation tracking: shows the exact data converted and response returned
    request_payload = Column(JSON, nullable=True)
    response_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)

    # Relationships
    application = relationship("Application", back_populates="department_statuses")
    department = relationship("Department", back_populates="application_departments")
