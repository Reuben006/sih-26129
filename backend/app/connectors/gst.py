from typing import Dict, Any
import httpx
from app.connectors.base import DepartmentConnector, ConnectorException
from app.core.config import settings
from app.api.mock_departments import gst_submit, gst_get_status

class GSTConnector(DepartmentConnector):
    department_code = "GST"
    department_name = "GST & Tax Department"

    def transform_request(self, canonical_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "business_name": canonical_data.get("business_name", "").strip(),
            "owner_name": canonical_data.get("owner_name", "").strip(),
            "pan": canonical_data.get("pan", "").strip().upper(),
            "mobile": canonical_data.get("mobile", "").strip(),
            "address": canonical_data.get("address", "").strip()
        }

    async def submit_application(self, transformed_data: Dict[str, Any], application_number: str) -> Dict[str, Any]:
        try:
            return await gst_submit(transformed_data)
        except Exception as e:
            raise ConnectorException(
                message=f"GST connector failure: {str(e)}",
                error_code="GST_CONNECTOR_EXCEPTION",
                status_code=500
            )

    async def get_status(self, external_id: str) -> Dict[str, Any]:
        return await gst_get_status(external_id)

    def transform_response(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "external_reference": raw_response.get("external_id"),
            "status": raw_response.get("status", "PENDING"),
            "department": self.department_name,
            "raw": raw_response
        }