import secrets
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.application import Application, ApplicationDepartment, OverallStatus, DepartmentStatus
from app.models.payment import ApplicationPayment, PaymentStatus
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService


class PaymentService:
    PROTOTYPE_SERVICE_FEE = 500.0

    @staticmethod
    def get_or_create(db: Session, application: Application) -> ApplicationPayment:
        payment = db.query(ApplicationPayment).filter(
            ApplicationPayment.application_id == application.id
        ).first()
        if not payment:
            payment = ApplicationPayment(
                application_id=application.id,
                amount=PaymentService.PROTOTYPE_SERVICE_FEE,
                status=PaymentStatus.PENDING
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)
        return payment

    @staticmethod
    def can_pay(db: Session, application: Application) -> bool:
        if application.overall_status != OverallStatus.PAYMENT_PENDING:
            return False
        departments = db.query(ApplicationDepartment).filter(
            ApplicationDepartment.application_id == application.id
        ).all()
        return bool(departments) and all(
            d.status == DepartmentStatus.APPROVED for d in departments
        )

    @staticmethod
    def pay(db: Session, application: Application, user_id: int):
        if application.user_id != user_id:
            return False, "Only the citizen who submitted this application can make the payment.", None

        if not PaymentService.can_pay(db, application):
            return False, "Payment is available only after all required department clearances are approved.", None

        payment = PaymentService.get_or_create(db, application)
        if payment.status == PaymentStatus.PAID:
            return True, "Payment has already been completed.", payment

        suffix = secrets.token_hex(4).upper()
        payment.status = PaymentStatus.PAID
        payment.transaction_id = f"TXN-{application.application_number}-{suffix}"
        payment.receipt_number = f"RCT-{application.application_number}-{suffix}"
        payment.license_number = f"LIC-MH-{application.application_number.replace('APP-', '')}-{secrets.token_hex(3).upper()}"
        payment.paid_at = datetime.now(timezone.utc)

        application.overall_status = OverallStatus.PAYMENT_COMPLETED
        db.commit()
        db.refresh(payment)

        AuditService.log(
            db=db,
            action="PAYMENT_COMPLETED",
            entity="PAYMENT",
            user_id=user_id,
            application_id=application.id,
            details={
                "amount": payment.amount,
                "transaction_id": payment.transaction_id,
                "receipt_number": payment.receipt_number,
                "license_number": payment.license_number,
            }
        )

        NotificationService.send(
            db=db,
            user_id=user_id,
            application_id=application.id,
            title="Payment Successful",
            message=f"Payment of ₹{payment.amount:.2f} completed successfully. Unified license {payment.license_number} is now available.",
            msg_type="SUCCESS"
        )

        application.overall_status = OverallStatus.APPROVED
        db.commit()
        db.refresh(application)
        return True, "Payment completed. Unified license issued.", payment
