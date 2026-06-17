from __future__ import annotations

from pydantic import BaseModel, Field


class ProjectCreateRequest(BaseModel):
    idea: str = Field(min_length=3)
    name: str = Field(min_length=1)
    path: str = Field(min_length=1)
    preferredStack: str | None = None
    appType: str | None = "fullstack"
    allowOverwrite: bool = False


class ProjectScanRequest(BaseModel):
    path: str = Field(min_length=1)


class ProjectRecord(BaseModel):
    id: str
    name: str
    path: str
    idea: str = ""
    stack: list[str] = Field(default_factory=list)
    summary: str = ""
    createdAt: str
    updatedAt: str


class ProjectCreateResponse(BaseModel):
    project: ProjectRecord
    createdFiles: list[str]
    fileTree: list[str]
    message: str


class ProjectScanResponse(BaseModel):
    projectId: str
    projectName: str
    projectPath: str
    detectedStack: list[str]
    importantFiles: list[str]
    fileTree: list[str]
    summary: str
    recommendations: list[str]
