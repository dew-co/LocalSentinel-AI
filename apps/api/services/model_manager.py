from __future__ import annotations

from typing import Any

from config import settings
from services.ollama_service import ollama_service
from storage.db import db


class ModelManager:
    def recommend_model(self) -> str:
        try:
            import psutil

            ram_gb = psutil.virtual_memory().total / (1024**3)
        except Exception:
            ram_gb = 8

        if ram_gb < 8:
            return "qwen2.5-coder:1.5b"
        if ram_gb < 16:
            return "qwen2.5-coder:7b"
        return "qwen3-coder:latest"

    async def status(self) -> dict[str, Any]:
        running = await ollama_service.is_running()
        models = await ollama_service.list_models() if running else []
        active = db.get_setting("active_model")
        return {
            "ollamaRunning": running,
            "baseUrl": settings.ollama_base_url,
            "activeModel": active,
            "availableCount": len(models),
            "recommendedModel": self.recommend_model(),
            "message": "Ollama is running." if running else "Ollama is not reachable. Start Ollama locally and try again.",
        }

    async def available(self) -> list[dict[str, Any]]:
        models = await ollama_service.list_models()
        return [
            {
                "name": item.get("name") or item.get("model", ""),
                "size": item.get("size"),
                "modifiedAt": item.get("modified_at"),
            }
            for item in models
        ]

    async def select(self, model: str) -> dict[str, Any]:
        db.set_setting("active_model", model)
        try:
            from services.adaptive_memory_service import adaptive_memory_service

            adaptive_memory_service.record_signal(None, "selected_models", "selected_models", model, weight=1)
        except Exception:
            pass
        return {"activeModel": model, "message": f"Active model set to {model}"}

    async def pull(self, model: str, approved: bool) -> dict[str, Any]:
        if not approved:
            return {
                "requiresApproval": True,
                "command": f"ollama pull {model}",
                "message": "Model download requires approval.",
            }
        if not await ollama_service.is_running():
            return {"requiresApproval": False, "result": None, "message": "Ollama is not running. Start Ollama before pulling models."}
        try:
            result = await ollama_service.pull(model)
            return {"requiresApproval": False, "result": result, "message": f"Pull requested for {model}"}
        except Exception as exc:
            return {"requiresApproval": False, "result": None, "message": f"Model pull failed: {exc}"}

    async def test(self, model: str | None, prompt: str) -> dict[str, Any]:
        selected = model or db.get_setting("active_model")
        if not selected:
            return {"ok": False, "model": None, "response": "", "message": "Select a model first."}
        if not await ollama_service.is_running():
            return {"ok": False, "model": selected, "response": "", "message": "Ollama is not running."}
        try:
            response = await ollama_service.generate(selected, prompt)
            return {"ok": True, "model": selected, "response": response.strip(), "message": "Model responded."}
        except Exception as exc:
            return {"ok": False, "model": selected, "response": "", "message": f"Model test failed: {exc}"}


model_manager = ModelManager()
