from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False) # e.g. MUNICIPALITY, FSSAI, FIRE
    connector_type = Column(String(50), nullable=False) # e.g. REST_JSON, SOAP_XML, RPC
    description = Column(String(255), nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    # Relationships
    workflow_steps = relationship("WorkflowStep", back_populates="department")
    application_departments = relationship("ApplicationDepartment", back_populates="department")
