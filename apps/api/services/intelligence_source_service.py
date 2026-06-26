from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from storage.db import db, utc_now


SOURCE_CATEGORIES = [
    "official_documentation",
    "framework_best_practices",
    "package_documentation",
    "local_ai_models",
    "common_error_solutions",
    "security_best_practices",
    "deployment_guides",
    "database_guides",
    "frontend_guides",
    "backend_guides",
    "user_project_topics",
]


TRUSTED_SOURCES: list[dict[str, Any]] = [
    {"name": "React Docs", "source_type": "official_docs", "base_url": "https://react.dev", "category": "frontend_guides", "trust_level": "high"},
    {"name": "TypeScript Docs", "source_type": "official_docs", "base_url": "https://www.typescriptlang.org/docs/", "category": "official_documentation", "trust_level": "high"},
    {"name": "Vite Docs", "source_type": "official_docs", "base_url": "https://vite.dev/guide/", "category": "frontend_guides", "trust_level": "high"},
    {"name": "Tailwind CSS Docs", "source_type": "official_docs", "base_url": "https://tailwindcss.com/docs", "category": "frontend_guides", "trust_level": "high"},
    {"name": "FastAPI Docs", "source_type": "official_docs", "base_url": "https://fastapi.tiangolo.com/", "category": "backend_guides", "trust_level": "high"},
    {"name": "Python Docs", "source_type": "official_docs", "base_url": "https://docs.python.org/3/", "category": "official_documentation", "trust_level": "high"},
    {"name": "Node.js Docs", "source_type": "official_docs", "base_url": "https://nodejs.org/en/learn", "category": "backend_guides", "trust_level": "high"},
    {"name": "Docker Docs", "source_type": "official_docs", "base_url": "https://docs.docker.com/", "category": "deployment_guides", "trust_level": "high"},
    {"name": "Ollama Docs", "source_type": "official_docs", "base_url": "https://github.com/ollama/ollama/blob/main/docs/README.md", "category": "local_ai_models", "trust_level": "high"},
    {"name": "Firebase Docs", "source_type": "official_docs", "base_url": "https://firebase.google.com/docs", "category": "database_guides", "trust_level": "high"},
    {"name": "Supabase Docs", "source_type": "official_docs", "base_url": "https://supabase.com/docs", "category": "database_guides", "trust_level": "high"},
    {"name": "MongoDB Docs", "source_type": "official_docs", "base_url": "https://www.mongodb.com/docs/", "category": "database_guides", "trust_level": "high"},
    {"name": "PostgreSQL Docs", "source_type": "official_docs", "base_url": "https://www.postgresql.org/docs/", "category": "database_guides", "trust_level": "high"},
    {"name": "OWASP Cheat Sheet Series", "source_type": "trusted_security", "base_url": "https://cheatsheetseries.owasp.org/", "category": "security_best_practices", "trust_level": "high"},
]


def _expires(days: int = 90) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


