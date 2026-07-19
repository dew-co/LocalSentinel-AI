from __future__ import annotations

import re
import shlex
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

# Commands allowed after explicit approval. Each is matched as a leading token
# sequence, so extra flags are permitted but the command itself cannot change.
# Long-running servers (npm run dev, uvicorn --reload) are intentionally absent:
# this executor waits for completion and captures output, so they would only
# ever hang and time out.
ALLOWED_PREFIXES = (
    "npm install",
    "npm run build",
    "pip install -r requirements.txt",
    "python main.py",
    "git status",
    "git diff",
)

# Characters that enable shell chaining, substitution, or redirection. The
# executor never runs through a shell (see execute()), but rejecting these
# up front blocks injection attempts and gives a clear reason.
SHELL_METACHARACTERS = (";", "|", "&", "$", "`", ">", "<", "\n", "\r", "(", ")", "{", "}")

COMMAND_TIMEOUT = 120


def _field(obj: Any, name: str, default: Any = None) -> Any:
    """Read an attribute from a pydantic model or a plain dict payload."""
    if hasattr(obj, name):
        return getattr(obj, name)
    if isinstance(obj, dict):
        return obj.get(name, default)
    return default


class SafeExecutor:
    def preview(self, project_path: str | None, file_operations: list[Any], commands: list[Any]) -> dict[str, Any]:
        warnings: list[str] = []
        command_previews = []
        file_previews = []

        base = Path(project_path).expanduser().resolve() if project_path else None

        if commands and base is None:
            warnings.append("Command execution requires projectPath.")
        for command in commands:
            cmd = _field(command, "command", "")
            raw_cwd = _field(command, "cwd")
            argv, reason = self._parse_safe_argv(cmd)
            safe = argv is not None
            resolved_cwd: str | None = None
            if safe and base is not None:
                try:
                    resolved_cwd = str(self._resolve_cwd(raw_cwd, base))
                except Exception as exc:
                    safe = False
                    reason = str(exc)
            if not safe:
                warnings.append(reason)
            command_previews.append(
                {"command": cmd, "cwd": resolved_cwd or raw_cwd, "safe": safe, "reason": reason}
            )

        if file_operations and not base:
            warnings.append("File operations require projectPath.")
        for operation in file_operations:
            op_type = _field(operation, "type")
            rel_path = _field(operation, "path")
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
            op_type = _field(operation, "type")
            target = Path(_field(operation, "path"))
            if base:
                target = ensure_inside(base, base / target if not target.is_absolute() else target)
            if op_type == "create" and target.exists():
                results.append({"type": op_type, "path": str(target), "ok": False, "message": "File already exists."})
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(_field(operation, "content") or "", encoding="utf-8")
            results.append({"type": op_type, "path": str(target), "ok": True})

        for command in commands:
            raw = _field(command, "command", "")
            argv, reason = self._parse_safe_argv(raw)
            if argv is None:
                results.append({"command": raw, "ok": False, "message": reason})
                continue
            try:
                cwd = self._resolve_cwd(_field(command, "cwd"), base)
            except Exception as exc:
                results.append({"command": raw, "ok": False, "message": str(exc)})
                continue
            try:
                completed = subprocess.run(
                    argv,
                    shell=False,
                    cwd=str(cwd) if cwd else None,
                    text=True,
                    capture_output=True,
                    timeout=COMMAND_TIMEOUT,
                )
            except subprocess.TimeoutExpired:
                results.append(
                    {"command": raw, "ok": False, "message": f"Command timed out after {COMMAND_TIMEOUT}s and was stopped."}
                )
                continue
            except FileNotFoundError:
                results.append({"command": raw, "ok": False, "message": f"Command not found: {argv[0]}"})
                continue
            except OSError as exc:
                results.append({"command": raw, "ok": False, "message": f"Command failed to start: {exc}"})
                continue
            results.append(
                {
                    "command": raw,
                    "ok": completed.returncode == 0,
                    "returnCode": completed.returncode,
                    "stdout": completed.stdout[-5000:],
                    "stderr": completed.stderr[-5000:],
                }
            )

        return {"executed": True, "message": "Approved actions executed.", "results": results}

    def _resolve_cwd(self, raw_cwd: str | None, base: Path | None) -> Path:
        if base is None:
            raise ValueError("Command execution requires projectPath.")
        if not raw_cwd:
            return base
        candidate = Path(raw_cwd)
        candidate = candidate if candidate.is_absolute() else base / candidate
        return ensure_inside(base, candidate)

    def _parse_safe_argv(self, command: str) -> tuple[list[str] | None, str]:
        stripped = (command or "").strip()
        if not stripped:
            return None, "Empty command."
        for pattern in DANGEROUS_PATTERNS:
            if re.search(pattern, stripped, flags=re.IGNORECASE):
                return None, f"Blocked dangerous command: {stripped}"
        for meta in SHELL_METACHARACTERS:
            if meta in stripped:
                return None, f"Blocked shell metacharacter in command: {stripped}"
        try:
            argv = shlex.split(stripped, posix=True)
        except ValueError as exc:
            return None, f"Could not parse command: {exc}"
        if not argv:
            return None, "Empty command."
        for prefix in ALLOWED_PREFIXES:
            prefix_tokens = shlex.split(prefix)
            if argv[: len(prefix_tokens)] == prefix_tokens:
                return argv, "Allowed after approval."
        return None, f"Command is not on the MVP allowlist: {stripped}"

    def validate_command(self, command: str) -> tuple[bool, str]:
        argv, reason = self._parse_safe_argv(command)
        return argv is not None, reason


safe_executor = SafeExecutor()
