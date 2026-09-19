from typing import Dict, Any
import httpx
from app.connectors.base import DepartmentConnector, ConnectorException
from app.core.config import settings
from app.api.mock_departments import fire_submit, fire_get_status

class FireConnector(DepartmentConnector):
    department_code = "FIRE"
    department_name = "Fire and Emergency Services Department"

    def transform_request(self, canonical_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transforms common citizen canonical schema into Fire Safety NOC schema.
        Canonical: business_name, owner_name, address, pan, mobile, building_area_sqft, seating_capacity
        Fire: establishment, owner, location, owner_phone, total_area_sqft, occupancy_type, fire_safety_equipment_installed
        """
        return {
            "establishment": canonical_data.get("business_name", "").strip(),
            "owner": canonical_data.get("owner_name", "").strip(),
            "location": canonical_data.get("address", "").strip(),
            "owner_phone": canonical_data.get("mobile", "").strip(),
            "total_area_sqft": canonical_data.get("building_area_sqft", 1200),
            "occupancy_type": "ASSEMBLY_COMMERCIAL_DINING",
            "fire_safety_equipment_installed": True,
            "fire_zone_classification": "URBAN_HIGH_DENSITY"
        }

    async def submit_application(self, transformed_data: Dict[str, Any], application_number: str) -> Dict[str, Any]:
        url = f"{settings.BASE_URL}{settings.API_V1_STR}/mock/fire/noc-requests"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(url, json=transformed_data)
                if response.status_code == 201:
                    return response.json()
                error_detail = response.json() if response.headers.get("content-type") == "application/json" else response.text
                raise ConnectorException(
                    message=f"Fire Services gateway error: {error_detail}",
                    error_code="FIRE_HTTP_ERROR",
                    status_code=response.status_code
                )
        except (httpx.RequestError, httpx.ConnectError):
            try:
                result = await fire_submit(transformed_data)
                return result
            except Exception as e:
                raise ConnectorException(
                    message=f"Fire Department safety portal unreachable: {str(e)}",
                    error_code="FIRE_UNAVAILABLE",
                    status_code=503
                )
        except Exception as e:
            if isinstance(e, ConnectorException):
                raise e
            raise ConnectorException(
                message=f"Fire connector failure: {str(e)}",
                error_code="FIRE_CONNECTOR_EXCEPTION",
                status_code=500
            )

    async def get_status(self, external_id: str) -> Dict[str, Any]:
        url = f"{settings.BASE_URL}{settings.API_V1_STR}/mock/fire/noc-requests/{external_id}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.json()
                raise ConnectorException(
                    message=f"Fire NOC status check failed for ID {external_id}",
                    status_code=response.status_code
                )
        except (httpx.RequestError, httpx.ConnectError):
            try:
                return await fire_get_status(external_id)
            except Exception as e:
                raise ConnectorException(message=str(e), status_code=503)

    def transform_response(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "external_reference": raw_response.get("external_id"),
            "status": raw_response.get("status", "INSPECTION_PENDING"),
            "department": self.department_name,
            "raw": raw_response
        }
