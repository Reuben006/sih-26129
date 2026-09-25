from fastapi import APIRouter

router = APIRouter(
    prefix="/documents",
    tags=["Document Verification"]
)

@router.patch("/{doc_id}/verify")
def verify_document(doc_id: int):
    return {
        "success": True,
        "document_id": doc_id,
        "status": "VERIFIED"
    }