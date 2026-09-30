from pathlib import Path
import shutil
from app.models.document import Document

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException
)
from sqlalchemy.orm import Session
from app.schemas.document_verification import VerificationAction

from app.core.database import get_db
from app.services.document_service import DocumentService
from app.schemas.document import DocumentOut

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path("uploads/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    document_type: str = Form(...),
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_path = UPLOAD_DIR / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = DocumentService.create_document(
        db=db,
        user_id=user_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=str(file_path)
    )

    return doc

@router.post("/digilocker-fetch", response_model=DocumentOut)
def digilocker_fetch(
    document_type: str = Form(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    file_map = {
        "PAN": "http://localhost:8000/uploads/documents/pan.png",
        "GST": "http://localhost:8000/uploads/documents/gst.png",
        "ADDRESS_PROOF": "http://localhost:8000/uploads/documents/aadhar.png",
        "SHOP_LICENSE": "http://localhost:8000/uploads/documents/shop.png"
    }

    file_path = file_map.get(document_type)

    existing_doc = db.query(Document).filter(
        Document.user_id == user_id,
        Document.document_type == document_type
    ).first()

    if existing_doc:
        return existing_doc

    doc = DocumentService.create_document(
        db=db,
        user_id=user_id,
        document_type=document_type,
        file_name=f"{document_type}.png",
        file_path=file_path
    )

    return doc


@router.get("/{user_id}", response_model=list[DocumentOut])
def get_documents(
    user_id: int,
    db: Session = Depends(get_db)
):
    return DocumentService.get_user_documents(
        db=db,
        user_id=user_id
    )

@router.patch("/{document_id}/verify", response_model=DocumentOut)
def verify_document(
    document_id: int,
    payload: VerificationAction,
    db: Session = Depends(get_db)
):
    doc = DocumentService.verify_document(
        db=db,
        document_id=document_id,
        status=payload.status,
        remarks=payload.remarks,
        verified_by=1  # demo officer
    )

    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return doc