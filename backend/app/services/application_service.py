import random
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.application import Application, ApplicationDepartment, OverallStatus
from app.models.workflow import Workflow
from app.models.user import User, UserRole
from app.schemas.application import ApplicationCreate
from app.workflow.engine import WorkflowEngine
from app.services.consent_service import ConsentService
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService

class ApplicationService:
    @staticmethod
    def generate_application_number(db: Session) -> str:
        """Generate human-readable sequential/unique application number like APP-1001."""
        count = db.query(Application).count()
        return f"APP-{1001 + count}"

    @staticmethod
    async def create_application(
        db: Session,
        app_in: ApplicationCreate,
        current_user: User
    ) -> Tuple[bool, Optional[Application], str]:
        """
        Validates data, checks duplicates, stores canonical payload,
        records consent, and initiates the interoperability workflow.
        """
        # Step 1: Duplicate check (Prevent multiple active submissions with exact same PAN & business name)
        existing_active = db.query(Application).filter(
            Application.pan == app_in.pan,
            Application.business_name == app_in.business_name,
            Application.overall_status.in_([OverallStatus.PENDING, OverallStatus.IN_PROGRESS])
        ).first()

        if existing_active:
            return False, None, f"An active application ({existing_active.application_number}) already exists for PAN {app_in.pan} and establishment '{app_in.business_name}'."

        # Step 2: Determine Workflow
        workflow = db.query(Workflow).filter(
            Workflow.code == (app_in.workflow_code or "RESTAURANT_APPROVAL"),
            Workflow.active == True
        ).first()

        if not workflow:
            # Fallback to first active workflow
            workflow = db.query(Workflow).filter(Workflow.active == True).first()
            if not workflow:
                return False, None, "No active approval workflow configured in the system."

        # Step 3: Canonical Payload Preparation
        canonical_data = {
            "business_name": app_in.business_name.strip(),
            "owner_name": app_in.owner_name.strip(),
            "address": app_in.address.strip(),
            "pan": app_in.pan.strip().upper(),
            "mobile": app_in.mobile.strip(),
            "seating_capacity": app_in.seating_capacity or 50,
            "building_area_sqft": app_in.building_area_sqft or 1200,
            "food_category": app_in.food_category or "Multi-Cuisine Non-Veg & Veg"
        }

        app_number = ApplicationService.generate_application_number(db)

        application = Application(
            application_number=app_number,
            user_id=current_user.id,
            workflow_id=workflow.id,
            business_name=canonical_data["business_name"],
            owner_name=canonical_data["owner_name"],
            address=canonical_data["address"],
            pan=canonical_data["pan"],
            mobile=canonical_data["mobile"],
            canonical_payload=canonical_data,
            current_step_order=1,
            overall_status=OverallStatus.PENDING,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(application)
        db.commit()
        db.refresh(application)

        # Step 4: Record Citizen Consent
        if app_in.grant_consent:
            ConsentService.grant_consent(
                db=db,
                application_id=application.id,
                user_id=current_user.id,
                data_scope="Identity (PAN), Contact Details, Business & Physical Premises",
                purpose="Inter-departmental clearance across Municipal, FSSAI, and Fire Services"
            )

        # Step 5: Audit Log Application Creation
        AuditService.log(
            db=db,
            action="APPLICATION_CREATED",
            entity="APPLICATION",
            user_id=current_user.id,
            application_id=application.id,
            details={
                "application_number": app_number,
                "business_name": application.business_name,
                "workflow": workflow.name
            }
        )

        NotificationService.send(
            db=db,
            user_id=current_user.id,
            application_id=application.id,
            title="Application Submitted Successfully",
            message=f"Your restaurant approval application {app_number} has been created and queued for federated verification.",
            msg_type="INFO"
        )

        # Step 6: Trigger Workflow Engine & Interoperability Layer
        success, msg = await WorkflowEngine.initialize_and_start(db, application)
        db.refresh(application)

        return True, application, f"Application {app_number} created and dispatched. {msg}"

    @staticmethod
    def get_applications(db: Session, user: User) -> List[Application]:
        if user.role == UserRole.CITIZEN:
            return db.query(Application).filter(Application.user_id == user.id).order_by(Application.created_at.desc()).all()
        # OFFICIAL and ADMIN can see all applications
        return db.query(Application).order_by(Application.created_at.desc()).all()

    @staticmethod
    def get_application_by_id(db: Session, app_id: int, user: User) -> Optional[Application]:
        query = db.query(Application).filter(Application.id == app_id)
        if user.role == UserRole.CITIZEN:
            query = query.filter(Application.user_id == user.id)
        return query.first()

    @staticmethod
    def get_application_by_number(db: Session, app_num: str) -> Optional[Application]:
        return db.query(Application).filter(Application.application_number == app_num).first()
