from __future__ import annotations

from pydantic import BaseModel, Field


class RagIndexRequest(BaseModel):
    projectId: str | None = None
    path: str | None = None


class RagQueryRequest(BaseModel):
    query: str = Field(min_length=1)
    projectId: str | None = None
    topK: int = 5


class RagMemoryAddRequest(BaseModel):
    projectId: str
    content: str = Field(min_length=1)
    tags: list[str] = Field(default_factory=list)
