from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from config import SQLITE_DIR, ensure_data_dirs


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Database:
    def __init__(self, db_path: Path | None = None) -> None:
        ensure_data_dirs()
        self.db_path = db_path or (SQLITE_DIR / "localsentinel.db")
        self.init()

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init(self) -> None:
        with self.connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    path TEXT NOT NULL UNIQUE,
                    idea TEXT DEFAULT '',
                    stack TEXT DEFAULT '[]',
                    summary TEXT DEFAULT '',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS memory (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    content TEXT NOT NULL,
                    tags TEXT DEFAULT '[]',
                    created_at TEXT NOT NULL
                )
                """
            )

    def upsert_project(
        self,
        project_id: str,
        name: str,
        path: str,
        idea: str = "",
        stack: list[str] | None = None,
        summary: str = "",
    ) -> dict[str, Any]:
        now = utc_now()
        stack_json = json.dumps(stack or [])
        with self.connect() as conn:
            existing = conn.execute("SELECT created_at FROM projects WHERE id = ?", (project_id,)).fetchone()
            created_at = existing["created_at"] if existing else now
            conn.execute(
                """
                INSERT INTO projects (id, name, path, idea, stack, summary, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  name = excluded.name,
                  path = excluded.path,
                  idea = excluded.idea,
                  stack = excluded.stack,
                  summary = excluded.summary,
                  updated_at = excluded.updated_at
                """,
                (project_id, name, path, idea, stack_json, summary, created_at, now),
            )
        return self.get_project(project_id) or {}

    def list_projects(self) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute("SELECT * FROM projects ORDER BY updated_at DESC").fetchall()
        return [self._project_row(row) for row in rows]

    def get_project(self, project_id: str) -> dict[str, Any] | None:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        return self._project_row(row) if row else None

    def get_project_by_path(self, path: str) -> dict[str, Any] | None:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM projects WHERE path = ?", (path,)).fetchone()
        return self._project_row(row) if row else None

    def set_setting(self, key: str, value: Any) -> None:
        with self.connect() as conn:
            conn.execute(
                "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (key, json.dumps(value)),
            )

    def get_setting(self, key: str, default: Any = None) -> Any:
        with self.connect() as conn:
            row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        if not row:
            return default
        try:
            return json.loads(row["value"])
        except json.JSONDecodeError:
            return row["value"]

    def add_memory(self, project_id: str, content: str, tags: list[str] | None = None) -> dict[str, Any]:
        memory_id = str(uuid.uuid4())
        row = {
            "id": memory_id,
            "projectId": project_id,
            "content": content,
            "tags": tags or [],
            "createdAt": utc_now(),
        }
        with self.connect() as conn:
            conn.execute(
                "INSERT INTO memory (id, project_id, content, tags, created_at) VALUES (?, ?, ?, ?, ?)",
                (row["id"], row["projectId"], row["content"], json.dumps(row["tags"]), row["createdAt"]),
            )
        return row

    def list_memory(self, project_id: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
        params: tuple[Any, ...]
        if project_id:
            query = "SELECT * FROM memory WHERE project_id = ? ORDER BY created_at DESC LIMIT ?"
            params = (project_id, limit)
        else:
            query = "SELECT * FROM memory ORDER BY created_at DESC LIMIT ?"
            params = (limit,)
        with self.connect() as conn:
            rows = conn.execute(query, params).fetchall()
        return [
            {
                "id": row["id"],
                "projectId": row["project_id"],
                "content": row["content"],
                "tags": json.loads(row["tags"] or "[]"),
                "createdAt": row["created_at"],
            }
            for row in rows
        ]

    def _project_row(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "name": row["name"],
            "path": row["path"],
            "idea": row["idea"],
            "stack": json.loads(row["stack"] or "[]"),
            "summary": row["summary"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }


db = Database()

