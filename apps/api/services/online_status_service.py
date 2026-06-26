from __future__ import annotations

import socket
from typing import Any

import httpx

from services.activity_service import activity_service
from storage.db import utc_now


class OnlineStatusService:
    def __init__(self) -> None:
        self._last_status: dict[str, Any] | None = None

    async def check(self, log: bool = True) -> dict[str, Any]:
        checked_at = utc_now()
        status = {
            "online": False,
            "checked_at": checked_at,
            "method": "https_head",
            "latency_ms": None,
            "message": "Internet connectivity was not confirmed.",
        }
        try:
            import time

            start = time.perf_counter()
            async with httpx.AsyncClient(timeout=2.5, follow_redirects=True) as client:
                response = await client.head("https://www.python.org/")
            latency_ms = int((time.perf_counter() - start) * 1000)
            if response.status_code < 500:
                status.update(
                    {
                        "online": True,
                        "latency_ms": latency_ms,
                        "message": "Internet connectivity confirmed with a public documentation host.",
                    }
                )
        except Exception:
            status = self._socket_fallback(checked_at)

        self._last_status = status
        if log:
            activity_service.log(
                None,
                "intelligence_online_status_checked",
                "Online status checked",
                status["message"],
                "success" if status["online"] else "warning",
                {"online": status["online"], "method": status["method"]},
            )
        return status

    def cached_status(self) -> dict[str, Any] | None:
        return self._last_status

    def _socket_fallback(self, checked_at: str) -> dict[str, Any]:
        try:
            import time

            start = time.perf_counter()
            with socket.create_connection(("1.1.1.1", 443), timeout=1.5):
                latency_ms = int((time.perf_counter() - start) * 1000)
            return {
                "online": True,
                "checked_at": checked_at,
                "method": "tcp_connect",
                "latency_ms": latency_ms,
                "message": "Internet connectivity confirmed with a short TCP check.",
            }
        except OSError:
            return {
                "online": False,
                "checked_at": checked_at,
                "method": "tcp_connect",
                "latency_ms": None,
                "message": "Internet connectivity was not confirmed.",
            }


online_status_service = OnlineStatusService()
