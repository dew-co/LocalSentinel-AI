from __future__ import annotations

from pydantic import BaseModel, Field


class ModelInfo(BaseModel):
    name: str
    size: int | None = None
    modifiedAt: str | None = None


class ModelStatusResponse(BaseModel):
    ollamaRunning: bool
    baseUrl: str
    activeModel: str | None = None
    availableCount: int = 0
    recommendedModel: str | None = None
    message: str


class ModelSelectRequest(BaseModel):
    model: str


class ModelPullRequest(BaseModel):
    model: str
    approved: bool = False


class ModelTestRequest(BaseModel):
    model: str | None = None
    prompt: str = Field(default="Reply with one short sentence confirming you are ready.")

