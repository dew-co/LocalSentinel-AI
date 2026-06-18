from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.memory_service import memory_service

router = APIRouter(prefix="/api/memory", tags=["memory"])

class MemoryQuery(BaseModel):
    query: str

class MemoryCreate(BaseModel):
    content: str
    tags: list[str] | None = None
    memory_type: str = "project"
    title: str = ""
    source: str | None = None
    importance: int = 1

@router.get("/project/{project_id}")
def get_project_memory(project_id: str) -> dict[str, Any]:
    items = memory_service.list_memory_items(project_id=project_id)
    return {"status": "ok", "memory": items}

@router.post("/project/{project_id}")
def add_project_memory(project_id: str, payload: MemoryCreate) -> dict[str, Any]:
    item = memory_service.add_memory_item(
        project_id=project_id,
        memory_type=payload.memory_type,
        title=payload.title,
        content=payload.content,
        source=payload.source,
        tags=payload.tags,
        importance=payload.importance
    )
    return {"status": "ok", "memory": item}

@router.get("/search")
def search_memory(query: str) -> dict[str, Any]:
    # Placeholder for actual keyword search
    items = memory_service.list_memory_items()
    filtered = [item for item in items if query.lower() in item['content'].lower() or query.lower() in item['title'].lower()]
    return {"status": "ok", "results": filtered}

@router.delete("/{memory_id}")
def delete_memory(memory_id: str) -> dict[str, Any]:
    # Placeholder
    return {"status": "ok", "deleted": True}
