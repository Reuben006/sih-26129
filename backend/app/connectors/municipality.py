from typing import Dict, Any
import httpx
from app.connectors.base import DepartmentConnector, ConnectorException
from app.core.config import settings
from app.api.mock_departments import municipality_submit, municipality_get_status

class MunicipalityConnector(DepartmentConnector):
    department_code = "MUNICIPALITY"
    department_name = "Municipal Corporation"

    def transform_request(self, canonical_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transforms common citizen canonical schema into Municipal Trade License format.
        Canonical: business_name, owner_name, address, pan, mobile, building_area_sqft
        Municipality: enterpriseName, proprietor, businessAddress, taxIdentifier, contactNumber, carpetAreaSqFt
        """
        return {
            "enterpriseName": canonical_data.get("business_name", "").strip(),
            "proprietor": canonical_data.get("owner_name", "").strip(),
            "businessAddress": canonical_data.get("address", "").strip(),
            "taxIdentifier": canonical_data.get("pan", "").strip().upper(),
            "contactNumber": canonical_data.get("mobile", "").strip(),
            "carpetAreaSqFt": canonical_data.get("building_area_sqft", 1200),
            "licenseType": "TRADE_HEALTH_ESTABLISHMENT_PERMIT",
            "jurisdiction": "Urban Local Body (Municipal Administration)"
        }

    async def submit_application(self, transformed_data: Dict[str, Any], application_number: str) -> Dict[str, Any]:
        url = f"{settings.BASE_URL}{settings.API_V1_STR}/mock/municipality/applications"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(url, json=transformed_data)
                if response.status_code == 201:
                    return response.json()
                error_detail = response.json() if response.headers.get("content-type") == "application/json" else response.text
                raise ConnectorException(
                    message=f"Municipality Gateway error: {error_detail}",
                    error_code="MUNICIPALITY_HTTP_ERROR",
                    status_code=response.status_code
                )
        except (httpx.RequestError, httpx.ConnectError):
            # Fallback to direct in-process mock handler if external server port is not bound yet
            try:
                result = await municipality_submit(transformed_data)
                return result
            except Exception as e:
                raise ConnectorException(
                    message=f"Municipal Corporation system unreachable: {str(e)}",
                    error_code="MUNICIPALITY_UNAVAILABLE",
                    status_code=503
                )
        except Exception as e:
            if isinstance(e, ConnectorException):
                raise e
            raise ConnectorException(
                message=f"Municipality connector failure: {str(e)}",
                error_code="MUNICIPALITY_CONNECTOR_EXCEPTION",
                status_code=500
            )

    async def get_status(self, external_id: str) -> Dict[str, Any]:
        url = f"{settings.BASE_URL}{settings.API_V1_STR}/mock/municipality/applications/{external_id}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.json()
                raise ConnectorException(
                    message=f"Municipality inquiry failed for ID {external_id}",
                    status_code=response.status_code
                )
        except (httpx.RequestError, httpx.ConnectError):
            try:
                return await municipality_get_status(external_id)
            except Exception as e:
                raise ConnectorException(message=str(e), status_code=503)

    def transform_response(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "external_reference": raw_response.get("external_id"),
            "status": raw_response.get("status", "RECEIVED"),
            "department": self.department_name,
            "raw": raw_response
        }
