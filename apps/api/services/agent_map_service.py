from __future__ import annotations

from typing import Any

from storage.db import db


class AgentMapService:
    def __init__(self):
        self._initialize_default_agents()

    def _initialize_default_agents(self):
        default_agents = [
            {"name": "Sentinel Lead Agent", "role": "Coordinator", "description": "Coordinates sub-agents and plans execution.", "capabilities": ["Planning", "Routing"]},
            {"name": "Project Scanner Agent", "role": "Scanner", "description": "Analyzes project structure and dependencies.", "capabilities": ["File reading", "AST analysis"]},
            {"name": "Code Review Agent", "role": "Reviewer", "description": "Finds bugs and suggests improvements.", "capabilities": ["Static analysis", "Linting"]},
            {"name": "Bug Fix Planner Agent", "role": "Planner", "description": "Plans steps to resolve identified bugs.", "capabilities": ["Debugging", "Patch planning"]},
            {"name": "Frontend Agent", "role": "Coder", "description": "Handles UI/UX and client-side logic.", "capabilities": ["React", "CSS", "TypeScript"]},
            {"name": "Backend Agent", "role": "Coder", "description": "Handles API and server logic.", "capabilities": ["FastAPI", "Python", "Database"]},
            {"name": "Database Agent", "role": "DBA", "description": "Manages schema and queries.", "capabilities": ["SQL", "Migrations"]},
            {"name": "Security Agent", "role": "Auditor", "description": "Checks for vulnerabilities.", "capabilities": ["Security scanning"]},
            {"name": "Test Agent", "role": "Tester", "description": "Writes and runs tests.", "capabilities": ["Unit testing", "E2E testing"]},
            {"name": "Documentation Agent", "role": "Writer", "description": "Generates documentation and comments.", "capabilities": ["Markdown", "Docstrings"]},
            {"name": "Research Agent", "role": "Researcher", "description": "Finds external knowledge and best practices.", "capabilities": ["Web search", "Summarization"]},
            {"name": "System Intelligence Agent", "role": "System Admin", "description": "Monitors local environment and tools.", "capabilities": ["CLI execution", "Environment checks"]},
            {"name": "Sentiment Priority Agent", "role": "Analyst", "description": "Analyzes feedback and prioritizes tasks.", "capabilities": ["NLP", "VADER"]}
        ]
        
        for agent in default_agents:
            db.upsert_agent_role(agent["name"], agent["role"], agent["description"], agent["capabilities"], "active")

    def get_map(self) -> list[dict[str, Any]]:
        return db.list_agent_roles()


agent_map_service = AgentMapService()
