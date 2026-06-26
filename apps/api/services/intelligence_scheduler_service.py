from __future__ import annotations

from typing import Any

from storage.db import db


class IntelligenceSchedulerService:
    def settings(self) -> dict[str, Any]:
        consent = db.get_consent_settings()
        return {
            "scheduled_refresh_enabled": bool(consent.get("scheduled_refresh_enabled", False)),
            "refresh_frequency": consent.get("refresh_frequency", "manual"),
            "mode": "manual" if not consent.get("scheduled_refresh_enabled", False) else consent.get("refresh_frequency", "manual"),
            "mvp_note": "Manual refresh is implemented. Scheduled daily/weekly/monthly refresh is stored but not run in the background yet.",
        }

    def update(self, scheduled_refresh_enabled: bool, refresh_frequency: str) -> dict[str, Any]:
        allowed = {"manual", "daily", "weekly", "monthly"}
        frequency = refresh_frequency if refresh_frequency in allowed else "manual"
        db.patch_consent_settings(
            {
                "scheduled_refresh_enabled": bool(scheduled_refresh_enabled and frequency != "manual"),
                "refresh_frequency": frequency,
            }
        )
        return self.settings()


intelligence_scheduler_service = IntelligenceSchedulerService()
