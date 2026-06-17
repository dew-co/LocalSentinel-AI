from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field


class AgentPlanRequest(BaseModel):
    goal: str = Field(min_length=3)
    projectId: str | None = None


class AgentPlanResponse(BaseModel):
    goal: str
    riskLevel: Literal["low", "medium", "high"]
    steps: list[str]
    filesToRead: list[str]
    filesToCreate: list[str]
    filesToModify: list[str]
    commandsNeeded: list[str]
    requiresApproval: bool = True


class FileOperation(BaseModel):
    type: Literal["create", "modify"]
    path: str
    content: str | None = None


class CommandOperation(BaseModel):
    command: str
    cwd: str | None = None


class SafePreviewRequest(BaseModel):
    projectPath: str | None = None
    fileOperations: list[FileOperation] = Field(default_factory=list)
    commands: list[CommandOperation] = Field(default_factory=list)


class SafeExecuteRequest(SafePreviewRequest):
    approved: bool = False
