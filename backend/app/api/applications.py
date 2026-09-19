from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.application import Application, ApplicationDepartment, DepartmentStatus
from app.schemas.application import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationDetailOut,
    ApplicationDepartmentOut,
    DepartmentActionRequest
)
from app.api.deps import get_current_user, get_current_official_or_admin
from app.services.application_service import ApplicationService
from app.workflow.engine import WorkflowEngine

router = APIRouter(prefix="/applications", tags=["Applications & Tracking"])

@router.post("", response_model=ApplicationDetailOut, status_code=status.HTTP_201_CREATED)
async def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits common establishment details ONCE.
    Initiates canonical schema validation, consent generation,
    and automatic sequential dispatch across registered departments.
    """
    success, application, msg = await ApplicationService.create_application(
        db=db,
        app_in=app_in,
        current_user=current_user
    )

    if not success or not application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_code": "APPLICATION_SUBMISSION_FAILED", "message": msg}
        )

    # Re-fetch full details
    return application

@router.get("", response_model=List[ApplicationOut])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List applications for citizen (own) or official/admin (all)."""
    return ApplicationService.get_applications(db=db, user=current_user)

@router.get("/{app_id}", response_model=ApplicationDetailOut)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full application data, canonical schema, and department tracking details."""
    app = ApplicationService.get_application_by_id(db=db, app_id=app_id, user=current_user)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    return app

@router.get("/{app_id}/departments", response_model=List[ApplicationDepartmentOut])
def get_application_departments(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns department statuses and transformed data formats for the application."""
    app = ApplicationService.get_application_by_id(db=db, app_id=app_id, user=current_user)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    return app.department_statuses

@router.patch("/{app_id}/departments/{department_id}")
async def update_department_status(
    app_id: int,
    department_id: int,
    action_in: DepartmentActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_official_or_admin)
):
    """
    Department action handler: Allows department officials to approve or reject an application stage.
    Triggers the workflow engine to orchestrate the next department or finalize the application.
    """
    success, message, extra = await WorkflowEngine.process_department_decision(
        db=db,
        application_id=app_id,
        department_id=department_id,
        decision_status=action_in.status,
        remarks=action_in.remarks,
        officer_user_id=current_user.id
    )

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {
        "success": True,
        "message": message,
        "details": extra
    }
