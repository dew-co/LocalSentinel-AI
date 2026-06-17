from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from schemas.rag_schema import RagIndexRequest, RagMemoryAddRequest, RagQueryRequest
from services.rag_service import rag_service

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/index")
def index_project(payload: RagIndexRequest):
    try:
        return rag_service.index(payload.projectId, payload.path)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/query")
def query_project(payload: RagQueryRequest):
    return {"matches": rag_service.query(payload.query, payload.projectId, payload.topK)}


@router.get("/status")
def rag_status():
    return rag_service.status()


@router.post("/memory/add")
def add_memory(payload: RagMemoryAddRequest):
    return rag_service.add_memory(payload.projectId, payload.content, payload.tags)


@router.get("/memory/list")
def list_memory(projectId: str | None = Query(default=None)):
    return rag_service.list_memory(projectId)

