from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.department import Department
from app.schemas.department import DepartmentOut, DepartmentCreate
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/departments", tags=["Department Registries & Connectors"])

@router.get("", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    """List all registered government departments and connector configurations."""
    return db.query(Department).all()

@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    admin_user = Depends(get_current_admin)
):
    """Register a new government department and connector mapping."""
    existing = db.query(Department).filter(Department.code == dept_in.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this code already exists.")

    dept = Department(
        name=dept_in.name,
        code=dept_in.code.upper(),
        connector_type=dept_in.connector_type,
        description=dept_in.description,
        active=dept_in.active
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept
