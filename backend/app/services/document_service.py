from sqlalchemy.orm import Session
from datetime import datetime

from app.models.document import Document


class DocumentService:

    @staticmethod
    def create_document(
        db: Session,
        user_id: int,
        document_type: str,
        file_name: str,
        file_path: str
    ):
        doc = Document(
            user_id=user_id,
            document_type=document_type,
            file_name=file_name,
            file_path=file_path
        )

        db.add(doc)
        db.commit()
        db.refresh(doc)

        return doc

    @staticmethod
    def get_user_documents(
        db: Session,
        user_id: int
    ):
        return (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .all()
        )

    @staticmethod
    def verify_document(
            db: Session,
            document_id: int,
            status: str,
            remarks: str = None,
            verified_by: int = None
        ):
        doc = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if not doc:
            return None

        doc.verification_status = status
        doc.verification_remarks = remarks
        doc.verified_by = verified_by
        doc.verified_at = datetime.utcnow()

        db.commit()
        db.refresh(doc)

        return doc