from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.workflow import Workflow
from app.models.application import Application
from app.schemas.workflow import WorkflowOut
from app.api.deps import get_current_user
from app.services.workflow_service import WorkflowService
from app.services.application_service import ApplicationService

router = APIRouter(tags=["Workflow Orchestration"])

@router.get("/workflows", response_model=List[WorkflowOut])
def get_workflows(db: Session = Depends(get_db)):
    """Retrieve all defined inter-departmental workflows and their sequential step orders."""
    return WorkflowService.get_all_workflows(db)

@router.get("/applications/{app_id}/workflow")
def get_application_workflow_progress(
    app_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieve current orchestration progress, steps, and timeline for an application."""
    app = ApplicationService.get_application_by_id(db=db, app_id=app_id, user=current_user)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    workflow = app.workflow
    steps_data = []
    for step in sorted(workflow.steps, key=lambda s: s.step_order):
        app_dept = next((ad for ad in app.department_statuses if ad.department_id == step.department_id), None)
        steps_data.append({
            "step_order": step.step_order,
            "department_id": step.department_id,
            "department_name": step.department.name,
            "department_code": step.department.code,
            "status": app_dept.status.value if app_dept else "PENDING",
            "external_reference": app_dept.external_reference if app_dept else None,
            "submitted_at": app_dept.submitted_at.isoformat() if app_dept and app_dept.submitted_at else None,
            "completed_at": app_dept.completed_at.isoformat() if app_dept and app_dept.completed_at else None,
            "is_current": (step.step_order == app.current_step_order and app.overall_status.value in ["IN_PROGRESS", "PENDING"])
        })

    return {
        "application_id": app.id,
        "application_number": app.application_number,
        "workflow_name": workflow.name,
        "overall_status": app.overall_status.value,
        "current_step_order": app.current_step_order,
        "steps": steps_data
    }
