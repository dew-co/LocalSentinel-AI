from __future__ import annotations

import re
from typing import Any

from services.activity_service import activity_service
from storage.db import db


SENSITIVE_PATTERN = re.compile(
    r"(password|passwd|token|secret|api[_-]?key|private[_-]?key|credential|authorization|bearer|ssh-rsa|BEGIN (RSA|OPENSSH|PRIVATE) KEY)",
    re.IGNORECASE,
)


class AdaptiveMemoryService:
    def enabled(self) -> bool:
        return bool(db.get_consent_settings().get("adaptive_memory_enabled", False))

    def record_signal(
        self,
        project_id: str | None,
        activity_type: str,
        signal_key: str,
        signal_value: str,
        weight: float = 1,
        metadata: dict[str, Any] | None = None,
        force: bool = False,
    ) -> dict[str, Any]:
        if not force and not self.enabled():
            return {"stored": False, "reason": "Adaptive memory is disabled."}
        if self._looks_sensitive(signal_key) or self._looks_sensitive(signal_value):
            return {"stored": False, "reason": "Signal looked sensitive and was not stored."}

        signal = db.add_user_activity_signal(project_id, activity_type, signal_key, signal_value[:500], weight, metadata)
        learned = self._learn_preference(activity_type, signal_key, signal_value, weight)
        activity_service.log(
            project_id,
            "adaptive_preference_learned" if learned else "adaptive_signal_recorded",
            "Adaptive preference learned" if learned else "Adaptive signal recorded",
            f"{signal_key}: {signal_value[:120]}",
            "success" if learned else "info",
            {"activity_type": activity_type, "signal_key": signal_key},
        )
        return {"stored": True, "signal": signal, "preference": learned}

    def preferences(self) -> list[dict[str, Any]]:
        return db.list_adaptive_preferences()

    def delete_preference(self, preference_id: str) -> None:
        db.delete_adaptive_preference(preference_id)
        activity_service.log(None, "adaptive_preference_deleted", "Adaptive preference deleted", preference_id, "warning", {"preference_id": preference_id})

    def _learn_preference(self, activity_type: str, signal_key: str, signal_value: str, weight: float) -> dict[str, Any] | None:
        normalized = signal_value.strip()
        if not normalized:
            return None

        key_map = {
            "accepted_ai_suggestions": "accepted_decisions",
            "rejected_ai_suggestions": "rejected_suggestions",
            "preferred_frameworks": "preferred_frameworks",
            "preferred_databases": "preferred_databases",
            "common_project_types": "common_project_types",
            "selected_models": "selected_models",
            "approved_actions": "approved_actions",
            "frequently_used_projects": "frequently_used_projects",
            "common_errors": "common_errors",
            "repeated_prompts": "repeated_prompts",
        }
        preference_key = key_map.get(activity_type) or key_map.get(signal_key)
        if not preference_key:
            return None
        return db.upsert_adaptive_preference(preference_key, normalized[:240], min(0.35, max(0.05, weight * 0.1)), activity_type)

    def _looks_sensitive(self, value: str) -> bool:
        return bool(SENSITIVE_PATTERN.search(value or ""))


adaptive_memory_service = AdaptiveMemoryService()
