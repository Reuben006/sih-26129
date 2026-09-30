from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.audit import AuditLogOut
from app.api.deps import get_current_user, get_current_official_or_admin
from app.services.audit_service import AuditService
from app.services.application_service import ApplicationService

router = APIRouter(tags=["Audit & Compliance Logs"])

@router.get("/applications/{app_id}/audit", response_model=List[AuditLogOut])
def get_application_audit_logs(
    app_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieve immutable chronological audit records for a specific application."""
    app = ApplicationService.get_application_by_id(db=db, app_id=app_id, user=current_user)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    return AuditService.get_logs_by_application(db=db, application_id=app_id)

@router.get("/audit/logs", response_model=List[AuditLogOut])
def get_all_system_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_official_or_admin)
):
    """Retrieve system-wide audit trail for compliance officers and administrators."""
    return AuditService.get_all_logs(db=db, limit=limit)
