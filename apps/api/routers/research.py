from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel
from services.research_service import research_service

router = APIRouter(prefix="/api/research", tags=["research"])

class ResearchQuery(BaseModel):
    query: str
    project_id: str | None = None
    mode: str = "offline"

class ResearchSave(BaseModel):
    project_id: str | None = None
    topic: str
    summary: str
    sources: list[str] = []
    recommendation: str = ""
    assumptions: str = ""

@router.post("/query")
def research_query(payload: ResearchQuery) -> dict[str, Any]:
    # Placeholder for actual LLM-based research. For now, offline placeholder response.
    return {
        "status": "ok",
        "result": {
            "topic": payload.query,
            "summary": "Online research is not configured yet. This is an offline placeholder response based on LocalSentinel knowledge.",
            "sources": [],
            "recommendation": "Use manual research notes or local project memory.",
            "assumptions": "User is offline."
        }
    }

@router.post("/save")
def save_research(payload: ResearchSave) -> dict[str, Any]:
    note = research_service.save_note(
        project_id=payload.project_id,
        topic=payload.topic,
        summary=payload.summary,
        sources=payload.sources,
        recommendation=payload.recommendation,
        assumptions=payload.assumptions
    )
    return {"status": "ok", "note": note}

@router.get("/history")
def get_history() -> dict[str, Any]:
    return {"status": "ok", "history": research_service.get_history()}

@router.get("/{research_id}")
def get_research(research_id: str) -> dict[str, Any]:
    # Placeholder
    return {"status": "ok", "note": {}}

@router.delete("/{research_id}")
def delete_research(research_id: str) -> dict[str, Any]:
    research_service.delete_note(research_id)
    return {"status": "ok"}
