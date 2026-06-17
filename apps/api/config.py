from __future__ import annotations

import os
from pathlib import Path
from pydantic import BaseModel


ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "data"
PROJECTS_DIR = DATA_DIR / "projects"
VECTOR_STORE_DIR = DATA_DIR / "vector_store"
SQLITE_DIR = DATA_DIR / "sqlite"


class AppSettings(BaseModel):
    app_name: str = "LocalSentinel AI"
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    safe_mode: bool = True
    voice_mode: bool = True
    rag_enabled: bool = True
    auto_index: bool = False
    auto_install_models: bool = False
    online_docs: bool = False
    max_scan_files: int = 800
    max_file_bytes: int = 400_000


settings = AppSettings()


def ensure_data_dirs() -> None:
    for path in (DATA_DIR, PROJECTS_DIR, VECTOR_STORE_DIR, SQLITE_DIR):
        path.mkdir(parents=True, exist_ok=True)

