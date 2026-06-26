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
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS intelligence_items (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    summary TEXT,
                    content TEXT,
                    category TEXT,
                    memory_domain TEXT,
                    source_type TEXT,
                    source_url TEXT,
                    source_name TEXT,
                    confidence_level TEXT,
                    freshness_date TEXT,
                    expires_at TEXT,
                    tags_json TEXT DEFAULT '[]',
                    related_project_id TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    last_used_at TEXT,
                    use_count INTEGER DEFAULT 0
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS intelligence_sources (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    source_type TEXT,
                    base_url TEXT,
                    category TEXT,
                    allowed BOOLEAN DEFAULT 0,
                    trust_level TEXT,
                    last_checked_at TEXT,
                    notes TEXT
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS intelligence_refresh_runs (
                    id TEXT PRIMARY KEY,
                    run_type TEXT,
                    status TEXT,
                    started_at TEXT NOT NULL,
                    completed_at TEXT,
                    items_found INTEGER DEFAULT 0,
                    items_saved INTEGER DEFAULT 0,
                    items_updated INTEGER DEFAULT 0,
                    errors_json TEXT DEFAULT '[]',
                    triggered_by TEXT
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS user_activity_signals (
                    id TEXT PRIMARY KEY,
                    project_id TEXT,
                    activity_type TEXT,
                    signal_key TEXT,
                    signal_value TEXT,
                    weight REAL DEFAULT 1,
                    created_at TEXT NOT NULL,
                    metadata_json TEXT DEFAULT '{}'
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS adaptive_preferences (
                    id TEXT PRIMARY KEY,
                    preference_key TEXT,
                    preference_value TEXT,
                    confidence REAL DEFAULT 0,
                    source TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    user_editable BOOLEAN DEFAULT 1
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS consent_settings (
                    id TEXT PRIMARY KEY,
                    setting_key TEXT NOT NULL UNIQUE,
                    setting_value TEXT NOT NULL,
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
        result: list[dict[str, Any]] = []
        for row in rows:
            item = dict(row)
            try:
                item["metadata"] = json.loads(item.get("metadata_json") or "{}")
            except json.JSONDecodeError:
                item["metadata"] = {}
            result.append(item)
        return result

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

    def get_consent_settings(self, defaults: dict[str, Any] | None = None) -> dict[str, Any]:
        settings = dict(defaults or {})
        with self.connect() as conn:
            rows = conn.execute("SELECT setting_key, setting_value FROM consent_settings").fetchall()
        for row in rows:
            try:
                settings[row["setting_key"]] = json.loads(row["setting_value"])
            except json.JSONDecodeError:
                settings[row["setting_key"]] = row["setting_value"]
        return settings

    def set_consent_setting(self, key: str, value: Any) -> None:
        now = utc_now()
        with self.connect() as conn:
            existing = conn.execute("SELECT id FROM consent_settings WHERE setting_key = ?", (key,)).fetchone()
            setting_id = existing["id"] if existing else str(uuid.uuid4())
            conn.execute(
                """
                INSERT INTO consent_settings (id, setting_key, setting_value, updated_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(setting_key) DO UPDATE SET
                  setting_value = excluded.setting_value,
                  updated_at = excluded.updated_at
                """,
                (setting_id, key, json.dumps(value), now),
            )

    def patch_consent_settings(self, values: dict[str, Any]) -> dict[str, Any]:
        for key, value in values.items():
            self.set_consent_setting(key, value)
        return self.get_consent_settings()

    def upsert_intelligence_source(
        self,
        name: str,
        source_type: str,
        base_url: str,
        category: str,
        allowed: bool,
        trust_level: str,
        notes: str = "",
        last_checked_at: str | None = None,
    ) -> dict[str, Any]:
        now = last_checked_at or utc_now()
        with self.connect() as conn:
            existing = conn.execute("SELECT id FROM intelligence_sources WHERE name = ? AND base_url = ?", (name, base_url)).fetchone()
            source_id = existing["id"] if existing else str(uuid.uuid4())
            conn.execute(
                """
                INSERT INTO intelligence_sources (id, name, source_type, base_url, category, allowed, trust_level, last_checked_at, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  name = excluded.name,
                  source_type = excluded.source_type,
                  base_url = excluded.base_url,
                  category = excluded.category,
                  allowed = excluded.allowed,
                  trust_level = excluded.trust_level,
                  last_checked_at = excluded.last_checked_at,
                  notes = excluded.notes
                """,
                (source_id, name, source_type, base_url, category, allowed, trust_level, now, notes),
            )
        return self.get_intelligence_source(source_id) or {}

    def get_intelligence_source(self, source_id: str) -> dict[str, Any] | None:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM intelligence_sources WHERE id = ?", (source_id,)).fetchone()
        return dict(row) if row else None

    def list_intelligence_sources(self, allowed_only: bool = False) -> list[dict[str, Any]]:
        query = "SELECT * FROM intelligence_sources"
        params: tuple[Any, ...] = ()
        if allowed_only:
            query += " WHERE allowed = 1"
        query += " ORDER BY category, name"
        with self.connect() as conn:
            rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]

    def upsert_intelligence_item(
        self,
        title: str,
        summary: str,
        content: str,
        category: str,
        memory_domain: str,
        source_type: str,
        source_url: str,
        source_name: str,
        confidence_level: str,
        freshness_date: str,
        expires_at: str | None = None,
        tags: list[str] | None = None,
        related_project_id: str | None = None,
    ) -> tuple[dict[str, Any], bool]:
        now = utc_now()
        tags_json = json.dumps(tags or [])
        with self.connect() as conn:
            existing = conn.execute(
                """
                SELECT id, created_at FROM intelligence_items
                WHERE title = ? AND source_url = ? AND COALESCE(related_project_id, '') = COALESCE(?, '')
                """,
                (title, source_url, related_project_id),
            ).fetchone()
            item_id = existing["id"] if existing else str(uuid.uuid4())
            created_at = existing["created_at"] if existing else now
            conn.execute(
                """
                INSERT INTO intelligence_items (
                    id, title, summary, content, category, memory_domain, source_type,
                    source_url, source_name, confidence_level, freshness_date, expires_at,
                    tags_json, related_project_id, created_at, updated_at, last_used_at, use_count
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0)
                ON CONFLICT(id) DO UPDATE SET
                  title = excluded.title,
                  summary = excluded.summary,
                  content = excluded.content,
                  category = excluded.category,
                  memory_domain = excluded.memory_domain,
                  source_type = excluded.source_type,
                  source_url = excluded.source_url,
                  source_name = excluded.source_name,
                  confidence_level = excluded.confidence_level,
                  freshness_date = excluded.freshness_date,
                  expires_at = excluded.expires_at,
                  tags_json = excluded.tags_json,
                  related_project_id = excluded.related_project_id,
                  updated_at = excluded.updated_at
                """,
                (
                    item_id,
                    title,
                    summary,
                    content,
                    category,
                    memory_domain,
                    source_type,
                    source_url,
                    source_name,
                    confidence_level,
                    freshness_date,
                    expires_at,
                    tags_json,
                    related_project_id,
                    created_at,
                    now,
                ),
            )
        item = self.get_intelligence_item(item_id) or {}
        return item, existing is not None

    def get_intelligence_item(self, item_id: str, mark_used: bool = False) -> dict[str, Any] | None:
        with self.connect() as conn:
            if mark_used:
                conn.execute(
                    "UPDATE intelligence_items SET use_count = COALESCE(use_count, 0) + 1, last_used_at = ? WHERE id = ?",
                    (utc_now(), item_id),
                )
            row = conn.execute("SELECT * FROM intelligence_items WHERE id = ?", (item_id,)).fetchone()
        return self._intelligence_item_row(row) if row else None

    def list_intelligence_items(
        self,
        query: str | None = None,
        category: str | None = None,
        source_type: str | None = None,
        memory_domain: str | None = None,
        project_id: str | None = None,
        freshness: str | None = None,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        sql = "SELECT * FROM intelligence_items WHERE 1=1"
        params: list[Any] = []
        if query:
            like = f"%{query.lower()}%"
            sql += " AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(content) LIKE ? OR LOWER(tags_json) LIKE ?)"
            params.extend([like, like, like, like])
        if category:
            sql += " AND category = ?"
            params.append(category)
        if source_type:
            sql += " AND source_type = ?"
            params.append(source_type)
        if memory_domain:
            sql += " AND memory_domain = ?"
            params.append(memory_domain)
        if project_id:
            sql += " AND (related_project_id = ? OR related_project_id IS NULL)"
            params.append(project_id)
        if freshness == "stale":
            sql += " AND expires_at IS NOT NULL AND expires_at < ?"
            params.append(utc_now())
        elif freshness == "fresh":
            sql += " AND (expires_at IS NULL OR expires_at >= ?)"
            params.append(utc_now())
        sql += " ORDER BY updated_at DESC LIMIT ?"
        params.append(max(1, min(limit, 250)))
        with self.connect() as conn:
            rows = conn.execute(sql, tuple(params)).fetchall()
        return [self._intelligence_item_row(row) for row in rows]

    def count_intelligence_items(self) -> int:
        with self.connect() as conn:
            row = conn.execute("SELECT COUNT(*) AS count FROM intelligence_items").fetchone()
        return int(row["count"] if row else 0)

    def delete_intelligence_item(self, item_id: str) -> None:
        with self.connect() as conn:
            conn.execute("DELETE FROM intelligence_items WHERE id = ?", (item_id,))

    def clear_intelligence_cache(self) -> int:
        with self.connect() as conn:
            row = conn.execute("SELECT COUNT(*) AS count FROM intelligence_items").fetchone()
            count = int(row["count"] if row else 0)
            conn.execute("DELETE FROM intelligence_items")
        return count

    def create_intelligence_refresh_run(self, run_type: str, status: str, triggered_by: str) -> dict[str, Any]:
        run_id = str(uuid.uuid4())
        now = utc_now()
        with self.connect() as conn:
            conn.execute(
                """
                INSERT INTO intelligence_refresh_runs (id, run_type, status, started_at, triggered_by)
                VALUES (?, ?, ?, ?, ?)
                """,
                (run_id, run_type, status, now, triggered_by),
            )
        return self.get_intelligence_refresh_run(run_id) or {}

    def complete_intelligence_refresh_run(
        self,
        run_id: str,
        status: str,
        items_found: int,
        items_saved: int,
        items_updated: int,
        errors: list[str] | None = None,
    ) -> dict[str, Any]:
        with self.connect() as conn:
            conn.execute(
                """
                UPDATE intelligence_refresh_runs
                SET status = ?, completed_at = ?, items_found = ?, items_saved = ?, items_updated = ?, errors_json = ?
                WHERE id = ?
                """,
                (status, utc_now(), items_found, items_saved, items_updated, json.dumps(errors or []), run_id),
            )
        return self.get_intelligence_refresh_run(run_id) or {}

    def get_intelligence_refresh_run(self, run_id: str) -> dict[str, Any] | None:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM intelligence_refresh_runs WHERE id = ?", (run_id,)).fetchone()
        return self._refresh_run_row(row) if row else None

    def list_intelligence_refresh_runs(self, limit: int = 50) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute("SELECT * FROM intelligence_refresh_runs ORDER BY started_at DESC LIMIT ?", (max(1, min(limit, 100)),)).fetchall()
        return [self._refresh_run_row(row) for row in rows]

    def last_successful_intelligence_refresh(self) -> str | None:
        with self.connect() as conn:
            row = conn.execute(
                """
                SELECT completed_at FROM intelligence_refresh_runs
                WHERE status = 'completed'
                ORDER BY completed_at DESC LIMIT 1
                """
            ).fetchone()
        return row["completed_at"] if row else None

    def add_user_activity_signal(
        self,
        project_id: str | None,
        activity_type: str,
        signal_key: str,
        signal_value: str,
        weight: float = 1,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        signal_id = str(uuid.uuid4())
        now = utc_now()
        with self.connect() as conn:
            conn.execute(
                """
                INSERT INTO user_activity_signals (id, project_id, activity_type, signal_key, signal_value, weight, created_at, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (signal_id, project_id, activity_type, signal_key, signal_value, weight, now, json.dumps(metadata or {})),
            )
        return {
            "id": signal_id,
            "project_id": project_id,
            "activity_type": activity_type,
            "signal_key": signal_key,
            "signal_value": signal_value,
            "weight": weight,
            "created_at": now,
            "metadata": metadata or {},
        }

    def upsert_adaptive_preference(
        self,
        preference_key: str,
        preference_value: str,
        confidence_delta: float,
        source: str,
        user_editable: bool = True,
    ) -> dict[str, Any]:
        now = utc_now()
        with self.connect() as conn:
            existing = conn.execute(
                "SELECT * FROM adaptive_preferences WHERE preference_key = ? AND preference_value = ?",
                (preference_key, preference_value),
            ).fetchone()
            if existing:
                confidence = min(1.0, max(0.0, float(existing["confidence"] or 0) + confidence_delta))
                conn.execute(
                    "UPDATE adaptive_preferences SET confidence = ?, source = ?, updated_at = ?, user_editable = ? WHERE id = ?",
                    (confidence, source, now, user_editable, existing["id"]),
                )
                pref_id = existing["id"]
            else:
                pref_id = str(uuid.uuid4())
                confidence = min(1.0, max(0.0, confidence_delta))
                conn.execute(
                    """
                    INSERT INTO adaptive_preferences (id, preference_key, preference_value, confidence, source, created_at, updated_at, user_editable)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (pref_id, preference_key, preference_value, confidence, source, now, now, user_editable),
                )
        return self.get_adaptive_preference(pref_id) or {}

    def get_adaptive_preference(self, preference_id: str) -> dict[str, Any] | None:
        with self.connect() as conn:
            row = conn.execute("SELECT * FROM adaptive_preferences WHERE id = ?", (preference_id,)).fetchone()
        return dict(row) if row else None

    def list_adaptive_preferences(self, limit: int = 100) -> list[dict[str, Any]]:
        with self.connect() as conn:
            rows = conn.execute(
                "SELECT * FROM adaptive_preferences ORDER BY confidence DESC, updated_at DESC LIMIT ?",
                (max(1, min(limit, 250)),),
            ).fetchall()
        return [dict(row) for row in rows]

    def delete_adaptive_preference(self, preference_id: str) -> None:
        with self.connect() as conn:
            conn.execute("DELETE FROM adaptive_preferences WHERE id = ?", (preference_id,))

    def _intelligence_item_row(self, row: sqlite3.Row) -> dict[str, Any]:
        item = dict(row)
        try:
            item["tags"] = json.loads(item.get("tags_json") or "[]")
        except json.JSONDecodeError:
            item["tags"] = []
        return item

    def _refresh_run_row(self, row: sqlite3.Row) -> dict[str, Any]:
        item = dict(row)
        try:
            item["errors"] = json.loads(item.get("errors_json") or "[]")
        except json.JSONDecodeError:
            item["errors"] = []
        return item

db = Database()
