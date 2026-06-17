from __future__ import annotations

from storage.db import db


class MemoryService:
    def add(self, project_id: str, content: str, tags: list[str] | None = None) -> dict:
        return db.add_memory(project_id, content, tags)

    def list(self, project_id: str | None = None) -> list[dict]:
        return db.list_memory(project_id)


memory_service = MemoryService()

