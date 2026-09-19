from abc import ABC, abstractmethod
from typing import Dict, Any

class ConnectorException(Exception):
    def __init__(self, message: str, error_code: str = "CONNECTOR_ERROR", status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code

class DepartmentConnector(ABC):
    department_code: str = ""
    department_name: str = ""

    @abstractmethod
    def transform_request(self, canonical_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform canonical data model into department-specific proprietary schema."""
        pass

    @abstractmethod
    async def submit_application(self, transformed_data: Dict[str, Any], application_number: str) -> Dict[str, Any]:
        """Submit the transformed payload to the external department API / mock endpoint."""
        pass

    @abstractmethod
    async def get_status(self, external_id: str) -> Dict[str, Any]:
        """Query department system for current processing status."""
        pass

    @abstractmethod
    def transform_response(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize department response into canonical format."""
        pass
