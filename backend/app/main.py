from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.document_verification import router as verification_router
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
from app.seed import seed_database

# API Routers
from app.api.auth import router as auth_router
from app.api.applications import router as applications_router
from app.api.departments import router as departments_router
from app.api.workflow import router as workflow_router
from app.api.consent import router as consent_router
from app.api.audit import router as audit_router
from app.api.dashboard import router as dashboard_router
from app.api.notifications import router as notifications_router
from app.api.mock_departments import router as mock_departments_router
from app.api.documents import router as documents_router
from app.api.payment import router as payment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas and seed data
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GovConnect - Interoperability Middleware Layer for federated cross-department government service workflows (SIH 2026 PS129).",
    lifespan=lifespan
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# CORS
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": str(exc),
            "path": str(request.url.path)
        }
    )


# Register API Routes
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(applications_router, prefix=settings.API_V1_STR)
app.include_router(departments_router, prefix=settings.API_V1_STR)
app.include_router(workflow_router, prefix=settings.API_V1_STR)
app.include_router(consent_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(mock_departments_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(verification_router,prefix=settings.API_V1_STR)
app.include_router(payment_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "GovConnect Interoperability Middleware",
        "version": settings.VERSION
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to GovConnect PS129 Interoperability Middleware API",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )