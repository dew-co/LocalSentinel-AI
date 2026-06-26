from __future__ import annotations

import re
from typing import Any

from services.activity_service import activity_service
from services.adaptive_memory_service import adaptive_memory_service
from services.intelligence_source_service import SOURCE_CATEGORIES, intelligence_source_service
from services.knowledge_cache_service import knowledge_cache_service
from services.online_status_service import online_status_service
from services.system_intelligence_service import system_intelligence_service
from storage.db import db, utc_now


MEMORY_DOMAINS = [
    "Project Brain",
    "User Work Brain",
    "System Brain",
    "Research Brain",
    "Interaction Brain",
    "Model Brain",
    "Package Brain",
    "Framework Brain",
    "Error Solution Brain",
]


DEFAULT_CONSENT_SETTINGS: dict[str, Any] = {
    "online_intelligence_enabled": False,
    "first_run_completed": False,
    "system_scan_allowed": False,
    "project_scan_allowed": False,
    "adaptive_memory_enabled": False,
    "scheduled_refresh_enabled": False,
    "refresh_frequency": "manual",
    "allowed_sources": SOURCE_CATEGORIES,
    "offline_cache_enabled": True,
}


TECH_TERMS = {
    "ollama",
    "qwen",
    "deepseek",
    "embedding",
    "embeddings",
    "rag",
    "react",
    "typescript",
    "vite",
    "tailwind",
    "fastapi",
    "python",
    "node",
    "docker",
    "firebase",
    "supabase",
    "mongodb",
    "postgres",
    "postgresql",
    "cors",
    "api",
    "security",
    "deployment",
}


