from typing import Any
from fastapi import APIRouter
from services.system_intelligence_service import system_intelligence_service

router = APIRouter(prefix="/api/system", tags=["system"])

@router.get("/status")
def get_status() -> dict[str, Any]:
    return {"status": "ok", "tools": system_intelligence_service.get_status()}

@router.post("/scan")
def scan_system() -> dict[str, Any]:
    results = system_intelligence_service.scan_tools()
    return {"status": "ok", "tools": results}

@router.get("/tools")
def get_tools() -> dict[str, Any]:
    return {"status": "ok", "tools": system_intelligence_service.get_status()}

@router.get("/readiness")
def get_readiness() -> dict[str, Any]:
    return {"status": "ok", "readiness": system_intelligence_service.get_readiness_score()}
