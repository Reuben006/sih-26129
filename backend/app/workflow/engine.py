from datetime import datetime, timezone
from typing import Tuple, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.application import Application, ApplicationDepartment, OverallStatus, DepartmentStatus
from app.models.workflow import Workflow, WorkflowStep
from app.services.interoperability_service import InteroperabilityService
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService

class WorkflowEngine:
    @staticmethod
    async def initialize_and_start(
        db: Session,
        application: Application
    ) -> Tuple[bool, str]:
        """
        Initializes the workflow state machine for a newly created application.
        Prepares ApplicationDepartment records for all steps in the workflow,
        and automatically dispatches Step 1.
        """
        workflow: Workflow = db.query(Workflow).filter(Workflow.id == application.workflow_id).first()
        if not workflow or not workflow.steps:
            return False, "Configured workflow has no steps defined."

        sorted_steps = sorted(workflow.steps, key=lambda s: s.step_order)

        # Ensure all steps have corresponding ApplicationDepartment tracking entries
        for step in sorted_steps:
            existing = db.query(ApplicationDepartment).filter(
                ApplicationDepartment.application_id == application.id,
                ApplicationDepartment.department_id == step.department_id
            ).first()
            if not existing:
                app_dept = ApplicationDepartment(
                    application_id=application.id,
                    department_id=step.department_id,
                    status=DepartmentStatus.PENDING
                )
                db.add(app_dept)
        db.commit()

        # Start Step 1
        first_step = sorted_steps[0]
        first_app_dept = db.query(ApplicationDepartment).filter(
            ApplicationDepartment.application_id == application.id,
            ApplicationDepartment.department_id == first_step.department_id
        ).first()

        application.current_step_order = first_step.step_order
        application.overall_status = OverallStatus.IN_PROGRESS
        db.commit()

        AuditService.log(
            db=db,
            action="WORKFLOW_STARTED",
            entity="WORKFLOW",
            user_id=application.user_id,
            application_id=application.id,
            details={
                "workflow_name": workflow.name,
                "first_department": first_step.department.name,
                "total_steps": len(sorted_steps)
            }
        )

        success, result = await InteroperabilityService.dispatch_to_department(
            db=db,
            application=application,
            app_dept=first_app_dept
        )

        if not success:
            application.overall_status = OverallStatus.FAILED
            db.commit()
            return False, f"Dispatch to initial department ({first_step.department.name}) failed: {result.get('error')}"

        return True, f"Workflow initialized. First step dispatched to {first_step.department.name}."

    @staticmethod
    async def process_department_decision(
        db: Session,
        application_id: int,
        department_id: int,
        decision_status: DepartmentStatus, # APPROVED or REJECTED
        remarks: Optional[str] = None,
        officer_user_id: Optional[int] = None
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Transitions the workflow when a department officer issues an approval, rejection, or inspection outcome.
        """
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            return False, "Application not found", {}

        app_dept = db.query(ApplicationDepartment).filter(
            ApplicationDepartment.application_id == application_id,
            ApplicationDepartment.department_id == department_id
        ).first()

        if not app_dept:
            return False, "Department record not found for application", {}

        dept_name = app_dept.department.name

        # A department can act only after GovConnect has dispatched this stage.
        if decision_status in [DepartmentStatus.APPROVED, DepartmentStatus.REJECTED]:
            if app_dept.status not in [DepartmentStatus.SUBMITTED, DepartmentStatus.IN_REVIEW]:
                return False, f"{dept_name} cannot act before this application is dispatched to the department.", {}

            workflow_steps = db.query(WorkflowStep).filter(
                WorkflowStep.workflow_id == application.workflow_id
            ).order_by(WorkflowStep.step_order).all()
            active_step = next(
                (s for s in workflow_steps if s.department_id == department_id),
                None
            )
            if active_step and active_step.step_order != application.current_step_order:
                return False, f"{dept_name} cannot act before the current workflow stage is completed.", {}

        # Update department state
        app_dept.status = decision_status
        app_dept.completed_at = datetime.now(timezone.utc)
        if remarks:
            if not app_dept.response_data:
                app_dept.response_data = {}
            if isinstance(app_dept.response_data, dict):
                app_dept.response_data["officer_remarks"] = remarks
        db.commit()

        AuditService.log(
            db=db,
            action=f"DEPARTMENT_{decision_status.value}",
            entity="DEPARTMENT_DECISION",
            user_id=officer_user_id,
            application_id=application.id,
            details={
                "department": dept_name,
                "status": decision_status.value,
                "remarks": remarks
            }
        )

        # CASE 1: REJECTION
        if decision_status == DepartmentStatus.REJECTED:
            application.overall_status = OverallStatus.REJECTED
            db.commit()

            NotificationService.send(
                db=db,
                user_id=application.user_id,
                application_id=application.id,
                title=f"Application Rejected by {dept_name}",
                message=f"Application {application.application_number} was rejected by {dept_name}. Reason: {remarks or 'Did not meet compliance criteria'}",
                msg_type="DANGER"
            )

            AuditService.log(
                db=db,
                action="APPLICATION_REJECTED",
                entity="WORKFLOW",
                user_id=officer_user_id,
                application_id=application.id,
                details={"rejected_by": dept_name, "reason": remarks}
            )
            return True, f"Application rejected by {dept_name}.", {"overall_status": application.overall_status.value}

        # CASE 2: APPROVAL
        if decision_status == DepartmentStatus.APPROVED:
            NotificationService.send(
                db=db,
                user_id=application.user_id,
                application_id=application.id,
                title=f"Approved by {dept_name}",
                message=f"Stage clearance granted by {dept_name} for application {application.application_number}.",
                msg_type="SUCCESS"
            )

            # Determine next step in sequence
            workflow_steps = db.query(WorkflowStep).filter(
                WorkflowStep.workflow_id == application.workflow_id
            ).order_by(WorkflowStep.step_order).all()

            current_step = next((s for s in workflow_steps if s.department_id == department_id), None)
            current_order = current_step.step_order if current_step else application.current_step_order

            next_step = next((s for s in workflow_steps if s.step_order > current_order), None)

        if next_step:
            # Advance to next department
            application.current_step_order = next_step.step_order
            db.commit()

            next_app_dept = db.query(ApplicationDepartment).filter(
                ApplicationDepartment.application_id == application.id,
                ApplicationDepartment.department_id == next_step.department_id
            ).first()

            success, dispatch_res = await InteroperabilityService.dispatch_to_department(
                db=db,
                application=application,
                app_dept=next_app_dept
            )

            if not success:
                application.overall_status = OverallStatus.FAILED
                db.commit()

                return True, (
                    f"Approved by {dept_name}, but dispatch to next "
                    f"department ({next_step.department.name}) failed."
                ), {
                    "overall_status": application.overall_status.value
                }

            AuditService.log(
                db=db,
                action="WORKFLOW_ADVANCED",
                entity="WORKFLOW",
                user_id=officer_user_id,
                application_id=application.id,
                details={
                    "previous_department": dept_name,
                    "next_department": next_step.department.name,
                    "step_order": next_step.step_order
                }
            )

            return True, (
                f"Approved by {dept_name}. Application advanced "
                f"and dispatched to {next_step.department.name}."
            ), {
                "overall_status": application.overall_status.value,
                "next_department": next_step.department.name
            }

        else:
            # No next department means this was the final approval
            application.overall_status = OverallStatus.APPROVED
            db.commit()

            AuditService.log(
                db=db,
                action="ALL_DEPARTMENTS_APPROVED",
                entity="WORKFLOW",
                user_id=officer_user_id,
                application_id=application.id,
                details={
                    "message": "All required department clearances completed."
                }
            )

            NotificationService.send(
                db=db,
                user_id=application.user_id,
                application_id=application.id,
                title="All Department Clearances Granted",
                message=(
                    f"Application {application.application_number} "
                    f"has received all required departmental approvals."
                ),
                msg_type="SUCCESS"
            )

            return True, "All departments approved.", {
                "overall_status": application.overall_status.value
            }
           