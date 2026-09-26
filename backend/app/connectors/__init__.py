from typing import Dict, Optional
from app.connectors.base import DepartmentConnector, ConnectorException
from app.connectors.municipality import MunicipalityConnector
from app.connectors.fssai import FSSAIConnector
from app.connectors.fire import FireConnector
from app.connectors.gst import GSTConnector
from app.connectors.shops import ShopsConnector

CONNECTOR_REGISTRY: Dict[str, DepartmentConnector] = {
    "MUNICIPALITY": MunicipalityConnector(),
    "FSSAI": FSSAIConnector(),
    "FIRE": FireConnector(),
    "GST": GSTConnector(),
    "SHOPS": ShopsConnector(),
}

def get_connector(department_code: str) -> Optional[DepartmentConnector]:
    """Retrieve connector instance from the connector registry by department code."""
    return CONNECTOR_REGISTRY.get(department_code.upper())

__all__ = [
    "DepartmentConnector",
    "ConnectorException",
    "MunicipalityConnector",
    "FSSAIConnector",
    "FireConnector",
    "GSTConnector",
    "ShopsConnector",
    "CONNECTOR_REGISTRY",
    "get_connector"
]
