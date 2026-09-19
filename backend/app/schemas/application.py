from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import re
from app.models.application import OverallStatus, DepartmentStatus
from app.schemas.department import DepartmentOut
from app.schemas.consent import ConsentOut

class CanonicalApplicationPayload(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=200, examples=["ABC Restaurant"])
    owner_name: str = Field(..., min_length=2, max_length=150, examples=["Swayam Dudhela"])
    address: str = Field(..., min_length=5, max_length=300, examples=["Shop 12, High Street, Mumbai"])
    pan: str = Field(..., examples=["ABCDE1234F"])
    mobile: str = Field(..., examples=["9876543210"])
    seating_capacity: Optional[int] = Field(50, description="Seating capacity for restaurant")
    building_area_sqft: Optional[int] = Field(1200, description="Carpet area in sq ft")
    food_category: Optional[str] = Field("Multi-Cuisine Non-Veg & Veg", description="Food type")

    @field_validator("pan")
    def validate_pan(cls, v: str) -> str:
        v = v.strip().upper()
        if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", v):
            raise ValueError("Invalid PAN format. Must be 5 uppercase letters, 4 digits, and 1 letter (e.g. ABCDE1234F)")
        return v

    @field_validator("mobile")
    def validate_mobile(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[6-9]\d{9}$", v):
            raise ValueError("Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9")
        return v

class ApplicationCreate(CanonicalApplicationPayload):
    workflow_code: Optional[str] = "RESTAURANT_APPROVAL"
    grant_consent: bool = True

class ApplicationDepartmentOut(BaseModel):
    id: int
    application_id: int
    department_id: int
    status: DepartmentStatus
    external_reference: Optional[str] = None
    submitted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    request_payload: Optional[Dict[str, Any]] = None
    response_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    department: DepartmentOut

    class Config:
        from_attributes = True

class ApplicationOut(BaseModel):
    id: int
    application_number: str
    business_name: str
    owner_name: str
    address: str
    pan: str
    mobile: str
    current_step_order: int
    overall_status: OverallStatus
    created_at: datetime
    updated_at: datetime
    department_statuses: List[ApplicationDepartmentOut] = []

    class Config:
        from_attributes = True

class ApplicationDetailOut(ApplicationOut):
    canonical_payload: Optional[Dict[str, Any]] = None
    consents: List[ConsentOut] = []

class DepartmentActionRequest(BaseModel):
    status: DepartmentStatus # APPROVED, REJECTED, or IN_REVIEW
    remarks: Optional[str] = "Processed by department verification officer"
    simulate_delay_sec: Optional[int] = 0