CURATED_KNOWLEDGE: list[dict[str, Any]] = [
    {
        "title": "Ollama local model operations",
        "summary": "Keep Ollama checks local: verify the daemon, list installed models, select a fit-for-hardware model, and avoid automatic model pulls without explicit approval.",
        "content": "Useful local checks: GET /api/tags verifies the Ollama daemon, installed model names and sizes guide routing, and model pulls should be treated as explicit user-approved downloads. For coding tasks, prefer a coder-tuned model when installed and fall back to a smaller model on limited RAM.",
        "category": "local_ai_models",
        "memory_domain": "Model Brain",
        "source_url": "https://github.com/ollama/ollama/blob/main/docs/api.md",
        "source_name": "Ollama API docs",
        "tags": ["ollama", "local-ai", "models", "privacy"],
    },
    {
        "title": "Qwen Coder local setup notes",
        "summary": "Qwen Coder models are useful for local coding guidance when the machine has enough memory; keep routing explicit and provide smaller fallbacks.",
        "content": "Use coder-tuned local models for code explanation, patch planning, and debugging. Match model size to RAM, keep timeouts short for quick companion responses, and avoid silent downloads.",
        "category": "local_ai_models",
        "memory_domain": "Model Brain",
        "source_url": "https://ollama.com/library/qwen2.5-coder",
        "source_name": "Ollama model library",
        "tags": ["qwen", "coder-model", "local-ai"],
    },
    {
        "title": "DeepSeek Coder local setup notes",
        "summary": "DeepSeek Coder can be used as a coding-specialized fallback when installed locally and approved by the user.",
        "content": "Route code review, debugging, and implementation planning to a local coding model when available. Keep general chat on faster models when latency matters.",
        "category": "local_ai_models",
        "memory_domain": "Model Brain",
        "source_url": "https://ollama.com/library/deepseek-coder",
        "source_name": "Ollama model library",
        "tags": ["deepseek", "coder-model", "local-ai"],
    },
    {
        "title": "Local RAG embedding model guidance",
        "summary": "For offline RAG, prefer compact embeddings, small chunks with overlap, metadata-rich citations, and local-only vector storage.",
        "content": "Chunk documents into focused passages, store project and file metadata, cite local sources, and refresh indexes after important project changes. Never index .env, credentials, or private keys.",
        "category": "local_ai_models",
        "memory_domain": "Research Brain",
        "source_url": "https://docs.trychroma.com/",
        "source_name": "Chroma docs",
        "tags": ["rag", "embeddings", "offline-cache", "privacy"],
    },
    {
        "title": "React TypeScript Vite project practices",
        "summary": "Keep React components typed, route state intentionally, avoid oversized components, and use Vite environment variables only through the supported public prefix.",
        "content": "Use component boundaries around workflows, keep API types shared where practical, prefer strict TypeScript for data contracts, and keep Vite client environment values non-secret. Use local state for transient UI and server state patterns for backend-backed data.",
        "category": "framework_best_practices",
        "memory_domain": "Framework Brain",
        "source_url": "https://vite.dev/guide/env-and-mode",
        "source_name": "Vite docs",
        "tags": ["react", "typescript", "vite", "frontend"],
    },
    {
        "title": "Tailwind command-center UI practices",
        "summary": "For operational tools, use dense layouts, stable controls, restrained accents, clear badges, and avoid decorative layouts that slow repeated work.",
        "content": "Use consistent spacing, status badges, accessible contrast, stable dimensions for control surfaces, and layouts optimized for scanning. Keep cards for repeated items or tools, not nested page sections.",
        "category": "frontend_guides",
        "memory_domain": "Framework Brain",
        "source_url": "https://tailwindcss.com/docs/responsive-design",
        "source_name": "Tailwind CSS docs",
        "tags": ["tailwind", "ui", "frontend"],
    },
    {
        "title": "FastAPI backend practices",
        "summary": "Separate routers, services, schemas, and storage; keep blocking I/O out of startup; use explicit request models and concise error handling.",
        "content": "FastAPI works well with small service modules and typed Pydantic payloads. Keep long-running or network work behind explicit user actions, return structured dictionaries, and make privacy-sensitive actions visible in activity logs.",
        "category": "backend_guides",
        "memory_domain": "Framework Brain",
        "source_url": "https://fastapi.tiangolo.com/tutorial/bigger-applications/",
        "source_name": "FastAPI docs",
        "tags": ["fastapi", "python", "backend", "api"],
    },
    {
        "title": "Python local development hygiene",
        "summary": "Use virtual environments, deterministic requirements, compile checks, and never store secrets in local memory or RAG indexes.",
        "content": "Keep dependency files explicit, isolate environments, run compile checks after backend edits, and exclude .env or credential files from scanning and indexing.",
        "category": "backend_guides",
        "memory_domain": "Package Brain",
        "source_url": "https://docs.python.org/3/library/venv.html",
        "source_name": "Python docs",
        "tags": ["python", "venv", "security"],
    },
    {
        "title": "Node package manager hygiene",
        "summary": "Respect the lockfile in use, avoid mixing package managers, and treat dependency installs as user-approved actions.",
        "content": "Detect npm, pnpm, or yarn from lockfiles before running commands. Avoid silent installs, keep package changes scoped, and report the exact command before execution.",
        "category": "package_documentation",
        "memory_domain": "Package Brain",
        "source_url": "https://docs.npmjs.com/",
        "source_name": "npm docs",
        "tags": ["node", "npm", "packages"],
    },
    {
        "title": "Docker local development checklist",
        "summary": "Check Docker availability before recommending container workflows, keep secrets outside images, and prefer compose files for repeatable local services.",
        "content": "Verify the daemon, document ports and volumes, avoid copying secrets into images, use health checks for app dependencies, and keep destructive cleanup commands behind approval.",
        "category": "deployment_guides",
        "memory_domain": "System Brain",
        "source_url": "https://docs.docker.com/get-started/",
        "source_name": "Docker docs",
        "tags": ["docker", "deployment", "local-dev"],
    },
    {
        "title": "Firebase Auth and Firestore safety notes",
        "summary": "Keep Firebase client config non-secret, enforce real access with Security Rules, and test auth and rules before production use.",
        "content": "Firebase web config identifies the project but does not replace rules. Keep privileged operations server-side, write restrictive Firestore rules, and validate indexes and auth flows.",
        "category": "database_guides",
        "memory_domain": "Framework Brain",
        "source_url": "https://firebase.google.com/docs/rules",
        "source_name": "Firebase docs",
        "tags": ["firebase", "auth", "firestore", "security"],
    },
    {
        "title": "Supabase row-level security notes",
        "summary": "Use Row Level Security policies for user-scoped data and avoid exposing service role keys to client code.",
        "content": "Enable RLS on application tables, use policies that match user ownership, keep service role credentials server-side, and test anonymous and authenticated paths.",
        "category": "database_guides",
        "memory_domain": "Framework Brain",
        "source_url": "https://supabase.com/docs/guides/database/postgres/row-level-security",
        "source_name": "Supabase docs",
        "tags": ["supabase", "postgres", "rls", "security"],
    },
    {
        "title": "PostgreSQL schema practice notes",
        "summary": "Use explicit constraints, indexes for common filters, migration history, and avoid over-normalizing early MVP workflows.",
        "content": "Start with clear entities, foreign keys, and timestamps. Add indexes for lookup paths, write reversible migrations where possible, and keep audit fields for user-visible operations.",
        "category": "database_guides",
        "memory_domain": "Package Brain",
        "source_url": "https://www.postgresql.org/docs/current/ddl-constraints.html",
        "source_name": "PostgreSQL docs",
        "tags": ["postgresql", "database", "schema"],
    },
    {
        "title": "MongoDB modeling practice notes",
        "summary": "Model documents around access patterns, validate required fields, and avoid unbounded arrays in frequently updated documents.",
        "content": "Use embedded documents for data read together, references for independent entities, indexes for query paths, and schema validation for critical collections.",
        "category": "database_guides",
        "memory_domain": "Package Brain",
        "source_url": "https://www.mongodb.com/docs/manual/data-modeling/",
        "source_name": "MongoDB docs",
        "tags": ["mongodb", "database", "schema"],
    },
    {
        "title": "API security baseline",
        "summary": "Validate inputs, use least-privilege credentials, rate-limit risky endpoints, and keep secrets out of client bundles and logs.",
        "content": "Use request validation, authentication and authorization checks, safe error messages, secure CORS, and audit logging. Never store tokens, private keys, or passwords in adaptive memory.",
        "category": "security_best_practices",
        "memory_domain": "Research Brain",
        "source_url": "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html",
        "source_name": "OWASP Cheat Sheet Series",
        "tags": ["api", "security", "privacy"],
    },
    {
        "title": "CORS error triage",
        "summary": "Confirm frontend origin, backend CORS middleware, methods, headers, credentials mode, and whether the failing request is a preflight.",
        "content": "CORS failures are browser enforcement issues. Check exact origin and port, allowed headers, credentials, and OPTIONS responses. Avoid broad credentials-enabled wildcards.",
        "category": "common_error_solutions",
        "memory_domain": "Error Solution Brain",
        "source_url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS",
        "source_name": "MDN Web Docs",
        "tags": ["cors", "frontend", "backend", "errors"],
    },
    {
        "title": "Vite environment variable triage",
        "summary": "Client-visible Vite environment variables require the public prefix and should never contain secrets.",
        "content": "Use import.meta.env for Vite client variables, restart the dev server after env changes, and keep real secrets on the backend. Do not read or cache .env contents.",
        "category": "common_error_solutions",
        "memory_domain": "Error Solution Brain",
        "source_url": "https://vite.dev/guide/env-and-mode",
        "source_name": "Vite docs",
        "tags": ["vite", "env", "security", "errors"],
    },
    {
        "title": "Ollama connection refused triage",
        "summary": "If Ollama is unreachable, check the daemon, base URL, installed models, and local firewall before changing app code.",
        "content": "Verify the local service is running, GET /api/tags responds, the app uses the expected OLLAMA_BASE_URL, and an active model is selected. Avoid pulling models automatically.",
        "category": "common_error_solutions",
        "memory_domain": "Error Solution Brain",
        "source_url": "https://github.com/ollama/ollama/blob/main/docs/api.md",
        "source_name": "Ollama API docs",
        "tags": ["ollama", "errors", "local-ai"],
    },
    {
        "title": "Local-first AI architecture notes",
        "summary": "Keep private data local, ask before online research, summarize public knowledge into local cache, and cite source/date during offline use.",
        "content": "A privacy-first local AI app should separate public knowledge gathering from private project context. Use permissions, audit logs, cache clearing, and explicit offline disclaimers.",
        "category": "framework_best_practices",
        "memory_domain": "Research Brain",
        "source_url": "https://www.w3.org/TR/ethical-web-principles/",
        "source_name": "W3C Ethical Web Principles",
        "tags": ["local-first", "privacy", "architecture", "rag"],
    },
]


