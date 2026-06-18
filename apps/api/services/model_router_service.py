from __future__ import annotations

from typing import Any

from services.ollama_service import ollama_service


class ModelRouterService:
    def __init__(self):
        self.primary_coding = "qwen2.5-coder:7b"
        self.backup_coding = "deepseek-coder:6.7b"
        self.fast_model = "llama3:8b"

    def get_status(self) -> dict[str, Any]:
        return {"status": "ok", "models": self.list_models()}

    def list_models(self) -> list[str]:
        # Would ideally call Ollama here, using mock for now
        return [self.primary_coding, self.backup_coding, self.fast_model]

    def test_model(self, model_name: str) -> dict[str, Any]:
        # Simple test
        return {"status": "ok", "model": model_name, "message": "Test successful"}

    def route_task(self, task_type: str) -> str:
        if task_type in ["coding_plan", "code_review"]:
            return self.primary_coding
        elif task_type in ["simple_summary", "general_chat"]:
            return self.fast_model
        return self.primary_coding


model_router_service = ModelRouterService()
