from __future__ import annotations

import httpx

from config import settings


class OllamaService:
    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")

    async def is_running(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=2.5) as client:
                response = await client.get(f"{self.base_url}/api/tags")
            return response.status_code == 200
        except httpx.HTTPError:
            return False

    async def list_models(self) -> list[dict]:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/api/tags")
            response.raise_for_status()
            return response.json().get("models", [])
        except httpx.HTTPError:
            return []

    async def chat(self, model: str, messages: list[dict[str, str]]) -> str:
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "keep_alive": settings.ollama_keep_alive,
            "options": {"num_ctx": settings.ollama_num_ctx},
        }
        try:
            async with httpx.AsyncClient(timeout=90) as client:
                response = await client.post(f"{self.base_url}/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("message", {}).get("content", "")
        except httpx.TimeoutException as exc:
            raise RuntimeError("The selected local model timed out while using Ollama chat.") from exc
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(f"Ollama chat returned HTTP {exc.response.status_code}.") from exc
        except httpx.HTTPError as exc:
            raise RuntimeError(f"Ollama chat request failed: {exc}") from exc

    async def generate(self, model: str, prompt: str, timeout: float = 90, num_predict: int = 450) -> str:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "keep_alive": settings.ollama_keep_alive,
            "options": {
                "num_predict": num_predict,
                "num_ctx": settings.ollama_num_ctx,
            },
        }
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(f"{self.base_url}/api/generate", json=payload)
            response.raise_for_status()
            return response.json().get("response", "")
        except httpx.TimeoutException as exc:
            raise RuntimeError("The selected local model timed out while generating a response.") from exc
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(f"Ollama generate returned HTTP {exc.response.status_code}.") from exc
        except httpx.HTTPError as exc:
            raise RuntimeError(f"Ollama generate request failed: {exc}") from exc

    async def complete(self, model: str, system: str, user: str, response_length: str = "balanced") -> str:
        num_predict = {"brief": 180, "balanced": 420, "detailed": 800}.get(response_length, 420)
        # CPU-only, GPU-less machines generate a few tokens/sec, so the earlier
        # 5/12/30s limits cut off almost every real answer. Give the model room.
        timeout = {"brief": 45, "balanced": 120, "detailed": 240}.get(response_length, 120)
        prompt = f"System instructions:\n{system}\n\nUser context and request:\n{user}\n\nSentinel Core response:"
        return await self.generate(model, prompt, timeout=timeout, num_predict=num_predict)

    async def pull(self, model: str) -> dict:
        payload = {"model": model, "stream": False}
        async with httpx.AsyncClient(timeout=900) as client:
            response = await client.post(f"{self.base_url}/api/pull", json=payload)
        response.raise_for_status()
        return response.json()


ollama_service = OllamaService()
