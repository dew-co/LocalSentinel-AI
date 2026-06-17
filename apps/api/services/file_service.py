from __future__ import annotations

import hashlib
from pathlib import Path

IGNORED_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".nuxt",
    ".venv",
    "venv",
    "env",
    "__pycache__",
    ".cache",
    ".pytest_cache",
    ".mypy_cache",
}

TEXT_EXTENSIONS = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".md",
    ".json",
    ".html",
    ".css",
    ".scss",
    ".env.example",
    ".txt",
    ".yml",
    ".yaml",
}

SECRET_NAMES = {".env", "id_rsa", "id_dsa", "id_ed25519", "secrets.json", "credentials.json"}


def project_id_from_path(path: str | Path) -> str:
    resolved = str(Path(path).expanduser().resolve())
    digest = hashlib.sha1(resolved.encode("utf-8")).hexdigest()[:12]
    return f"local-{digest}"


def safe_project_name(name: str) -> str:
    return "".join(ch for ch in name.strip() if ch.isalnum() or ch in ("-", "_", " ")).strip().replace(" ", "-")


def is_ignored_path(path: Path) -> bool:
    parts = set(path.parts)
    return bool(parts & IGNORED_DIRS)


def is_text_indexable(path: Path) -> bool:
    if path.name in SECRET_NAMES:
        return False
    if path.suffix in TEXT_EXTENSIONS:
        return True
    return path.name == ".env.example"


def read_text_safe(path: Path, max_bytes: int = 400_000) -> str:
    if not path.exists() or not path.is_file() or path.stat().st_size > max_bytes:
        return ""
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def walk_file_tree(root: Path, max_files: int = 800, max_depth: int = 7) -> list[str]:
    root = root.expanduser().resolve()
    output: list[str] = []
    if not root.exists():
        return output
    count = 0
    for path in sorted(root.rglob("*")):
        if count >= max_files:
            output.append("... scan limit reached")
            break
        rel = path.relative_to(root)
        if is_ignored_path(rel):
            continue
        if len(rel.parts) > max_depth:
            continue
        output.append(f"{rel.as_posix()}/" if path.is_dir() else rel.as_posix())
        count += 1
    return output


def ensure_inside(base: Path, candidate: Path) -> Path:
    base_resolved = base.expanduser().resolve()
    target = candidate.expanduser().resolve()
    if base_resolved != target and base_resolved not in target.parents:
        raise ValueError(f"Path is outside project root: {target}")
    return target

