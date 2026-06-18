from __future__ import annotations

from typing import Any

from storage.db import db


class ResearchService:
    def save_note(self, project_id: str | None, topic: str, summary: str, sources: list[str], recommendation: str, assumptions: str) -> dict[str, Any]:
        return db.add_research_note(project_id, topic, summary, sources, recommendation, assumptions)

    def get_history(self, limit: int = 50) -> list[dict[str, Any]]:
        return db.list_research_notes(limit)

    def delete_note(self, note_id: str) -> None:
        # Implement delete if needed or leave for later.
        pass


research_service = ResearchService()
