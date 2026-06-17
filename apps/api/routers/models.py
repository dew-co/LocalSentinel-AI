from __future__ import annotations

from fastapi import APIRouter

from schemas.model_schema import ModelPullRequest, ModelSelectRequest, ModelTestRequest
from services.model_manager import model_manager

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/status")
async def model_status():
    return await model_manager.status()


@router.get("/available")
async def available_models():
    return await model_manager.available()


@router.post("/select")
async def select_model(payload: ModelSelectRequest):
    return await model_manager.select(payload.model)


@router.post("/pull")
async def pull_model(payload: ModelPullRequest):
    return await model_manager.pull(payload.model, payload.approved)


@router.post("/test")
async def test_model(payload: ModelTestRequest):
    return await model_manager.test(payload.model, payload.prompt)

