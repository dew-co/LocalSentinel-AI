from __future__ import annotations

import subprocess
import shutil
from typing import Any

from storage.db import db


class SystemIntelligenceService:
    def _check_tool(self, name: str, version_cmd: list[str]) -> dict[str, Any]:
        path = shutil.which(name)
        if not path:
            return {"tool_name": name, "detected": False, "version": None, "path": None, "status": "missing", "notes": "Not found in PATH"}
        
        try:
            result = subprocess.run(version_cmd, capture_output=True, text=True, timeout=5)
            version = result.stdout.strip().split('\n')[0]
            if not version and result.stderr:
                version = result.stderr.strip().split('\n')[0]
            return {"tool_name": name, "detected": True, "version": version, "path": path, "status": "installed", "notes": ""}
        except Exception as e:
            return {"tool_name": name, "detected": True, "version": None, "path": path, "status": "error", "notes": str(e)}

    def scan_tools(self) -> list[dict[str, Any]]:
        tools_to_check = [
            ("node", ["node", "--version"]),
            ("npm", ["npm", "--version"]),
            ("pnpm", ["pnpm", "--version"]),
            ("yarn", ["yarn", "--version"]),
            ("python", ["python", "--version"]),
            ("pip", ["pip", "--version"]),
            ("git", ["git", "--version"]),
            ("docker", ["docker", "--version"]),
            ("ollama", ["ollama", "--version"]),
            ("code", ["code", "--version"]),
        ]
        
        results = []
        for name, cmd in tools_to_check:
            res = self._check_tool(name, cmd)
            db.upsert_system_tool(res["tool_name"], res["detected"], res["version"], res["path"], res["status"], res["notes"])
            results.append(res)
            
        return results

    def get_status(self) -> list[dict[str, Any]]:
        return db.list_system_tools()

    def get_readiness_score(self) -> dict[str, Any]:
        tools = self.get_status()
        if not tools:
            return {"score": 0, "readiness": "unknown", "recommendations": ["Run a system scan"]}
            
        installed = sum(1 for t in tools if t["detected"])
        total = len(tools)
        score = int((installed / total) * 100) if total > 0 else 0
        
        recommendations = []
        for t in tools:
            if not t["detected"]:
                recommendations.append(f"Install {t['tool_name']} for full functionality.")
                
        return {
            "score": score,
            "readiness": "high" if score >= 80 else "medium" if score >= 50 else "low",
            "recommendations": recommendations
        }


system_intelligence_service = SystemIntelligenceService()
