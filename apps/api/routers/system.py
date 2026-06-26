from typing import Any
from fastapi import APIRouter, HTTPException
from services.system_intelligence_service import system_intelligence_service

router = APIRouter(prefix="/api/system", tags=["system"])

@router.get("/status")
def get_status() -> dict[str, Any]:
    return {"status": "ok", "tools": system_intelligence_service.get_status()}

@router.post("/scan")
def scan_system() -> dict[str, Any]:
    from services.intelligence_engine_service import intelligence_engine_service

    if not intelligence_engine_service.permissions().get("system_scan_allowed"):
        raise HTTPException(status_code=403, detail="System scan permission is required before scanning developer tools.")

    results = system_intelligence_service.scan_tools()
    from services.activity_service import activity_service

    activity_service.log(
        None,
        "system_scan_completed",
        "System scan completed",
        "Local developer tools were scanned with read-only commands.",
        "success",
        {"tools": [item["tool_name"] for item in results]},
    )
    intelligence_engine_service.save_system_scan_item(results)
    return {"status": "ok", "tools": results}

@router.get("/tools")
def get_tools() -> dict[str, Any]:
    return {"status": "ok", "tools": system_intelligence_service.get_status()}

@router.get("/readiness")
def get_readiness() -> dict[str, Any]:
    return {"status": "ok", "readiness": system_intelligence_service.get_readiness_score()}
