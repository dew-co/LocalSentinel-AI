from __future__ import annotations

from typing import Any

from storage.db import db


class MemoryService:
    def add(self, project_id: str, content: str, tags: list[str] | None = None) -> dict[str, Any]:
        # Legacy
        return db.add_memory(project_id, content, tags)

    def list(self, project_id: str | None = None) -> list[dict[str, Any]]:
        # Legacy
        return db.list_memory(project_id)

    def add_memory_item(self, project_id: str | None, memory_type: str, title: str, content: str, source: str | None = None, tags: list[str] | None = None, importance: int = 1) -> dict[str, Any]:
        return db.add_memory_item(project_id, memory_type, title, content, source, tags, importance)

    def list_memory_items(self, project_id: str | None = None, memory_type: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
        return db.list_memory_items(project_id, memory_type, limit)


memory_service = MemoryService()
