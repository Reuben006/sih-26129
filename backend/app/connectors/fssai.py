from typing import Dict, Any
import httpx
from app.connectors.base import DepartmentConnector, ConnectorException
from app.core.config import settings
from app.api.mock_departments import fssai_submit, fssai_get_status

class FSSAIConnector(DepartmentConnector):
    department_code = "FSSAI"
    department_name = "Food Safety and Standards Authority of India"

    def transform_request(self, canonical_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transforms common citizen canonical schema into FSSAI FoSCoS schema.
        Canonical: business_name, owner_name, address, pan, mobile, food_category, seating_capacity
        FSSAI: firm_name, applicant, premise_address, pan_number, applicant_contact, food_category, seating_capacity, foscos_license_class
        """
        return {
            "firm_name": canonical_data.get("business_name", "").strip(),
            "applicant": canonical_data.get("owner_name", "").strip(),
            "premise_address": canonical_data.get("address", "").strip(),
            "pan_number": canonical_data.get("pan", "").strip().upper(),
            "applicant_contact": canonical_data.get("mobile", "").strip(),
            "food_category": canonical_data.get("food_category", "Food Service & Prepared Meals"),
            "seating_capacity": canonical_data.get("seating_capacity", 50),
            "foscos_license_class": "STATE_FOOD_SAFETY_LICENSE",
            "regulatory_framework": "FSS Act 2006 Regulations"
        }

    async def submit_application(self, transformed_data: Dict[str, Any], application_number: str) -> Dict[str, Any]:
        url = f"{settings.BASE_URL}{settings.API_V1_STR}/mock/fssai/licenses"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(url, json=transformed_data)
                if response.status_code == 201:
                    return response.json()
                error_detail = response.json() if response.headers.get("content-type") == "application/json" else response.text
                raise ConnectorException(
                    message=f"FSSAI FoSCoS gateway error: {error_detail}",
                    error_code="FSSAI_HTTP_ERROR",
                    status_code=response.status_code
                )
        except (httpx.RequestError, httpx.ConnectError):
            try:
                result = await fssai_submit(transformed_data)
                return result
            except Exception as e:
                raise ConnectorException(
                    message=f"FSSAI FoSCoS national server unreachable: {str(e)}",
                    error_code="FSSAI_UNAVAILABLE",
                    status_code=503
                )
        except Exception as e:
            if isinstance(e, ConnectorException):
                raise e
            raise ConnectorException(
                message=f"FSSAI connector failure: {str(e)}",
                error_code="FSSAI_CONNECTOR_EXCEPTION",
                status_code=500
            )

    async def get_status(self, external_id: str) -> Dict[str, Any]:
        url = f"{settings.BASE_URL}{settings.API_V1_STR}/mock/fssai/licenses/{external_id}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.json()
                raise ConnectorException(
                    message=f"FSSAI status inquiry failed for ID {external_id}",
                    status_code=response.status_code
                )
        except (httpx.RequestError, httpx.ConnectError):
            try:
                return await fssai_get_status(external_id)
            except Exception as e:
                raise ConnectorException(message=str(e), status_code=503)

    def transform_response(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "external_reference": raw_response.get("external_id"),
            "status": raw_response.get("status", "APPLICATION_ACCEPTED"),
            "department": self.department_name,
            "raw": raw_response
        }
