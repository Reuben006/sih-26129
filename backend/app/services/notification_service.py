from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.notification import Notification

class NotificationService:
    @staticmethod
    def send(
        db: Session,
        user_id: int,
        title: str,
        message: str,
        application_id: Optional[int] = None,
        msg_type: str = "INFO"
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            application_id=application_id,
            title=title,
            message=message,
            type=msg_type,
            is_read=False,
            created_at=datetime.now(timezone.utc)
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_user_notifications(db: Session, user_id: int, limit: int = 50) -> List[Notification]:
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(limit).all()

    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> bool:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if notification:
            notification.is_read = True
            db.commit()
            return True
        return False
