from pydantic import BaseModel
from typing import Optional

class DepartmentBase(BaseModel):
    name: str
    code: str
    connector_type: str
    description: Optional[str] = None
    active: bool = True

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: int

    class Config:
        from_attributes = True
