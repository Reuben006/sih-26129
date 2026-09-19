from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.audit import AuditLog

class AuditService:
    @staticmethod
    def log(
        db: Session,
        action: str,
        entity: str,
        user_id: Optional[int] = None,
        application_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = "127.0.0.1"
    ) -> AuditLog:
        """Create an immutable audit log record."""
        # Sanitize sensitive fields if any
        sanitized_details = None
        if details:
            sanitized_details = {}
            for k, v in details.items():
                if "password" in k.lower() or "secret" in k.lower() or "token" in k.lower():
                    sanitized_details[k] = "[REDACTED]"
                else:
                    sanitized_details[k] = v

        audit = AuditLog(
            user_id=user_id,
            application_id=application_id,
            action=action,
            entity=entity,
            details=sanitized_details,
            ip_address=ip_address,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

    @staticmethod
    def get_logs_by_application(db: Session, application_id: int):
        return db.query(AuditLog).filter(AuditLog.application_id == application_id).order_by(AuditLog.timestamp.desc()).all()

    @staticmethod
    def get_all_logs(db: Session, limit: int = 100):
        return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
