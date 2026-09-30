from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.consent import ConsentCreate, ConsentOut
from app.api.deps import get_current_user
from app.services.consent_service import ConsentService
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["Consent & DPDP Framework"])

@router.post("/{app_id}/consent", response_model=ConsentOut, status_code=status.HTTP_201_CREATED)
def grant_application_consent(
    app_id: int,
    consent_in: ConsentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Explicitly grant consent to share common establishment data across departments."""
    app = ApplicationService.get_application_by_id(db=db, app_id=app_id, user=current_user)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    consent = ConsentService.grant_consent(
        db=db,
        application_id=app_id,
        user_id=current_user.id,
        data_scope=consent_in.data_scope,
        purpose=consent_in.purpose
    )
    return consent

@router.get("/{app_id}/consent", response_model=List[ConsentOut])
def get_application_consents(
    app_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieve audit history of data-sharing consents for this application."""
    app = ApplicationService.get_application_by_id(db=db, app_id=app_id, user=current_user)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    return ConsentService.get_consents_for_application(db=db, application_id=app_id)

@router.delete("/{app_id}/consent")
def revoke_application_consent(
    app_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Revoke consent for inter-departmental data exchange."""
    app = ApplicationService.get_application_by_id(db=db, app_id=app_id, user=current_user)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    revoked = ConsentService.revoke_consent(db=db, application_id=app_id, user_id=current_user.id)
    if not revoked:
        raise HTTPException(status_code=400, detail="No active consent found to revoke.")

    return {"success": True, "message": "Consent has been successfully revoked.", "revoked_at": revoked.revoked_at}
