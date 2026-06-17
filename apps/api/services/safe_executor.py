from __future__ import annotations

import re
import subprocess
from pathlib import Path
from typing import Any

from services.file_service import ensure_inside


DANGEROUS_PATTERNS = [
    r"\brm\s+-rf\b",
    r"\bdel\s+/s\b",
    r"\bformat\b",
    r"\bshutdown\b",
    r"\breboot\b",
    r"\bgit\s+push\b",
    r"\bnpm\s+publish\b",
    r"\b(drop|delete)\s+database\b",
    r"\bDROP\s+TABLE\b",
]

ALLOWED_PREFIXES = (
    "npm install",
    "npm run dev",
    "npm run build",
    "pip install -r requirements.txt",
    "python main.py",
    "uvicorn main:app --reload",
    "git status",
    "git diff",
)


class SafeExecutor:
    def preview(self, project_path: str | None, file_operations: list[Any], commands: list[Any]) -> dict[str, Any]:
        warnings: list[str] = []
        command_previews = []
        file_previews = []

        for command in commands:
            cmd = command.command if hasattr(command, "command") else command.get("command", "")
            safe, reason = self.validate_command(cmd)
            if not safe:
                warnings.append(reason)
            command_previews.append({"command": cmd, "cwd": getattr(command, "cwd", None), "safe": safe, "reason": reason})

        base = Path(project_path).expanduser().resolve() if project_path else None
        if file_operations and not base:
            warnings.append("File operations require projectPath.")
        for operation in file_operations:
            op_type = operation.type if hasattr(operation, "type") else operation.get("type")
            rel_path = operation.path if hasattr(operation, "path") else operation.get("path")
            try:
                if not base:
                    raise ValueError("File operations require projectPath.")
                target = Path(rel_path)
                resolved = ensure_inside(base, base / target if not target.is_absolute() else target)
                file_previews.append({"type": op_type, "path": str(resolved), "safe": True})
            except Exception as exc:
                warnings.append(str(exc))
                file_previews.append({"type": op_type, "path": rel_path, "safe": False})

        return {
            "requiresApproval": True,
            "warnings": warnings,
            "fileOperations": file_previews,
            "commands": command_previews,
            "message": "Review the preview before execution.",
        }

    def execute(self, approved: bool, project_path: str | None, file_operations: list[Any], commands: list[Any]) -> dict[str, Any]:
        if not approved:
            return {"executed": False, "message": "Execution blocked until approval is true.", "results": []}

        preview = self.preview(project_path, file_operations, commands)
        if preview["warnings"]:
            return {"executed": False, "message": "Execution blocked by safety warnings.", "results": preview}

        results: list[dict[str, Any]] = []
        base = Path(project_path).expanduser().resolve() if project_path else None

        for operation in file_operations:
            op_type = operation.type
            target = Path(operation.path)
            if base:
                target = ensure_inside(base, base / target if not target.is_absolute() else target)
            if op_type == "create" and target.exists():
                results.append({"type": op_type, "path": str(target), "ok": False, "message": "File already exists."})
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(operation.content or "", encoding="utf-8")
            results.append({"type": op_type, "path": str(target), "ok": True})

        for command in commands:
            safe, reason = self.validate_command(command.command)
            if not safe:
                results.append({"command": command.command, "ok": False, "message": reason})
                continue
            cwd = Path(command.cwd).expanduser().resolve() if command.cwd else base
            completed = subprocess.run(
                command.command,
                shell=True,
                cwd=str(cwd) if cwd else None,
                text=True,
                capture_output=True,
                timeout=120,
            )
            results.append(
                {
                    "command": command.command,
                    "ok": completed.returncode == 0,
                    "returnCode": completed.returncode,
                    "stdout": completed.stdout[-5000:],
                    "stderr": completed.stderr[-5000:],
                }
            )

        return {"executed": True, "message": "Approved actions executed.", "results": results}

    def validate_command(self, command: str) -> tuple[bool, str]:
        stripped = command.strip()
        for pattern in DANGEROUS_PATTERNS:
            if re.search(pattern, stripped, flags=re.IGNORECASE):
                return False, f"Blocked dangerous command: {stripped}"
        if not any(stripped == prefix or stripped.startswith(prefix + " ") for prefix in ALLOWED_PREFIXES):
            return False, f"Command is not on the MVP allowlist: {stripped}"
        return True, "Allowed after approval."


safe_executor = SafeExecutor()
