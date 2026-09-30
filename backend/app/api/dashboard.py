from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.application import Application, ApplicationDepartment, OverallStatus, DepartmentStatus
from app.models.department import Department
from app.models.audit import AuditLog
from app.schemas.dashboard import DashboardSummaryOut, DepartmentMetric
from app.api.deps import get_current_user
from app.api.mock_departments import SIMULATION_FLAGS

router = APIRouter(prefix="/dashboard", tags=["Monitoring & Dashboards"])

@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Provides high-level system-wide interoperability and processing metrics."""
    total_apps = db.query(Application).count()
    in_progress = db.query(Application).filter(Application.overall_status == OverallStatus.IN_PROGRESS).count()
    approved = db.query(Application).filter(Application.overall_status == OverallStatus.APPROVED).count()
    rejected = db.query(Application).filter(Application.overall_status == OverallStatus.REJECTED).count()
    failed = db.query(Application).filter(Application.overall_status == OverallStatus.FAILED).count()

    # Department-wise breakdown
    departments = db.query(Department).all()
    dept_metrics = []

    for dept in departments:
        assigned = db.query(ApplicationDepartment).filter(ApplicationDepartment.department_id == dept.id).count()
        p_count = db.query(ApplicationDepartment).filter(
            ApplicationDepartment.department_id == dept.id,
            ApplicationDepartment.status.in_([DepartmentStatus.PENDING, DepartmentStatus.SUBMITTED, DepartmentStatus.IN_REVIEW])
        ).count()
        appr_count = db.query(ApplicationDepartment).filter(
            ApplicationDepartment.department_id == dept.id,
            ApplicationDepartment.status == DepartmentStatus.APPROVED
        ).count()
        rej_count = db.query(ApplicationDepartment).filter(
            ApplicationDepartment.department_id == dept.id,
            ApplicationDepartment.status == DepartmentStatus.REJECTED
        ).count()
        err_count = db.query(ApplicationDepartment).filter(
            ApplicationDepartment.department_id == dept.id,
            ApplicationDepartment.status == DepartmentStatus.ERROR
        ).count()

        # Connector health checking simulation flag
        flag_key = f"{dept.code.lower()}_fail"
        is_down = SIMULATION_FLAGS.get(flag_key, False)
        health_status = "DEGRADED" if is_down else "HEALTHY"

        dept_metrics.append(DepartmentMetric(
            department_name=dept.name,
            department_code=dept.code,
            total_assigned=assigned,
            pending=p_count,
            approved=appr_count,
            rejected=rej_count,
            error_count=err_count,
            connector_health=health_status
        ))

    recent_events = db.query(AuditLog).count()

    return DashboardSummaryOut(
        total_applications=total_apps,
        in_progress=in_progress,
        approved=approved,
        rejected=rejected,
        failed=failed,
        avg_processing_time_hours=1.8,
        department_metrics=dept_metrics,
        active_connectors=len(departments),
        recent_events_count=recent_events
    )
