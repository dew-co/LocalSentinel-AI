from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    projectId: str | None = None
    useRag: bool = True
    model: str | None = None
    assistantTone: Literal["friendly", "calm", "concise", "teacher"] = "friendly"
    responseLength: Literal["brief", "balanced", "detailed"] = "balanced"
    isVoice: bool = False
    rememberVoice: bool = False
    conversationHistory: list[ChatTurn] = Field(default_factory=list, max_length=12)


class ChatCitation(BaseModel):
    filePath: str
    score: float
    preview: str


class ChatResponse(BaseModel):
    answer: str
    model: str | None = None
    citations: list[ChatCitation] = Field(default_factory=list)
    suggestedFiles: list[str] = Field(default_factory=list)
    safeActions: list[str] = Field(default_factory=list)
    memoryStored: bool = False
