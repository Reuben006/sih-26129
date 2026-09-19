from typing import Dict, Any, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.application import Application, ApplicationDepartment, DepartmentStatus
from app.models.department import Department
from app.connectors import get_connector, ConnectorException
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService

class InteroperabilityService:
    @staticmethod
    async def dispatch_to_department(
        db: Session,
        application: Application,
        app_dept: ApplicationDepartment
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Executes canonical data transformation, records the converted payload,
        and submits to the department connector.
        """
        department: Department = app_dept.department
        connector = get_connector(department.code)

        if not connector:
            err_msg = f"No connector registered for department code '{department.code}'"
            app_dept.status = DepartmentStatus.ERROR
            app_dept.error_message = err_msg
            db.commit()
            AuditService.log(
                db=db,
                action="CONNECTOR_NOT_FOUND",
                entity="INTEROPERABILITY",
                user_id=application.user_id,
                application_id=application.id,
                details={"department_code": department.code}
            )
            return False, {"error": err_msg}

        # Step 1: Canonical Schema Transformation
        canonical_data = application.canonical_payload or {
            "business_name": application.business_name,
            "owner_name": application.owner_name,
            "address": application.address,
            "pan": application.pan,
            "mobile": application.mobile
        }

        try:
            transformed_payload = connector.transform_request(canonical_data)
            app_dept.request_payload = transformed_payload
            app_dept.submitted_at = datetime.now(timezone.utc)
            db.commit()

            AuditService.log(
                db=db,
                action="DATA_TRANSFORMED",
                entity="INTEROPERABILITY",
                user_id=application.user_id,
                application_id=application.id,
                details={
                    "department": department.name,
                    "department_code": department.code,
                    "target_schema": f"{department.code}_PROPRIETARY_FORMAT",
                    "transformed_fields": list(transformed_payload.keys())
                }
            )
        except Exception as e:
            err_msg = f"Data transformation failed for {department.name}: {str(e)}"
            app_dept.status = DepartmentStatus.ERROR
            app_dept.error_message = err_msg
            db.commit()
            AuditService.log(
                db=db,
                action="TRANSFORMATION_ERROR",
                entity="INTEROPERABILITY",
                user_id=application.user_id,
                application_id=application.id,
                details={"error": err_msg}
            )
            return False, {"error": err_msg}

        # Step 2: Connector External Gateway Dispatch
        try:
            raw_response = await connector.submit_application(
                transformed_data=transformed_payload,
                application_number=application.application_number
            )

            # Step 3: Response Ingestion & Normalization
            normalized = connector.transform_response(raw_response)
            external_id = normalized.get("external_reference")

            app_dept.status = DepartmentStatus.SUBMITTED
            app_dept.external_reference = external_id
            app_dept.response_data = raw_response
            app_dept.error_message = None
            db.commit()

            AuditService.log(
                db=db,
                action="CONNECTOR_DISPATCHED",
                entity="CONNECTOR",
                user_id=application.user_id,
                application_id=application.id,
                details={
                    "department": department.name,
                    "external_reference": external_id,
                    "status": app_dept.status.value
                }
            )

            NotificationService.send(
                db=db,
                user_id=application.user_id,
                application_id=application.id,
                title=f"Dispatched to {department.name}",
                message=f"Application {application.application_number} has been routed to {department.name}. Reference ID: {external_id}",
                msg_type="INFO"
            )

            return True, raw_response

        except ConnectorException as ce:
            app_dept.status = DepartmentStatus.ERROR
            app_dept.error_message = ce.message
            db.commit()

            AuditService.log(
                db=db,
                action="INTEGRATION_ERROR",
                entity="CONNECTOR",
                user_id=application.user_id,
                application_id=application.id,
                details={
                    "department": department.name,
                    "error_code": ce.error_code,
                    "error_message": ce.message,
                    "http_status": ce.status_code
                }
            )

            NotificationService.send(
                db=db,
                user_id=application.user_id,
                application_id=application.id,
                title=f"Connection Error: {department.name}",
                message=f"Failed to communicate with {department.name} system: {ce.message}",
                msg_type="DANGER"
            )
            return False, {"error": ce.message, "code": ce.error_code}

        except Exception as ex:
            err_msg = f"Unexpected connector gateway exception: {str(ex)}"
            app_dept.status = DepartmentStatus.ERROR
            app_dept.error_message = err_msg
            db.commit()

            AuditService.log(
                db=db,
                action="INTEGRATION_ERROR",
                entity="CONNECTOR",
                user_id=application.user_id,
                application_id=application.id,
                details={"error": err_msg}
            )
            return False, {"error": err_msg}
