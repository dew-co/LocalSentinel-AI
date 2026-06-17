from __future__ import annotations

from fastapi import APIRouter

from schemas.agent_schema import AgentPlanRequest, SafeExecuteRequest, SafePreviewRequest
from services.agent_planner import agent_planner
from services.safe_executor import safe_executor

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/plan")
def plan(payload: AgentPlanRequest):
    return agent_planner.plan(payload.goal, payload.projectId)


@router.post("/preview")
def preview(payload: SafePreviewRequest):
    return safe_executor.preview(payload.projectPath, payload.fileOperations, payload.commands)


@router.post("/execute")
def execute(payload: SafeExecuteRequest):
    return safe_executor.execute(payload.approved, payload.projectPath, payload.fileOperations, payload.commands)

