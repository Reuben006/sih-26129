from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Citizen & Officer Notifications"])

class NotificationOut(BaseModel):
    id: int
    user_id: int
    application_id: int | None = None
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieve event-driven notifications for the authenticated user."""
    return NotificationService.get_user_notifications(db=db, user_id=current_user.id)

@router.patch("/{notif_id}/read")
def mark_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Acknowledge notification."""
    success = NotificationService.mark_as_read(db=db, notification_id=notif_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {"success": True}
