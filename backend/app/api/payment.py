from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.application import Application
from app.schemas.payment import PaymentOut
from app.services.payment_service import PaymentService
from app.api.deps import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/applications/{app_id}", response_model=PaymentOut)
def get_payment(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    if current_user.role == UserRole.CITIZEN and application.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own application payment.")

    if current_user.role == UserRole.OFFICIAL:
        if not application.department_statuses or not any(
            d.department_id == current_user.department_id for d in application.department_statuses
        ):
            raise HTTPException(status_code=403, detail="This application is outside your department.")

    payment = PaymentService.get_or_create(db, application)
    return payment


@router.post("/applications/{app_id}/pay", response_model=PaymentOut)
def make_payment(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.CITIZEN:
        raise HTTPException(status_code=403, detail="Only the citizen applicant can make the payment.")

    application = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    success, message, payment = PaymentService.pay(db, application, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail=message)

    return payment
