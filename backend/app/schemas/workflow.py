from pydantic import BaseModel
from typing import List, Optional
from app.schemas.department import DepartmentOut

class WorkflowStepOut(BaseModel):
    id: int
    workflow_id: int
    department_id: int
    step_order: int
    required: bool
    department: DepartmentOut

    class Config:
        from_attributes = True

class WorkflowOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    active: bool
    steps: List[WorkflowStepOut] = []

    class Config:
        from_attributes = True
