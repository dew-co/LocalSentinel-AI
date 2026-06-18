from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel
from services.activity_service import activity_service

router = APIRouter(prefix="/api/activity", tags=["activity"])

class ActivityCreate(BaseModel):
    project_id: str | None = None
    activity_type: str
    title: str
    description: str = ""
    severity: str = "info"
    metadata_json: dict[str, Any] | None = None

@router.get("")
def get_all_activity() -> dict[str, Any]:
    return {"status": "ok", "logs": activity_service.get_logs()}

@router.get("/{project_id}")
def get_project_activity(project_id: str) -> dict[str, Any]:
    return {"status": "ok", "logs": activity_service.get_logs(project_id=project_id)}

@router.post("")
def add_activity(payload: ActivityCreate) -> dict[str, Any]:
    log = activity_service.log(
        project_id=payload.project_id,
        activity_type=payload.activity_type,
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        metadata=payload.metadata_json
    )
    return {"status": "ok", "log": log}

@router.delete("/clear")
def clear_activity() -> dict[str, Any]:
    activity_service.clear()
    return {"status": "ok", "message": "Cleared all logs"}
