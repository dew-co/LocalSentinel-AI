from __future__ import annotations

import re


CRITICAL_TERMS = {"crash", "crashing", "broken", "payment", "security", "login", "auth", "data loss", "breach"}
HIGH_TERMS = {"slow", "confusing", "error", "failed", "failure", "bug", "blocked", "frustrated"}
REQUEST_TERMS = {"request", "change", "add", "update", "improve", "feature"}


class SentimentService:
    def __init__(self) -> None:
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

            self.analyzer = SentimentIntensityAnalyzer()
        except Exception:
            self.analyzer = None

    def analyze(self, text: str) -> dict:
        score = self.compound(text)
        lowered = text.lower()
        detected = sorted({term for term in CRITICAL_TERMS | HIGH_TERMS | REQUEST_TERMS if re.search(rf"\b{re.escape(term)}\b", lowered)})

        if score <= -0.25:
            sentiment = "negative"
        elif score >= 0.25:
            sentiment = "positive"
        else:
            sentiment = "neutral"

        has_critical = any(term in lowered for term in CRITICAL_TERMS)
        has_high = any(term in lowered for term in HIGH_TERMS)
        has_request = any(term in lowered for term in REQUEST_TERMS)

        if sentiment == "negative" and has_critical:
            urgency, priority = "high", "critical"
        elif sentiment == "negative" and has_high:
            urgency, priority = "high", "high"
        elif sentiment == "negative":
            urgency, priority = "medium", "high"
        elif sentiment == "neutral" and has_request:
            urgency, priority = "medium", "medium"
        elif sentiment == "positive" and (has_critical or has_high):
            urgency, priority = "medium", "medium"
        else:
            urgency, priority = "low", "low"

        action = self.recommended_action(priority, detected)
        return {
            "sentiment": sentiment,
            "compoundScore": round(score, 3),
            "urgency": urgency,
            "priority": priority,
            "detectedIssues": detected,
            "recommendedAction": action,
        }

    def compound(self, text: str) -> float:
        if self.analyzer:
            return float(self.analyzer.polarity_scores(text)["compound"])
        lowered = text.lower()
        negative = sum(1 for word in HIGH_TERMS | CRITICAL_TERMS if word in lowered)
        positive = sum(1 for word in ("great", "good", "love", "excellent", "happy") if word in lowered)
        return max(-1.0, min(1.0, (positive - negative) / 5))

    def recommended_action(self, priority: str, issues: list[str]) -> str:
        issue_text = ", ".join(issues[:3]) if issues else "reported feedback"
        if priority == "critical":
            return f"Investigate {issue_text} immediately and create a fix plan before new feature work."
        if priority == "high":
            return f"Prioritize {issue_text} in the next development cycle."
        if priority == "medium":
            return f"Convert {issue_text} into a scoped task and schedule it after critical fixes."
        return "Track the feedback as low priority unless it repeats."


sentiment_service = SentimentService()