STACK_TOPIC_MAP: dict[str, list[str]] = {
    "react": ["React TypeScript Vite project practices", "Tailwind command-center UI practices"],
    "typescript": ["React TypeScript Vite project practices"],
    "vite": ["React TypeScript Vite project practices", "Vite environment variable triage"],
    "tailwind": ["Tailwind command-center UI practices"],
    "fastapi": ["FastAPI backend practices", "API security baseline"],
    "python": ["Python local development hygiene", "FastAPI backend practices"],
    "node": ["Node package manager hygiene"],
    "firebase": ["Firebase Auth and Firestore safety notes"],
    "supabase": ["Supabase row-level security notes"],
    "postgresql": ["PostgreSQL schema practice notes"],
    "postgres": ["PostgreSQL schema practice notes"],
    "mongodb": ["MongoDB modeling practice notes"],
    "docker": ["Docker local development checklist"],
}


class IntelligenceSourceService:
    def seed_sources(self, allowed_categories: list[str] | None = None) -> list[dict[str, Any]]:
        allowed_set = set(allowed_categories or SOURCE_CATEGORIES)
        seeded = []
        for source in TRUSTED_SOURCES:
            seeded.append(
                db.upsert_intelligence_source(
                    source["name"],
                    source["source_type"],
                    source["base_url"],
                    source["category"],
                    source["category"] in allowed_set,
                    source["trust_level"],
                    "Trusted public development source. No local project code is uploaded.",
                )
            )
        return seeded

    def list_sources(self, allowed_only: bool = False) -> list[dict[str, Any]]:
        sources = db.list_intelligence_sources(allowed_only=allowed_only)
        if not sources:
            return self.seed_sources()
        return sources

    def source_categories(self) -> list[str]:
        return SOURCE_CATEGORIES

    def knowledge_templates(self, allowed_categories: list[str] | None = None, project_stack: list[str] | None = None) -> list[dict[str, Any]]:
        allowed_set = set(allowed_categories or SOURCE_CATEGORIES)
        items = [dict(item) for item in CURATED_KNOWLEDGE if item["category"] in allowed_set]
        if not project_stack:
            return self._stamp_items(items)

        selected_titles: set[str] = set()
        for stack_item in project_stack:
            key = stack_item.lower().replace(".js", "").strip()
            selected_titles.update(STACK_TOPIC_MAP.get(key, []))

        project_items = []
        for item in CURATED_KNOWLEDGE:
            if item["title"] in selected_titles and item["category"] in allowed_set:
                copied = dict(item)
                copied["title"] = f"Project stack note: {item['title']}"
                copied["summary"] = f"Relevant to the detected project stack: {item['summary']}"
                copied["memory_domain"] = "Project Brain"
                copied["tags"] = list(dict.fromkeys([*copied.get("tags", []), "project-specific"]))
                project_items.append(copied)
        return self._stamp_items([*items, *project_items])

    def _stamp_items(self, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        freshness_date = utc_now()
        expires_at = _expires()
        stamped = []
        for item in items:
            copied = dict(item)
            copied.setdefault("source_type", "official_or_trusted_public")
            copied.setdefault("confidence_level", "high")
            copied["freshness_date"] = freshness_date
            copied["expires_at"] = expires_at
            stamped.append(copied)
        return stamped


intelligence_source_service = IntelligenceSourceService()