class IntelligenceEngineService:
    def permissions(self) -> dict[str, Any]:
        values = db.get_consent_settings(DEFAULT_CONSENT_SETTINGS)
        if not isinstance(values.get("allowed_sources"), list):
            values["allowed_sources"] = SOURCE_CATEGORIES
        return values

    async def check_online_status(self) -> dict[str, Any]:
        return await online_status_service.check()

    def onboarding_status(self) -> dict[str, Any]:
        permissions = self.permissions()
        return {
            "first_run_completed": bool(permissions.get("first_run_completed")),
            "permissions": permissions,
            "defaults": DEFAULT_CONSENT_SETTINGS,
        }

    async def run_first_time_bootstrap(self, permissions: dict[str, Any]) -> dict[str, Any]:
        safe_permissions = self._sanitize_permissions(permissions)
        safe_permissions["first_run_completed"] = True
        db.patch_consent_settings(safe_permissions)
        intelligence_source_service.seed_sources(safe_permissions.get("allowed_sources"))
        activity_service.log(
            None,
            "intelligence_onboarding_completed",
            "First-time setup completed",
            "User completed LocalSentinel Intelligence setup.",
            "success",
            safe_permissions,
        )

        system_scan = None
        refresh = None
        if safe_permissions.get("system_scan_allowed"):
            system_scan = system_intelligence_service.scan_tools()
            self.save_system_scan_item(system_scan)
        if safe_permissions.get("online_intelligence_enabled"):
            refresh = await self.run_manual_intelligence_update(triggered_by="onboarding")

        return {
            "status": "ok",
            "permissions": self.permissions(),
            "system_scan": system_scan,
            "refresh": refresh,
        }

    def skip_onboarding(self) -> dict[str, Any]:
        db.patch_consent_settings({"first_run_completed": True})
        activity_service.log(
            None,
            "intelligence_onboarding_skipped",
            "First-time setup skipped",
            "User skipped LocalSentinel Intelligence setup. Online intelligence remains disabled.",
            "warning",
            {"online_intelligence_enabled": False},
        )
        return {"status": "ok", "permissions": self.permissions()}

    def update_permissions(self, values: dict[str, Any]) -> dict[str, Any]:
        before = self.permissions()
        safe_values = self._sanitize_permissions(values, partial=True)
        updated = db.patch_consent_settings(safe_values)
        if before.get("online_intelligence_enabled") and safe_values.get("online_intelligence_enabled") is False:
            activity_service.log(None, "online_intelligence_disabled", "User disabled online intelligence", "", "warning", {})
        if before.get("adaptive_memory_enabled") and safe_values.get("adaptive_memory_enabled") is False:
            activity_service.log(None, "adaptive_memory_disabled", "User disabled adaptive memory", "", "warning", {})
        if safe_values:
            activity_service.log(None, "intelligence_permissions_updated", "Intelligence permissions updated", "", "info", safe_values)
        return {**DEFAULT_CONSENT_SETTINGS, **updated}

    async def run_manual_intelligence_update(self, triggered_by: str = "user", project_id: str | None = None) -> dict[str, Any]:
        permissions = self.permissions()
        run = db.create_intelligence_refresh_run("manual", "running", triggered_by)
        activity_service.log(project_id, "intelligence_refresh_started", "Intelligence refresh started", "Manual refresh requested.", "info", {"triggered_by": triggered_by})

        errors: list[str] = []
        if not permissions.get("offline_cache_enabled", True):
            errors.append("Offline cache is disabled.")
        if not permissions.get("online_intelligence_enabled", False):
            errors.append("Online intelligence is disabled. Enable it in Intelligence Center permissions before refreshing.")

        online = await online_status_service.check(log=True)
        if not online.get("online"):
            errors.append("Internet connectivity was not confirmed.")

        if errors:
            completed = db.complete_intelligence_refresh_run(run["id"], "blocked", 0, 0, 0, errors)
            activity_service.log(project_id, "intelligence_refresh_blocked", "Intelligence refresh blocked", "; ".join(errors), "warning", {"run_id": run["id"]})
            return {"status": "blocked", "run": completed, "errors": errors, "online": online}

        allowed_sources = self._allowed_sources(permissions.get("allowed_sources"))
        intelligence_source_service.seed_sources(allowed_sources)
        project_stack = self._project_stack(project_id) if project_id and permissions.get("project_scan_allowed", False) else None
        templates = intelligence_source_service.knowledge_templates(allowed_sources, project_stack)

        saved = 0
        updated = 0
        for template in templates:
            classified = self.classify_knowledge_item(template)
            item, was_updated = self.save_intelligence_item(classified, project_id if template.get("memory_domain") == "Project Brain" else None)
            self.update_rag_index(item)
            if was_updated:
                updated += 1
            else:
                saved += 1

        if permissions.get("system_scan_allowed", False):
            try:
                tools = system_intelligence_service.scan_tools()
                item = self.save_system_scan_item(tools)
                saved += 0 if item.get("updated") else 1
                updated += 1 if item.get("updated") else 0
            except Exception as exc:
                errors.append(f"System scan failed: {exc}")

        status = "completed" if not errors else "completed_with_warnings"
        completed = db.complete_intelligence_refresh_run(run["id"], status, len(templates), saved, updated, errors)
        activity_service.log(
            project_id,
            "intelligence_cache_updated",
            "Cache updated",
            f"Saved {saved} items and updated {updated} items.",
            "success" if not errors else "warning",
            {"run_id": run["id"], "saved": saved, "updated": updated, "errors": errors},
        )
        return {"status": status, "run": completed, "saved": saved, "updated": updated, "errors": errors, "online": online}

    def classify_knowledge_item(self, item: dict[str, Any]) -> dict[str, Any]:
        if item.get("memory_domain") in MEMORY_DOMAINS:
            return item
        category = item.get("category", "")
        domain = "Research Brain"
        if "model" in category:
            domain = "Model Brain"
        elif "error" in category:
            domain = "Error Solution Brain"
        elif "package" in category:
            domain = "Package Brain"
        elif "framework" in category or category in {"frontend_guides", "backend_guides"}:
            domain = "Framework Brain"
        elif "security" in category or "deployment" in category:
            domain = "Research Brain"
        item["memory_domain"] = domain
        return item

    def save_intelligence_item(self, item: dict[str, Any], project_id: str | None = None) -> tuple[dict[str, Any], bool]:
        return knowledge_cache_service.save_item(item, related_project_id=project_id)

    def save_manual_intelligence_item(self, item: dict[str, Any]) -> dict[str, Any]:
        permissions = self.permissions()
        if not permissions.get("offline_cache_enabled", True):
            raise ValueError("Offline cache is disabled.")
        prepared = self.classify_knowledge_item(
            {
                **item,
                "source_type": item.get("source_type", "manual_research"),
                "source_name": item.get("source_name", "Research Center"),
                "source_url": item.get("source_url", "local://research-center"),
                "confidence_level": item.get("confidence_level", "user_saved"),
                "freshness_date": item.get("freshness_date", utc_now()),
                "tags": item.get("tags", ["manual", "research"]),
            }
        )
        saved, _ = knowledge_cache_service.save_item(prepared, related_project_id=item.get("related_project_id"))
        return saved

    def update_rag_index(self, item: dict[str, Any]) -> None:
        if item.get("related_project_id"):
            try:
                existing = db.list_memory_items(item["related_project_id"], "intelligence", limit=500)
                if any(entry.get("title") == item.get("title") and entry.get("source") == item.get("source_url") for entry in existing):
                    return
                db.add_memory_item(
                    item["related_project_id"],
                    "intelligence",
                    item.get("title", "Cached intelligence"),
                    item.get("summary") or item.get("content", ""),
                    source=item.get("source_url"),
                    tags=item.get("tags", []),
                    importance=2,
                )
            except Exception:
                pass

    def get_offline_context_for_prompt(self, prompt: str, project_id: str | None = None, limit: int = 5) -> dict[str, Any]:
        permissions = self.permissions()
        if not permissions.get("offline_cache_enabled", True):
            return {"enabled": False, "items": [], "context": "", "last_updated": None}
        items = self._search_broad(prompt, project_id, limit=limit)
        if not items:
            return {"enabled": True, "items": [], "context": "", "last_updated": db.last_successful_intelligence_refresh()}
        lines = []
        for item in items:
            lines.append(
                f"- {item['title']} [{item.get('memory_domain', 'Research Brain')}] "
                f"(source: {item.get('source_name') or item.get('source_url')}, updated: {item.get('freshness_date')}): "
                f"{item.get('summary') or item.get('content', '')}"
            )
        return {
            "enabled": True,
            "items": items,
            "context": "\n".join(lines),
            "last_updated": db.last_successful_intelligence_refresh(),
        }

    async def answer_prompt_if_cached(self, prompt: str, project_id: str | None = None) -> dict[str, Any] | None:
        text = prompt.lower().strip()
        permissions = self.permissions()
        offline_requested = "offline knowledge only" in text or "use offline" in text or "cached intelligence" in text

        if re.search(r"\b(update|refresh)\b.*\b(intelligence|cache|knowledge)\b", text):
            if not permissions.get("online_intelligence_enabled"):
                return {
                    "answer": "Online intelligence is disabled. Enable it in Intelligence Center permissions before I refresh public development knowledge. Your existing local cache remains available for offline use.",
                    "items": [],
                }
            result = await self.run_manual_intelligence_update(triggered_by="sentinelcore", project_id=project_id)
            return {
                "answer": (
                    f"Intelligence refresh {result['status']}. "
                    f"Saved {result.get('saved', 0)} items and updated {result.get('updated', 0)} items. "
                    "No local project code was uploaded."
                ),
                "items": [],
            }

        if "what intelligence" in text or "saved for offline" in text or "what do you know about this project" in text:
            stats = knowledge_cache_service.stats()
            items = db.list_intelligence_items(project_id=project_id, limit=6)
            item_lines = "\n".join(f"- {item['title']} ({item.get('memory_domain')}, updated {item.get('freshness_date')})" for item in items)
            return {
                "answer": (
                    "I have local cached intelligence in these domains: "
                    f"{', '.join(f'{k}: {v}' for k, v in stats['domains'].items()) or 'none yet'}. "
                    f"Total cached items: {stats['total_items']}. Last refresh: {stats['last_refresh'] or 'never'}.\n\n"
                    f"{item_lines or 'No cached intelligence items are saved yet.'}"
                ),
                "items": items,
            }

        if "what knowledge is outdated" in text or "what is outdated" in text or "refresh needed" in text:
            stale = db.list_intelligence_items(freshness="stale", limit=8)
            if not stale:
                return {"answer": "No cached intelligence items are currently marked stale. Manual refresh is still available when online intelligence is enabled.", "items": []}
            lines = "\n".join(f"- {item['title']} expired {item.get('expires_at')}" for item in stale)
            return {"answer": f"These cached intelligence items should be refreshed:\n{lines}", "items": stale}

        if ("ollama" in text and any(term in text for term in ("running", "status", "online", "working"))) or "active model" in text:
            from services.model_manager import model_manager

            model_status = await model_manager.status()
            active = model_status.get("activeModel") or "No active model selected"
            running = "running" if model_status.get("ollamaRunning") else "not reachable"
            return {
                "answer": (
                    f"Ollama is {running}. Active model: {active}. "
                    f"Available local models: {model_status.get('availableCount', 0)}. "
                    f"Recommended model for this machine: {model_status.get('recommendedModel') or 'not available'}."
                ),
                "items": [],
            }

        if "what stack" in text and "project" in text:
            project = db.get_project(project_id) if project_id else None
            if project:
                return {"answer": f"This project is recorded as using: {', '.join(project.get('stack') or ['Unknown'])}. Summary: {project.get('summary') or 'No summary saved.'}", "items": []}

        if "preferred technolog" in text or "preferred tech" in text or "what did you learn from my recent work" in text:
            prefs = adaptive_memory_service.preferences()
            if not prefs:
                return {"answer": "Adaptive memory has no learned preferences yet, or it is disabled. You can enable it in Intelligence Center and delete learned preferences at any time.", "items": []}
            lines = "\n".join(f"- {pref['preference_key']}: {pref['preference_value']} (confidence {pref['confidence']:.2f})" for pref in prefs[:8])
            return {"answer": f"Adaptive memory currently shows:\n{lines}", "items": []}

        if "what do you know about my system" in text or "system intelligence" in text or "tools are installed" in text:
            tools = system_intelligence_service.get_status()
            items = db.list_intelligence_items(memory_domain="System Brain", limit=4)
            installed = [tool["tool_name"] for tool in tools if tool.get("detected")]
            missing = [tool["tool_name"] for tool in tools if not tool.get("detected")]
            return {
                "answer": (
                    f"Local system cache shows installed tools: {', '.join(installed) or 'none scanned yet'}. "
                    f"Missing tools: {', '.join(missing) or 'none recorded'}. "
                    f"Cached System Brain items: {len(items)}. Run a permitted system scan to update this."
                ),
                "items": items,
            }

        if offline_requested or self._looks_like_cacheable_dev_question(text):
            context = self.get_offline_context_for_prompt(prompt, project_id, limit=4)
            items = context["items"]
            if not items:
                return None
            online = online_status_service.cached_status()
            offline_note = "You appear to be offline. " if online and not online.get("online") else ""
            lines = "\n".join(
                f"- {item['title']}: {item.get('summary') or item.get('content', '')} "
                f"(source: {item.get('source_name')}, updated: {item.get('freshness_date')})"
                for item in items
            )
            return {
                "answer": (
                    f"{offline_note}I am using local cached development intelligence. "
                    f"Last successful refresh: {context['last_updated'] or 'never'}.\n\n{lines}"
                ),
                "items": items,
            }

        return None

    def status_payload(self, online: dict[str, Any] | None = None) -> dict[str, Any]:
        permissions = self.permissions()
        stats = knowledge_cache_service.stats()
        return {
            "online": bool(online.get("online")) if online else None,
            "online_status": online,
            "online_intelligence_enabled": bool(permissions.get("online_intelligence_enabled")),
            "offline_cache_ready": bool(permissions.get("offline_cache_enabled") and stats["total_items"] > 0),
            "last_refresh": stats["last_refresh"],
            "cached_items": stats["total_items"],
            "stale_items": stats["stale_items"],
            "memory_domains": stats["domains"],
            "source_categories": stats["categories"],
            "permissions": permissions,
        }

    def save_system_scan_item(self, tools: list[dict[str, Any]]) -> dict[str, Any]:
        installed = [tool["tool_name"] for tool in tools if tool.get("detected")]
        missing = [tool["tool_name"] for tool in tools if not tool.get("detected")]
        item = {
            "title": "Local developer tool scan summary",
            "summary": f"Installed tools: {', '.join(installed) or 'none recorded'}. Missing tools: {', '.join(missing) or 'none recorded'}.",
            "content": "\n".join(
                f"{tool['tool_name']}: {'installed' if tool.get('detected') else 'missing'} {tool.get('version') or ''}".strip()
                for tool in tools
            ),
            "category": "local_system_scan",
            "memory_domain": "System Brain",
            "source_type": "local_system_scan",
            "source_url": "local://system/tools",
            "source_name": "Local system scan",
            "confidence_level": "local_observed",
            "freshness_date": utc_now(),
            "tags": ["system", "tools", "local-only"],
        }
        saved, updated = knowledge_cache_service.save_item(item)
        return {"item": saved, "updated": updated}

    def _allowed_sources(self, value: Any) -> list[str]:
        if isinstance(value, list):
            return [item for item in value if item in SOURCE_CATEGORIES]
        return SOURCE_CATEGORIES

    def _project_stack(self, project_id: str | None) -> list[str] | None:
        if not project_id:
            return None
        project = db.get_project(project_id)
        if not project:
            return None
        return project.get("stack") or []

    def _sanitize_permissions(self, permissions: dict[str, Any], partial: bool = False) -> dict[str, Any]:
        allowed_keys = set(DEFAULT_CONSENT_SETTINGS)
        cleaned: dict[str, Any] = {} if partial else dict(DEFAULT_CONSENT_SETTINGS)
        for key, value in permissions.items():
            if key not in allowed_keys:
                continue
            if key == "refresh_frequency":
                cleaned[key] = value if value in {"manual", "daily", "weekly", "monthly"} else "manual"
            elif key == "allowed_sources":
                cleaned[key] = self._allowed_sources(value)
            else:
                cleaned[key] = bool(value) if isinstance(DEFAULT_CONSENT_SETTINGS[key], bool) else value
        if not partial:
            cleaned["scheduled_refresh_enabled"] = bool(cleaned["scheduled_refresh_enabled"] and cleaned["refresh_frequency"] != "manual")
        elif cleaned.get("refresh_frequency") == "manual":
            cleaned["scheduled_refresh_enabled"] = False
        return cleaned

    def _looks_like_cacheable_dev_question(self, text: str) -> bool:
        words = set(re.findall(r"[a-z0-9_.-]+", text))
        return bool(words & TECH_TERMS) and any(term in text for term in ("best", "setup", "fix", "error", "practice", "recommend", "offline", "cache", "docs", "how"))

    def _search_broad(self, prompt: str, project_id: str | None, limit: int) -> list[dict[str, Any]]:
        direct = knowledge_cache_service.search(prompt, project_id=project_id, limit=limit)
        if direct:
            return direct
        tokens = [token for token in re.findall(r"[A-Za-z0-9_.-]+", prompt.lower()) if len(token) > 2]
        scored: dict[str, tuple[int, dict[str, Any]]] = {}
        for token in tokens[:8]:
            for item in knowledge_cache_service.search(token, project_id=project_id, limit=limit):
                current_score = scored.get(item["id"], (0, item))[0]
                scored[item["id"]] = (current_score + 1, item)
        ranked = [item for _, item in sorted(scored.values(), key=lambda pair: pair[0], reverse=True)]
        return ranked[:limit]


intelligence_engine_service = IntelligenceEngineService()
