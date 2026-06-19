from typing import Any, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from storage.db import db

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "Medium"
    issue_category: str = "Feature"
    sentiment_source: str = ""
    project_id: str = ""
    suggested_files: List[str] = []
    status: str = "To Do"
    ai_recommendation: str = ""

class TaskUpdateStatus(BaseModel):
    status: str

@router.get("/")
def list_tasks() -> dict[str, Any]:
    tasks = db.list_tasks()
    return {"status": "ok", "tasks": tasks}

@router.post("/")
def create_task(req: TaskCreate) -> dict[str, Any]:
    task = db.create_task(
        title=req.title,
        description=req.description,
        priority=req.priority,
        issue_category=req.issue_category,
        sentiment_source=req.sentiment_source,
        project_id=req.project_id,
        suggested_files=req.suggested_files,
        status=req.status,
        ai_recommendation=req.ai_recommendation
    )
    return {"status": "ok", "task": task}

@router.patch("/{task_id}/status")
def update_task_status(task_id: str, req: TaskUpdateStatus) -> dict[str, Any]:
    task = db.update_task_status(task_id, req.status)
    return {"status": "ok", "task": task}

@router.delete("/{task_id}")
def delete_task(task_id: str) -> dict[str, Any]:
    db.delete_task(task_id)
    return {"status": "ok"}
