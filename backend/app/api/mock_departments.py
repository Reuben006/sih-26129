import random
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/mock", tags=["Mock Department External APIs"])

# Stateful in-memory stores simulating external legacy/modern databases
MUNICIPALITY_DB: Dict[str, Dict[str, Any]] = {}
FSSAI_DB: Dict[str, Dict[str, Any]] = {}
FIRE_DB: Dict[str, Dict[str, Any]] = {}
GST_DB: Dict[str, Dict[str, Any]] = {}
SHOPS_DB: Dict[str, Dict[str, Any]] = {}

# Simulation toggles to demonstrate system resilience and error handling
SIMULATION_FLAGS = {
    "municipality_fail": False,
    "fssai_fail": False,
    "fire_fail": False,
    "gst_fail": False,
    "shops_fail": False
}

class ExternalActionPayload(BaseModel):
    action: str # "APPROVE" or "REJECT"
    officer_remarks: Optional[str] = "Standard compliance inspection completed"

class FailureTogglePayload(BaseModel):
    department: str # "municipality", "fssai", "fire"
    simulate_fail: bool

# --- MOCK MUNICIPALITY SYSTEM ---

@router.post("/municipality/applications", status_code=status.HTTP_201_CREATED)
async def municipality_submit(payload: Dict[str, Any]):
    """Simulates Municipal Corporation Trade License & Health Clearance Gateway."""
    if SIMULATION_FLAGS["municipality_fail"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error_code": "MUNI_GATEWAY_DOWN", "message": "Municipal Corporation e-Governance server gateway is currently unreachable."}
        )
    
    # Validate required municipality fields
    required = ["enterpriseName", "proprietor", "businessAddress"]
    for field in required:
        if field not in payload or not payload[field]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"error_code": "MUNI_SCHEMA_INVALID", "message": f"Field '{field}' is mandatory for Municipal Trade License."}
            )

    external_id = f"MUNI-{random.randint(10000, 99999)}"
    record = {
        "external_id": external_id,
        "payload": payload,
        "status": "RECEIVED",
        "system": "Municipal Corporation Trade License Portal (Legacy SOAP/REST Gateway)",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "officer_notes": "Queued for Ward Inspector Trade verification"
    }
    MUNICIPALITY_DB[external_id] = record
    return {
        "success": True,
        "external_id": external_id,
        "status": "RECEIVED",
        "acknowledgement_token": f"ACK-{external_id}",
        "department_code": "MUNICIPALITY",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/municipality/applications/{external_id}")
async def municipality_get_status(external_id: str):
    if SIMULATION_FLAGS["municipality_fail"]:
        raise HTTPException(status_code=503, detail="Municipal Corporation Gateway Down")
    if external_id not in MUNICIPALITY_DB:
        raise HTTPException(status_code=404, detail="Application not found in Municipal registry")
    return MUNICIPALITY_DB[external_id]

@router.post("/municipality/applications/{external_id}/action")
async def municipality_action(external_id: str, action_data: ExternalActionPayload):
    if external_id not in MUNICIPALITY_DB:
        raise HTTPException(status_code=404, detail="Application not found in Municipal registry")
    
    new_status = "APPROVED" if action_data.action.upper() == "APPROVE" else "REJECTED"
    MUNICIPALITY_DB[external_id]["status"] = new_status
    MUNICIPALITY_DB[external_id]["officer_notes"] = action_data.officer_remarks
    MUNICIPALITY_DB[external_id]["decided_at"] = datetime.now(timezone.utc).isoformat()
    return {
        "external_id": external_id,
        "status": new_status,
        "message": f"Municipal Trade License status updated to {new_status}"
    }

# --- MOCK FSSAI SYSTEM ---

@router.post("/fssai/licenses", status_code=status.HTTP_201_CREATED)
async def fssai_submit(payload: Dict[str, Any]):
    """Simulates FSSAI FoSCoS (Food Safety Compliance System) Central Registry."""
    if SIMULATION_FLAGS["fssai_fail"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error_code": "FSSAI_GATEWAY_DOWN", "message": "FSSAI FoSCoS national server is experiencing gateway timeout."}
        )
    
    required = ["firm_name", "applicant", "premise_address"]
    for field in required:
        if field not in payload or not payload[field]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"error_code": "FSSAI_SCHEMA_INVALID", "message": f"Field '{field}' required for FoSCoS License classification."}
            )

    external_id = f"FSSAI-{random.randint(10000, 99999)}"
    record = {
        "external_id": external_id,
        "payload": payload,
        "status": "APPLICATION_ACCEPTED",
        "system": "Food Safety and Standards Authority of India (FoSCoS v2.4 API)",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "officer_notes": "Desk assessment assigned to Designated Food Safety Officer (DO)"
    }
    FSSAI_DB[external_id] = record
    return {
        "success": True,
        "external_id": external_id,
        "status": "APPLICATION_ACCEPTED",
        "foscos_reference": f"FOSCOS-{external_id}",
        "department_code": "FSSAI",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/fssai/licenses/{external_id}")
async def fssai_get_status(external_id: str):
    if SIMULATION_FLAGS["fssai_fail"]:
        raise HTTPException(status_code=503, detail="FSSAI Server Down")
    if external_id not in FSSAI_DB:
        raise HTTPException(status_code=404, detail="FSSAI License record not found")
    return FSSAI_DB[external_id]

@router.post("/fssai/licenses/{external_id}/action")
async def fssai_action(external_id: str, action_data: ExternalActionPayload):
    if external_id not in FSSAI_DB:
        raise HTTPException(status_code=404, detail="FSSAI License record not found")
    
    new_status = "APPROVED" if action_data.action.upper() == "APPROVE" else "REJECTED"
    FSSAI_DB[external_id]["status"] = new_status
    FSSAI_DB[external_id]["officer_notes"] = action_data.officer_remarks
    FSSAI_DB[external_id]["decided_at"] = datetime.now(timezone.utc).isoformat()
    return {
        "external_id": external_id,
        "status": new_status,
        "message": f"FSSAI Food Safety License status updated to {new_status}"
    }

# --- MOCK FIRE DEPARTMENT SYSTEM ---

@router.post("/fire/noc-requests", status_code=status.HTTP_201_CREATED)
async def fire_submit(payload: Dict[str, Any]):
    """Simulates Fire and Emergency Services Department Fire Safety NOC Portal."""
    if SIMULATION_FLAGS["fire_fail"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error_code": "FIRE_DEPT_DOWN", "message": "Fire Emergency Command & Safety API is currently under maintenance."}
        )
    
    required = ["establishment", "owner", "location"]
    for field in required:
        if field not in payload or not payload[field]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"error_code": "FIRE_SCHEMA_INVALID", "message": f"Field '{field}' required for Fire NOC Inspection filing."}
            )

    external_id = f"FIRE-{random.randint(10000, 99999)}"
    record = {
        "external_id": external_id,
        "payload": payload,
        "status": "INSPECTION_PENDING",
        "system": "Directorate of Fire & Emergency Services NOC Portal",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "officer_notes": "Site inspection scheduled by Divisional Fire Officer"
    }
    FIRE_DB[external_id] = record
    return {
        "success": True,
        "external_id": external_id,
        "status": "INSPECTION_PENDING",
        "fire_circle": "Central Division Zone-IV",
        "department_code": "FIRE",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/fire/noc-requests/{external_id}")
async def fire_get_status(external_id: str):
    if SIMULATION_FLAGS["fire_fail"]:
        raise HTTPException(status_code=503, detail="Fire Department Gateway Down")
    if external_id not in FIRE_DB:
        raise HTTPException(status_code=404, detail="Fire NOC request not found")
    return FIRE_DB[external_id]

@router.post("/fire/noc-requests/{external_id}/action")
async def fire_action(external_id: str, action_data: ExternalActionPayload):
    if external_id not in FIRE_DB:
        raise HTTPException(status_code=404, detail="Fire NOC request not found")
    
    new_status = "APPROVED" if action_data.action.upper() == "APPROVE" else "REJECTED"
    FIRE_DB[external_id]["status"] = new_status
    FIRE_DB[external_id]["officer_notes"] = action_data.officer_remarks
    FIRE_DB[external_id]["decided_at"] = datetime.now(timezone.utc).isoformat()
    return {
        "external_id": external_id,
        "status": new_status,
        "message": f"Fire Safety NOC status updated to {new_status}"
    }
# --- MOCK GST SYSTEM ---

@router.post("/gst/registrations", status_code=status.HTTP_201_CREATED)
async def gst_submit(payload: Dict[str, Any]):
    if SIMULATION_FLAGS["gst_fail"]:
        raise HTTPException(
            status_code=503,
            detail="GSTN Gateway Down"
        )

    external_id = f"GST-{random.randint(10000,99999)}"

    GST_DB[external_id] = {
        "external_id": external_id,
        "payload": payload,
        "status": "GST_PENDING",
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }

    return {
        "success": True,
        "external_id": external_id,
        "department_code": "GST"
    }


@router.get("/gst/registrations/{external_id}")
async def gst_get_status(external_id: str):
    return GST_DB[external_id]


@router.post("/gst/registrations/{external_id}/action")
async def gst_action(
    external_id: str,
    action_data: ExternalActionPayload
):
    GST_DB[external_id]["status"] = (
        "APPROVED"
        if action_data.action.upper() == "APPROVE"
        else "REJECTED"
    )

    return GST_DB[external_id]

# --- MOCK SHOPS & ESTABLISHMENTS SYSTEM ---

@router.post("/shops/registrations", status_code=status.HTTP_201_CREATED)
async def shops_submit(payload: Dict[str, Any]):
    if SIMULATION_FLAGS["shops_fail"]:
        raise HTTPException(
            status_code=503,
            detail="Shops Gateway Down"
        )

    external_id = f"SHOPS-{random.randint(10000,99999)}"

    SHOPS_DB[external_id] = {
        "external_id": external_id,
        "payload": payload,
        "status": "SHOPS_PENDING",
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }

    return {
        "success": True,
        "external_id": external_id,
        "department_code": "SHOPS"
    }


@router.get("/shops/registrations/{external_id}")
async def shops_get_status(external_id: str):
    return SHOPS_DB[external_id]


@router.post("/shops/registrations/{external_id}/action")
async def shops_action(
    external_id: str,
    action_data: ExternalActionPayload
):
    SHOPS_DB[external_id]["status"] = (
        "APPROVED"
        if action_data.action.upper() == "APPROVE"
        else "REJECTED"
    )

    return SHOPS_DB[external_id]

# --- RESILIENCE & FAILURE SIMULATION TOGGLES (FOR JUDGES DEMO) ---

@router.post("/simulate-failure")
async def toggle_failure(payload: FailureTogglePayload):
    dep = payload.department.lower()
    flag_key = f"{dep}_fail"
    if flag_key in SIMULATION_FLAGS:
        SIMULATION_FLAGS[flag_key] = payload.simulate_fail
        return {
            "department": dep,
            "simulated_failure_active": payload.simulate_fail,
            "message": f"Simulated failure for {dep.upper()} is now {'ENABLED (Down)' if payload.simulate_fail else 'DISABLED (Healthy)'}"
        }
    raise HTTPException(status_code=400, detail="Invalid department name. Use: municipality, fssai, fire , gst, shops")

@router.get("/simulate-failure/status")
async def get_failure_statuses():
    return {
        "simulation_flags": SIMULATION_FLAGS,
        "municipality_records": len(MUNICIPALITY_DB),
        "fssai_records": len(FSSAI_DB),
        "fire_records": len(FIRE_DB),
        "gst_records": len(GST_DB),
        "shops_records": len(SHOPS_DB)
    }
