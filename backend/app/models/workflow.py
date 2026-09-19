from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. RESTAURANT_APPROVAL
    description = Column(String(255), nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    # Relationships
    steps = relationship("WorkflowStep", back_populates="workflow", order_by="WorkflowStep.step_order", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="workflow")

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    step_order = Column(Integer, nullable=False) # 1, 2, 3...
    required = Column(Boolean, default=True, nullable=False)

    # Relationships
    workflow = relationship("Workflow", back_populates="steps")
    department = relationship("Department", back_populates="workflow_steps")
