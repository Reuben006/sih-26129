from typing import Dict, Any
import httpx
from app.connectors.base import DepartmentConnector, ConnectorException
from app.core.config import settings
from app.api.mock_departments import shops_submit, shops_get_status

class ShopsConnector(DepartmentConnector):
    department_code = "SHOPS"
    department_name = "Shops & Establishments Department"

    def transform_request(self, canonical_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "business_name": canonical_data.get("business_name", "").strip(),
            "owner_name": canonical_data.get("owner_name", "").strip(),
            "mobile": canonical_data.get("mobile", "").strip(),
            "address": canonical_data.get("address", "").strip(),
            "employees": canonical_data.get("employees", 10)
        }

    async def submit_application(self, transformed_data: Dict[str, Any], application_number: str) -> Dict[str, Any]:
        try:
            return await shops_submit(transformed_data)
        except Exception as e:
            raise ConnectorException(
                message=f"Shops connector failure: {str(e)}",
                error_code="SHOPS_CONNECTOR_EXCEPTION",
                status_code=500
            )

    async def get_status(self, external_id: str) -> Dict[str, Any]:
        return await shops_get_status(external_id)

    def transform_response(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "external_reference": raw_response.get("external_id"),
            "status": raw_response.get("status", "PENDING"),
            "department": self.department_name,
            "raw": raw_response
        }