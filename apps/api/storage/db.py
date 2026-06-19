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
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS memory_items (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    memory_type TEXT,
                    title TEXT,
                    content TEXT NOT NULL,
                    tags TEXT DEFAULT '[]',
                    source TEXT,
                    importance INTEGER DEFAULT 1,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS system_tools (
                    id TEXT PRIMARY KEY,
                    tool_name TEXT NOT NULL,
                    detected BOOLEAN DEFAULT 0,
                    version TEXT,
                    path TEXT,
                    status TEXT,
                    last_checked_at TEXT,
                    notes TEXT
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS research_notes (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    topic TEXT NOT NULL,
                    summary TEXT,
                    sources_json TEXT DEFAULT '[]',
                    recommendation TEXT,
                    assumptions TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS activity_logs (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    activity_type TEXT NOT NULL,
                    title TEXT,
                    description TEXT,
                    severity TEXT,
                    metadata_json TEXT DEFAULT '{}',
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS agent_roles (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    role TEXT,
                    description TEXT,
                    capabilities_json TEXT DEFAULT '[]',
                    status TEXT,
                    last_used_at TEXT
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    priority TEXT,
                    issue_category TEXT,
                    sentiment_source TEXT,
                    project_id TEXT,
                    suggested_files_json TEXT DEFAULT '[]',
                    status TEXT,
                    ai_recommendation TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
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


    # New CRUD methods
    def add_memory_item(self, project_id: str | None, memory_type: str, title: str, content: str, source: str | None = None, tags: list[str] | None = None, importance: int = 1) -> dict[str, Any]:
        item_id = str(uuid.uuid4())
        now = utc_now()
        row = {
            "id": item_id,
            "project_id": project_id,
            "memory_type": memory_type,
            "title": title,
            "content": content,
            "tags": tags or [],
            "source": source,
            "importance": importance,
            "created_at": now,
            "updated_at": now
        }
        with self.connect() as conn:
            conn.execute(
                """
                INSERT INTO memory_items (id, project_id, memory_type, title, content, tags, source, importance, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (row["id"], row["project_id"], row["memory_type"], row["title"], row["content"], json.dumps(row["tags"]), row["source"], row["importance"], row["created_at"], row["updated_at"])
            )
        return row

    def list_memory_items(self, project_id: str | None = None, memory_type: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
        query = "SELECT * FROM memory_items WHERE 1=1"
        params: list[Any] = []
        if project_id:
            query += " AND project_id = ?"
            params.append(project_id)
        if memory_type:
            query += " AND memory_type = ?"
            params.append(memory_type)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        with self.connect() as conn:
            rows = conn.execute(query, tuple(params)).fetchall()
        return [dict(row) for row in rows]

    def add_activity_log(self, project_id: str | None, activity_type: str, title: str, description: str = "", severity: str = "info", metadata: dict[str, Any] | None = None) -> dict[str, Any]:
        log_id = str(uuid.uuid4())
        now = utc_now()
        row = {
            "id": log_id,
            "project_id": project_id,
            "activity_type": activity_type,
            "title": title,
            "description": description,
            "severity": severity,
            "metadata_json": json.dumps(metadata or {}),
            "created_at": now
        }
        with self.connect() as conn:
            conn.execute(
                """
                INSERT INTO activity_logs (id, project_id, activity_type, title, description, severity, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (row["id"], row["project_id"], row["activity_type"], row["title"], row["description"], row["severity"], row["metadata_json"], row["created_at"])
            )
        return row

    def list_activity_logs(self, project_id: str | None = None, limit: int = 100) -> list[dict[str, Any]]:
        query = "SELECT * FROM activity_logs"
        params: list[Any] = []
        if project_id:
            query += " WHERE project_id = ?"
            params.append(project_id)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        with self.connect() as conn:
            rows = conn.execute(query, tuple(params)).fetchall()
        return [dict(row) for row in rows]

    def clear_activity_logs(self) -> None:
        with self.connect() as conn:
            conn.execute("DELETE FROM activity_logs")

    def upsert_system_tool(self, tool_name: str, detected: bool, version: str | None, path: str | None, status: str | None, notes: str | None) -> None:
        tool_id = str(uuid.uuid4())
        now = utc_now()
        with self.connect() as conn:
            existing = conn.execute("SELECT id FROM system_tools WHERE tool_name = ?", (tool_name,)).fetchone()
            if existing:
                conn.execute(
                    """
                    UPDATE system_tools SET detected = ?, version = ?, path = ?, status = ?, last_checked_at = ?, notes = ? WHERE tool_name = ?
                    """,
                    (detected, version, path, status, now, notes, tool_name)
                )
            else:
                conn.execute(
                    """
                    INSERT INTO system_tools (id, tool_name, detected, version, path, status, last_checked_at, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (tool_id, tool_name, detected, version, path, status, now, notes)
                )

    def list_system_tools(self) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute("SELECT * FROM system_tools ORDER BY tool_name").fetchall()
        return [dict(row) for row in rows]

    def add_research_note(self, project_id: str | None, topic: str, summary: str, sources: list[str], recommendation: str, assumptions: str) -> dict[str, Any]:
        note_id = str(uuid.uuid4())
        now = utc_now()
        row = {
            "id": note_id,
            "project_id": project_id,
            "topic": topic,
            "summary": summary,
            "sources_json": json.dumps(sources),
            "recommendation": recommendation,
            "assumptions": assumptions,
            "created_at": now,
            "updated_at": now
        }
        with self.connect() as conn:
            conn.execute(
                """
                INSERT INTO research_notes (id, project_id, topic, summary, sources_json, recommendation, assumptions, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (row["id"], row["project_id"], row["topic"], row["summary"], json.dumps(sources), row["recommendation"], row["assumptions"], row["created_at"], row["updated_at"])
            )
        return row

    def list_research_notes(self, limit: int = 50) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute("SELECT * FROM research_notes ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
        return [dict(row) for row in rows]

    def upsert_agent_role(self, name: str, role: str, description: str, capabilities: list[str], status: str) -> None:
        agent_id = str(uuid.uuid4())
        now = utc_now()
        with self.connect() as conn:
            existing = conn.execute("SELECT id FROM agent_roles WHERE name = ?", (name,)).fetchone()
            if existing:
                conn.execute(
                    """
                    UPDATE agent_roles SET role = ?, description = ?, capabilities_json = ?, status = ?, last_used_at = ? WHERE name = ?
                    """,
                    (role, description, json.dumps(capabilities), status, now, name)
                )
            else:
                conn.execute(
                    """
                    INSERT INTO agent_roles (id, name, role, description, capabilities_json, status, last_used_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (agent_id, name, role, description, json.dumps(capabilities), status, now)
                )

    def list_agent_roles(self) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute("SELECT * FROM agent_roles ORDER BY name").fetchall()
        return [dict(row) for row in rows]

    def create_task(self, title: str, description: str, priority: str, issue_category: str, sentiment_source: str, project_id: str, suggested_files: list[str], status: str, ai_recommendation: str) -> dict[str, Any]:
        task_id = str(uuid.uuid4())
        now = utc_now()
        with self.connect() as conn:
            conn.execute(
                """
                INSERT INTO tasks (id, title, description, priority, issue_category, sentiment_source, project_id, suggested_files_json, status, ai_recommendation, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (task_id, title, description, priority, issue_category, sentiment_source, project_id, json.dumps(suggested_files), status, ai_recommendation, now, now)
            )
        return self.get_task(task_id) or {}

    def get_task(self, task_id: str) -> dict[str, Any] | None:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        if not row:
            return None
        d = dict(row)
        d["suggested_files"] = json.loads(d["suggested_files_json"] or "[]")
        return d

    def list_tasks(self) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
        result = []
        for row in rows:
            d = dict(row)
            d["suggested_files"] = json.loads(d["suggested_files_json"] or "[]")
            result.append(d)
        return result

    def update_task_status(self, task_id: str, status: str) -> dict[str, Any] | None:
        now = utc_now()
        with self.connect() as conn:
            conn.execute("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?", (status, now, task_id))
        return self.get_task(task_id)

    def delete_task(self, task_id: str) -> None:
        with self.connect() as conn:
            conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))

db = Database()
