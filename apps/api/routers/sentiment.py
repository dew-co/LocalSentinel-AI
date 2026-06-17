from __future__ import annotations

from fastapi import APIRouter

from schemas.sentiment_schema import SentimentRequest
from services.sentiment_service import sentiment_service

router = APIRouter(prefix="/sentiment", tags=["sentiment"])


@router.post("/analyze")
def analyze_sentiment(payload: SentimentRequest):
    return sentiment_service.analyze(payload.text)

