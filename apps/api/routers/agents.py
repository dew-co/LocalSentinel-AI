from typing import Any
from fastapi import APIRouter
from services.agent_map_service import agent_map_service

router = APIRouter(prefix="/api/agents", tags=["agents"])

@router.get("/map")
def get_agent_map() -> dict[str, Any]:
    return {"status": "ok", "agents": agent_map_service.get_map()}

@router.get("/status")
def get_agent_status() -> dict[str, Any]:
    agents = agent_map_service.get_map()
    active = sum(1 for a in agents if a["status"] == "active")
    return {
        "status": "ok",
        "total_agents": len(agents),
        "active_agents": active
    }
