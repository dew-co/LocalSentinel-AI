from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.adaptive_memory_service import adaptive_memory_service
from services.intelligence_engine_service import DEFAULT_CONSENT_SETTINGS, intelligence_engine_service
from services.intelligence_source_service import SOURCE_CATEGORIES, intelligence_source_service
from services.knowledge_cache_service import knowledge_cache_service
from storage.db import db

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])


class OnboardingComplete(BaseModel):
    permissions: dict[str, Any] = Field(default_factory=dict)


class PermissionPatch(BaseModel):
    online_intelligence_enabled: bool | None = None
    first_run_completed: bool | None = None
    system_scan_allowed: bool | None = None
    project_scan_allowed: bool | None = None
    adaptive_memory_enabled: bool | None = None
    scheduled_refresh_enabled: bool | None = None
    refresh_frequency: str | None = None
    allowed_sources: list[str] | None = None
    offline_cache_enabled: bool | None = None


class RefreshRequest(BaseModel):
    project_id: str | None = None
    triggered_by: str = "user"


class IntelligenceItemCreate(BaseModel):
    title: str
    summary: str = ""
    content: str = ""
    category: str = "official_documentation"
    memory_domain: str = "Research Brain"
    source_type: str = "manual_research"
    source_url: str = "local://manual"
    source_name: str = "Manual entry"
    confidence_level: str = "user_saved"
    freshness_date: str | None = None
    expires_at: str | None = None
    tags: list[str] = Field(default_factory=list)
    related_project_id: str | None = None


class AdaptiveSignalCreate(BaseModel):
    project_id: str | None = None
    activity_type: str
    signal_key: str
    signal_value: str
    weight: float = 1
    metadata: dict[str, Any] = Field(default_factory=dict)


@router.get("/status")
async def status() -> dict[str, Any]:
    online = await intelligence_engine_service.check_online_status()
    return intelligence_engine_service.status_payload(online)


@router.get("/online-status")
async def online_status() -> dict[str, Any]:
    return await intelligence_engine_service.check_online_status()


@router.get("/onboarding/status")
def onboarding_status() -> dict[str, Any]:
    return intelligence_engine_service.onboarding_status()


@router.post("/onboarding/complete")
async def onboarding_complete(payload: OnboardingComplete) -> dict[str, Any]:
    permissions = {**DEFAULT_CONSENT_SETTINGS, **payload.permissions}
    return await intelligence_engine_service.run_first_time_bootstrap(permissions)


@router.post("/onboarding/skip")
def onboarding_skip() -> dict[str, Any]:
    return intelligence_engine_service.skip_onboarding()


@router.get("/permissions")
def get_permissions() -> dict[str, Any]:
    return {
        "permissions": intelligence_engine_service.permissions(),
        "source_categories": SOURCE_CATEGORIES,
        "memory_domains": [
            "Project Brain",
            "User Work Brain",
            "System Brain",
            "Research Brain",
            "Interaction Brain",
            "Model Brain",
            "Package Brain",
            "Framework Brain",
            "Error Solution Brain",
        ],
    }


@router.patch("/permissions")
def patch_permissions(payload: PermissionPatch) -> dict[str, Any]:
    values = payload.model_dump(exclude_none=True)
    return {"permissions": intelligence_engine_service.update_permissions(values)}


@router.get("/sources")
def get_sources() -> dict[str, Any]:
    return {"sources": intelligence_source_service.list_sources(), "categories": SOURCE_CATEGORIES}


@router.post("/refresh")
async def refresh(payload: RefreshRequest) -> dict[str, Any]:
    return await intelligence_engine_service.run_manual_intelligence_update(triggered_by=payload.triggered_by, project_id=payload.project_id)


@router.get("/refresh/history")
def refresh_history(limit: int = Query(default=50, ge=1, le=100)) -> dict[str, Any]:
    return {"history": db.list_intelligence_refresh_runs(limit)}


@router.get("/items")
def list_items(
    query: str | None = None,
    category: str | None = None,
    source_type: str | None = None,
    memory_domain: str | None = None,
    freshness: str | None = None,
    project_id: str | None = None,
    limit: int = Query(default=50, ge=1, le=250),
) -> dict[str, Any]:
    return {
        "items": knowledge_cache_service.list_items(query, category, source_type, memory_domain, freshness, project_id, limit),
        "stats": knowledge_cache_service.stats(),
    }


@router.post("/items")
def create_item(payload: IntelligenceItemCreate) -> dict[str, Any]:
    try:
        item = intelligence_engine_service.save_manual_intelligence_item(payload.model_dump(exclude_none=True))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"item": item}


@router.get("/items/{item_id}")
def get_item(item_id: str) -> dict[str, Any]:
    item = knowledge_cache_service.get_item(item_id, mark_used=True)
    if not item:
        raise HTTPException(status_code=404, detail="Intelligence item not found")
    return {"item": item}


@router.get("/search")
def search_items(query: str, project_id: str | None = None, limit: int = Query(default=12, ge=1, le=50)) -> dict[str, Any]:
    return {"items": knowledge_cache_service.search(query, project_id=project_id, limit=limit)}


@router.delete("/items/{item_id}")
def delete_item(item_id: str) -> dict[str, Any]:
    knowledge_cache_service.delete_item(item_id)
    return {"status": "ok"}


@router.delete("/cache/clear")
def clear_cache() -> dict[str, Any]:
    removed = knowledge_cache_service.clear_cache()
    return {"status": "ok", "removed": removed}


@router.get("/adaptive/preferences")
def adaptive_preferences() -> dict[str, Any]:
    return {"preferences": adaptive_memory_service.preferences(), "enabled": adaptive_memory_service.enabled()}


@router.post("/adaptive/signal")
def adaptive_signal(payload: AdaptiveSignalCreate) -> dict[str, Any]:
    return adaptive_memory_service.record_signal(
        project_id=payload.project_id,
        activity_type=payload.activity_type,
        signal_key=payload.signal_key,
        signal_value=payload.signal_value,
        weight=payload.weight,
        metadata=payload.metadata,
    )


@router.delete("/adaptive/preferences/{preference_id}")
def delete_preference(preference_id: str) -> dict[str, Any]:
    adaptive_memory_service.delete_preference(preference_id)
    return {"status": "ok"}
