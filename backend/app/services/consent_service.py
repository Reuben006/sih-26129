from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.consent import Consent, ConsentStatus
from app.services.audit_service import AuditService

class ConsentService:
    @staticmethod
    def grant_consent(
        db: Session,
        application_id: int,
        user_id: int,
        data_scope: str = "Identity, Business Details, Premises Address, Contact",
        purpose: str = "Inter-departmental verification for Single Window Restaurant Clearance"
    ) -> Consent:
        consent = Consent(
            application_id=application_id,
            user_id=user_id,
            data_scope=data_scope,
            purpose=purpose,
            granted_at=datetime.now(timezone.utc),
            status=ConsentStatus.ACTIVE
        )
        db.add(consent)
        db.commit()
        db.refresh(consent)

        AuditService.log(
            db=db,
            action="CONSENT_GRANTED",
            entity="CONSENT",
            user_id=user_id,
            application_id=application_id,
            details={
                "consent_id": consent.id,
                "data_scope": data_scope,
                "purpose": purpose
            }
        )
        return consent

    @staticmethod
    def revoke_consent(db: Session, application_id: int, user_id: int) -> Optional[Consent]:
        consent = db.query(Consent).filter(
            Consent.application_id == application_id,
            Consent.user_id == user_id,
            Consent.status == ConsentStatus.ACTIVE
        ).first()

        if consent:
            consent.status = ConsentStatus.REVOKED
            consent.revoked_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(consent)

            AuditService.log(
                db=db,
                action="CONSENT_REVOKED",
                entity="CONSENT",
                user_id=user_id,
                application_id=application_id,
                details={"consent_id": consent.id}
            )
        return consent

    @staticmethod
    def get_consents_for_application(db: Session, application_id: int) -> List[Consent]:
        return db.query(Consent).filter(Consent.application_id == application_id).all()
