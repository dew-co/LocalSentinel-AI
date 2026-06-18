from __future__ import annotations

from typing import Any

from storage.db import db


class ActivityService:
    def log(self, project_id: str | None, activity_type: str, title: str, description: str = "", severity: str = "info", metadata: dict[str, Any] | None = None) -> dict[str, Any]:
        return db.add_activity_log(project_id, activity_type, title, description, severity, metadata)

    def get_logs(self, project_id: str | None = None, limit: int = 100) -> list[dict[str, Any]]:
        return db.list_activity_logs(project_id, limit)

    def clear(self) -> None:
        db.clear_activity_logs()


activity_service = ActivityService()
