from __future__ import annotations

from pydantic import BaseModel, Field


class SentimentRequest(BaseModel):
    text: str = Field(min_length=1)


class SentimentResponse(BaseModel):
    sentiment: str
    compoundScore: float
    urgency: str
    priority: str
    detectedIssues: list[str]
    recommendedAction: str

