from __future__ import annotations

from schemas.agent_schema import AgentPlanResponse


class AgentPlanner:
    def plan(self, goal: str, project_id: str | None = None) -> AgentPlanResponse:
        lower = goal.lower()
        steps = ["Scan current project context", "Identify affected files", "Prepare a minimal implementation plan"]
        files_to_read: list[str] = ["README.md", "package.json", "requirements.txt"]
        files_to_create: list[str] = []
        files_to_modify: list[str] = []
        commands: list[str] = []

        if any(term in lower for term in ("login", "auth", "firebase")):
            steps.extend(["Check routing and auth setup", "Create login UI", "Add authentication service", "Test the login flow"])
            files_to_create.extend(["src/pages/LoginPage.tsx", "src/services/auth.ts"])
            files_to_modify.extend(["src/App.tsx", "src/main.tsx"])
            commands.append("npm run build")
        elif any(term in lower for term in ("api", "endpoint", "fastapi", "route")):
            steps.extend(["Review API routes", "Add or update Pydantic schemas", "Implement endpoint", "Run API smoke test"])
            files_to_read.extend(["main.py", "app/routes.py"])
            files_to_modify.extend(["main.py", "app/routes.py"])
            commands.append("uvicorn main:app --reload")
        elif any(term in lower for term in ("style", "ui", "component", "page")):
            steps.extend(["Review component structure", "Create UI component", "Wire state and loading states", "Run frontend build"])
            files_to_create.append("src/components/NewComponent.tsx")
            files_to_modify.append("src/App.tsx")
            commands.append("npm run build")
        elif any(term in lower for term in ("readme", "docs", "documentation")):
            steps.extend(["Review existing documentation", "Update setup and architecture notes"])
            files_to_modify.extend(["README.md", "docs/architecture.md"])
        else:
            steps.extend(["Draft code changes", "Preview diffs", "Run the safest available verification command"])

        risk = "low"
        if any(term in lower for term in ("auth", "login", "payment", "database", "delete", "security", "migration")):
            risk = "high"
        elif files_to_create or files_to_modify or commands:
            risk = "medium"

        return AgentPlanResponse(
            goal=goal,
            riskLevel=risk,
            steps=list(dict.fromkeys(steps)),
            filesToRead=list(dict.fromkeys(files_to_read)),
            filesToCreate=list(dict.fromkeys(files_to_create)),
            filesToModify=list(dict.fromkeys(files_to_modify)),
            commandsNeeded=list(dict.fromkeys(commands)),
            requiresApproval=True,
        )


agent_planner = AgentPlanner()

