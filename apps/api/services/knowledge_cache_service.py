from __future__ import annotations

from typing import Any

from services.activity_service import activity_service
from storage.db import db


class KnowledgeCacheService:
    def save_item(self, item: dict[str, Any], related_project_id: str | None = None) -> tuple[dict[str, Any], bool]:
        saved, updated = db.upsert_intelligence_item(
            title=item["title"],
            summary=item.get("summary", ""),
            content=item.get("content", item.get("summary", "")),
            category=item.get("category", "official_documentation"),
            memory_domain=item.get("memory_domain", "Research Brain"),
            source_type=item.get("source_type", "official_or_trusted_public"),
            source_url=item.get("source_url", ""),
            source_name=item.get("source_name", "Public source"),
            confidence_level=item.get("confidence_level", "medium"),
            freshness_date=item.get("freshness_date", ""),
            expires_at=item.get("expires_at"),
            tags=item.get("tags", []),
            related_project_id=related_project_id or item.get("related_project_id"),
        )
        activity_service.log(
            related_project_id or item.get("related_project_id"),
            "intelligence_item_saved",
            "Intelligence item saved",
            saved.get("title", ""),
            "success",
            {"item_id": saved.get("id"), "updated": updated, "memory_domain": saved.get("memory_domain")},
        )
        return saved, updated

    def get_item(self, item_id: str, mark_used: bool = False) -> dict[str, Any] | None:
        return db.get_intelligence_item(item_id, mark_used=mark_used)

    def list_items(
        self,
        query: str | None = None,
        category: str | None = None,
        source_type: str | None = None,
        memory_domain: str | None = None,
        freshness: str | None = None,
        project_id: str | None = None,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        return db.list_intelligence_items(query, category, source_type, memory_domain, project_id, freshness, limit)

    def search(self, query: str, project_id: str | None = None, limit: int = 8) -> list[dict[str, Any]]:
        matches = db.list_intelligence_items(query=query, project_id=project_id, limit=limit)
        for item in matches[:limit]:
            db.get_intelligence_item(item["id"], mark_used=True)
        return matches

    def delete_item(self, item_id: str) -> None:
        item = db.get_intelligence_item(item_id)
        db.delete_intelligence_item(item_id)
        activity_service.log(
            item.get("related_project_id") if item else None,
            "intelligence_item_deleted",
            "Intelligence item deleted",
            item.get("title", item_id) if item else item_id,
            "warning",
            {"item_id": item_id},
        )

    def clear_cache(self) -> int:
        count = db.clear_intelligence_cache()
        activity_service.log(
            None,
            "intelligence_cache_cleared",
            "User cleared intelligence cache",
            f"Removed {count} cached intelligence items.",
            "warning",
            {"removed": count},
        )
        return count

    def stats(self) -> dict[str, Any]:
        items = db.list_intelligence_items(limit=250)
        domains: dict[str, int] = {}
        categories: dict[str, int] = {}
        stale = 0
        from storage.db import utc_now

        now = utc_now()
        for item in items:
            domains[item.get("memory_domain") or "Unclassified"] = domains.get(item.get("memory_domain") or "Unclassified", 0) + 1
            categories[item.get("category") or "uncategorized"] = categories.get(item.get("category") or "uncategorized", 0) + 1
            expires_at = item.get("expires_at")
            if expires_at and expires_at < now:
                stale += 1
        return {
            "total_items": db.count_intelligence_items(),
            "domains": domains,
            "categories": categories,
            "stale_items": stale,
            "last_refresh": db.last_successful_intelligence_refresh(),
        }


knowledge_cache_service = KnowledgeCacheService()
