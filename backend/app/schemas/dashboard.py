from pydantic import BaseModel
from typing import List, Dict, Any

class DepartmentMetric(BaseModel):
    department_name: str
    department_code: str
    total_assigned: int
    pending: int
    approved: int
    rejected: int
    error_count: int
    connector_health: str

class DashboardSummaryOut(BaseModel):
    total_applications: int
    in_progress: int
    approved: int
    rejected: int
    failed: int
    avg_processing_time_hours: float
    department_metrics: List[DepartmentMetric]
    active_connectors: int
    recent_events_count: int
