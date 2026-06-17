from __future__ import annotations

import hashlib
import json
import math
import re
from collections import Counter
from pathlib import Path
from typing import Any

from config import VECTOR_STORE_DIR, settings
from services.file_service import is_ignored_path, is_text_indexable, project_id_from_path, read_text_safe
from storage.db import db


TOKEN_PATTERN = re.compile(r"[A-Za-z0-9_./-]+")


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_PATTERN.findall(text) if len(token) > 1]


def chunk_text(text: str, size: int = 1400, overlap: int = 180) -> list[str]:
    chunks: list[str] = []
    start = 0
    while start < len(text):
        chunk = text[start : start + size].strip()
        if chunk:
            chunks.append(chunk)
        start += max(1, size - overlap)
    return chunks


def cosine(a: Counter, b: Counter) -> float:
    if not a or not b:
        return 0.0
    common = set(a) & set(b)
    dot = sum(a[key] * b[key] for key in common)
    norm_a = math.sqrt(sum(value * value for value in a.values()))
    norm_b = math.sqrt(sum(value * value for value in b.values()))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0


class RagService:
    def __init__(self) -> None:
        VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
        self.chroma_dir = VECTOR_STORE_DIR / "chroma"

    def resolve_project(self, project_id: str | None, path: str | None = None) -> tuple[str, Path]:
        if project_id:
            project = db.get_project(project_id)
            if project:
                return project_id, Path(project["path"])
        if not path:
            raise ValueError("Provide either projectId or path.")
        root = Path(path).expanduser().resolve()
        return project_id_from_path(root), root

    def index(self, project_id: str | None, path: str | None = None) -> dict[str, Any]:
        resolved_id, root = self.resolve_project(project_id, path)
        if not root.exists() or not root.is_dir():
            raise FileNotFoundError(f"Project path not found: {root}")

        chunks: list[dict[str, Any]] = []
        for file_path in sorted(root.rglob("*")):
            rel = file_path.relative_to(root)
            if is_ignored_path(rel) or not file_path.is_file() or not is_text_indexable(file_path):
                continue
            text = read_text_safe(file_path, max_bytes=settings.max_file_bytes)
            if not text.strip():
                continue
            for index, chunk in enumerate(chunk_text(text)):
                chunks.append(
                    {
                        "id": f"{resolved_id}:{rel.as_posix()}:{index}",
                        "projectId": resolved_id,
                        "filePath": rel.as_posix(),
                        "text": chunk,
                    }
                )

        store_path = self.store_path(resolved_id)
        store_path.write_text(json.dumps({"projectId": resolved_id, "root": str(root), "chunks": chunks}, indent=2), encoding="utf-8")
        chroma_enabled = self.try_index_chroma(resolved_id, chunks)

        project = db.get_project(resolved_id)
        if not project:
            db.upsert_project(resolved_id, root.name, str(root), stack=[], summary=f"Indexed {len(chunks)} chunks.")

        return {
            "projectId": resolved_id,
            "path": str(root),
            "chunksIndexed": len(chunks),
            "store": str(store_path),
            "chromaEnabled": chroma_enabled,
        }

    def query(self, query: str, project_id: str | None = None, top_k: int = 5) -> list[dict[str, Any]]:
        chroma_results = self.try_query_chroma(query, project_id, top_k)
        if chroma_results:
            return chroma_results

        stores = [self.store_path(project_id)] if project_id else sorted(VECTOR_STORE_DIR.glob("rag-*.json"))
        query_vec = Counter(tokenize(query))
        results: list[dict[str, Any]] = []
        for store in stores:
            if not store or not store.exists():
                continue
            data = json.loads(store.read_text(encoding="utf-8"))
            for chunk in data.get("chunks", []):
                score = cosine(query_vec, Counter(tokenize(chunk["text"])))
                if score > 0:
                    results.append(
                        {
                            "projectId": chunk["projectId"],
                            "filePath": chunk["filePath"],
                            "score": round(score, 4),
                            "preview": chunk["text"][:700],
                            "text": chunk["text"],
                        }
                    )
        results.sort(key=lambda item: item["score"], reverse=True)
        return results[: max(1, min(top_k, 12))]

    def status(self) -> dict[str, Any]:
        projects = []
        total_chunks = 0
        for store in sorted(VECTOR_STORE_DIR.glob("rag-*.json")):
            try:
                data = json.loads(store.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            count = len(data.get("chunks", []))
            total_chunks += count
            projects.append({"projectId": data.get("projectId"), "root": data.get("root"), "chunks": count})
        return {
            "enabled": settings.rag_enabled,
            "projects": projects,
            "totalChunks": total_chunks,
            "chromaPath": str(self.chroma_dir),
        }

    def add_memory(self, project_id: str, content: str, tags: list[str] | None = None) -> dict[str, Any]:
        return db.add_memory(project_id, content, tags)

    def list_memory(self, project_id: str | None = None) -> list[dict[str, Any]]:
        return db.list_memory(project_id, limit=100)

    def store_path(self, project_id: str | None) -> Path:
        if not project_id:
            raise ValueError("projectId is required for a specific RAG store.")
        safe = re.sub(r"[^A-Za-z0-9_.-]", "_", project_id)
        return VECTOR_STORE_DIR / f"rag-{safe}.json"

    def chroma_collection_name(self, project_id: str) -> str:
        digest = hashlib.sha1(project_id.encode("utf-8")).hexdigest()[:20]
        return f"localsentinel_{digest}"

    def embedding(self, text: str, dimensions: int = 384) -> list[float]:
        vector = [0.0] * dimensions
        for token in tokenize(text):
            digest = hashlib.sha1(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % dimensions
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vector[index] += sign
        norm = math.sqrt(sum(value * value for value in vector)) or 1.0
        return [value / norm for value in vector]

    def try_index_chroma(self, project_id: str, chunks: list[dict[str, Any]]) -> bool:
        try:
            import chromadb

            client = chromadb.PersistentClient(path=str(self.chroma_dir))
            collection = client.get_or_create_collection(name=self.chroma_collection_name(project_id))
            ids = [chunk["id"] for chunk in chunks]
            if not ids:
                return True
            for start in range(0, len(chunks), 100):
                batch = chunks[start : start + 100]
                collection.upsert(
                    ids=[chunk["id"] for chunk in batch],
                    documents=[chunk["text"] for chunk in batch],
                    metadatas=[{"projectId": project_id, "filePath": chunk["filePath"]} for chunk in batch],
                    embeddings=[self.embedding(chunk["text"]) for chunk in batch],
                )
            return True
        except Exception:
            return False

    def try_query_chroma(self, query: str, project_id: str | None, top_k: int) -> list[dict[str, Any]]:
        if not project_id:
            return []
        try:
            import chromadb

            client = chromadb.PersistentClient(path=str(self.chroma_dir))
            collection = client.get_collection(name=self.chroma_collection_name(project_id))
            result = collection.query(query_embeddings=[self.embedding(query)], n_results=max(1, min(top_k, 12)))
            documents = result.get("documents", [[]])[0]
            metadatas = result.get("metadatas", [[]])[0]
            distances = result.get("distances", [[]])[0]
            output: list[dict[str, Any]] = []
            for document, metadata, distance in zip(documents, metadatas, distances):
                output.append(
                    {
                        "projectId": metadata.get("projectId", project_id),
                        "filePath": metadata.get("filePath", ""),
                        "score": round(1 / (1 + float(distance)), 4),
                        "preview": document[:700],
                        "text": document,
                    }
                )
            return output
        except Exception:
            return []


rag_service = RagService()
