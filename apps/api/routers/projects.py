from __future__ import annotations

from fastapi import APIRouter, HTTPException

from schemas.project_schema import ProjectCreateRequest, ProjectScanRequest
from services.project_creator import project_creator
from services.project_scanner import project_scanner
from storage.db import db

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/create")
def create_project(payload: ProjectCreateRequest):
    try:
        from services.activity_service import activity_service
        result = project_creator.create(
            idea=payload.idea,
            name=payload.name,
            path=payload.path,
            preferred_stack=payload.preferredStack,
            app_type=payload.appType,
            allow_overwrite=payload.allowOverwrite,
        )
        activity_service.log(None, "project_created", "Project Created", f"Created project {payload.name} at {payload.path}")
        return result
    except (ValueError, FileExistsError, FileNotFoundError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/scan")
def scan_project(payload: ProjectScanRequest):
    try:
        from services.activity_service import activity_service
        result = project_scanner.scan(payload.path)
        # assuming result has a 'project' field
        proj_id = result.get('project', {}).get('id') if isinstance(result, dict) else None
        activity_service.log(proj_id, "project_scanned", "Project Scanned", f"Scanned project at {payload.path}")
        return result
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("")
def list_projects():
    return db.list_projects()


@router.get("/{project_id}")
def get_project(project_id: str):
    project = db.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

