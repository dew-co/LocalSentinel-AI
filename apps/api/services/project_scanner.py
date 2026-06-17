from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from config import settings
from services.file_service import project_id_from_path, read_text_safe, walk_file_tree
from storage.db import db


IMPORTANT_FILE_NAMES = {
    "README.md",
    "package.json",
    "requirements.txt",
    "pyproject.toml",
    "vite.config.ts",
    "vite.config.js",
    "next.config.js",
    "tsconfig.json",
    "tailwind.config.js",
    "main.py",
    "app.py",
    "Dockerfile",
}


class ProjectScanner:
    def scan(self, path: str) -> dict[str, Any]:
        root = Path(path).expanduser().resolve()
        if not root.exists() or not root.is_dir():
            raise FileNotFoundError(f"Project path does not exist or is not a directory: {path}")

        file_tree = walk_file_tree(root, max_files=settings.max_scan_files)
        important_files = [item for item in file_tree if Path(item.rstrip("/")).name in IMPORTANT_FILE_NAMES]
        stack = self.detect_stack(root)
        readme = read_text_safe(root / "README.md", max_bytes=80_000)
        summary = self.summarize(root.name, stack, readme, important_files)
        recommendations = self.recommend(root, stack, important_files)
        project_id = project_id_from_path(root)

        db.upsert_project(
            project_id=project_id,
            name=root.name,
            path=str(root),
            stack=stack,
            summary=summary,
        )

        return {
            "projectId": project_id,
            "projectName": root.name,
            "projectPath": str(root),
            "detectedStack": stack,
            "importantFiles": important_files,
            "fileTree": file_tree,
            "summary": summary,
            "recommendations": recommendations,
        }

    def detect_stack(self, root: Path) -> list[str]:
        stack: list[str] = []
        package_json = root / "package.json"
        if package_json.exists():
            stack.extend(["JavaScript"])
            try:
                package = json.loads(read_text_safe(package_json))
                deps = {**package.get("dependencies", {}), **package.get("devDependencies", {})}
                if "react" in deps:
                    stack.append("React")
                if "typescript" in deps:
                    stack.append("TypeScript")
                if "vite" in deps:
                    stack.append("Vite")
                if "next" in deps:
                    stack.append("Next.js")
                if "firebase" in deps:
                    stack.append("Firebase")
            except json.JSONDecodeError:
                pass

        if (root / "requirements.txt").exists() or (root / "pyproject.toml").exists():
            stack.append("Python")
            requirements = read_text_safe(root / "requirements.txt").lower()
            pyproject = read_text_safe(root / "pyproject.toml").lower()
            if "fastapi" in requirements or "fastapi" in pyproject:
                stack.append("FastAPI")
            if "django" in requirements or "django" in pyproject:
                stack.append("Django")
            if "flask" in requirements or "flask" in pyproject:
                stack.append("Flask")

        if (root / "pnpm-lock.yaml").exists():
            stack.append("pnpm")
        elif (root / "yarn.lock").exists():
            stack.append("Yarn")
        elif (root / "package-lock.json").exists():
            stack.append("npm")

        return list(dict.fromkeys(stack)) or ["Unknown"]

    def summarize(self, name: str, stack: list[str], readme: str, important_files: list[str]) -> str:
        readme_hint = readme.strip().splitlines()[0][:180] if readme.strip() else "No README summary found."
        return (
            f"{name} appears to use {', '.join(stack)}. "
            f"Important files detected: {len(important_files)}. README: {readme_hint}"
        )

    def recommend(self, root: Path, stack: list[str], important_files: list[str]) -> list[str]:
        recs: list[str] = []
        if "README.md" not in important_files:
            recs.append("Add a README with setup, architecture, and run commands.")
        if not (root / ".localsentinel").exists():
            recs.append("Create .localsentinel project memory for better context-aware assistance.")
        if "Unknown" in stack:
            recs.append("Add dependency manifests so LocalSentinel can detect the stack more accurately.")
        if not any("test" in item.lower() for item in important_files):
            recs.append("Add or document a test command before enabling agent execution.")
        return recs or ["Project is ready for indexing and chat."]


project_scanner = ProjectScanner()

