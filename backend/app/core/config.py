import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "GovConnect Interoperability Middleware Layer"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "govconnect-sih-2026-interoperability-super-secret-key-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./govconnect.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Interop Connectors Base URL (for calling mock systems internally if needed)
    BASE_URL: str = os.getenv(
        "BASE_URL",
        "https://govconnect-backend-ogly.onrender.com"
    )

    # Updated configuration block for Pydantic v2
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"  # <-- This line fixes the "extra_forbidden" crash completely
    )

settings = Settings()
