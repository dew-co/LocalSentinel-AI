from __future__ import annotations

from typing import Any

from storage.db import db


class AgentMapService:
    def __init__(self):
        self._initialize_default_agents()

    def _initialize_default_agents(self):
        default_agents = [
            {"name": "Sentinel Lead Agent", "role": "Agent Role", "description": "Coordinates sub-agents and plans execution.", "capabilities": ["Planning", "Routing"]},
            {"name": "Project Scanner Agent", "role": "Specialized Module", "description": "Analyzes project structure and dependencies.", "capabilities": ["File reading", "AST analysis"]},
            {"name": "Code Review Agent", "role": "Specialized Module", "description": "Finds bugs and suggests improvements.", "capabilities": ["Static analysis", "Linting"]},
            {"name": "Bug Fix Planner Agent", "role": "Specialized Module", "description": "Plans steps to resolve identified bugs.", "capabilities": ["Debugging", "Patch planning"]},
            {"name": "Frontend Agent", "role": "Future Autonomous Agent", "description": "Handles UI/UX and client-side logic.", "capabilities": ["React", "CSS", "TypeScript"]},
            {"name": "Backend Agent", "role": "Future Autonomous Agent", "description": "Handles API and server logic.", "capabilities": ["FastAPI", "Python", "Database"]},
            {"name": "Database Agent", "role": "Future Autonomous Agent", "description": "Manages schema and queries.", "capabilities": ["SQL", "Migrations"]},
            {"name": "Security Agent", "role": "Future Autonomous Agent", "description": "Checks for vulnerabilities.", "capabilities": ["Security scanning"]},
            {"name": "Test Agent", "role": "Future Autonomous Agent", "description": "Writes and runs tests.", "capabilities": ["Unit testing", "E2E testing"]},
            {"name": "Documentation Agent", "role": "Future Autonomous Agent", "description": "Generates documentation and comments.", "capabilities": ["Markdown", "Docstrings"]},
            {"name": "Research Agent", "role": "Specialized Module", "description": "Finds external knowledge and best practices.", "capabilities": ["Web search", "Summarization"]},
            {"name": "System Intelligence Agent", "role": "Specialized Module", "description": "Monitors local environment and tools.", "capabilities": ["CLI execution", "Environment checks"]},
            {"name": "Sentiment Priority Agent", "role": "Specialized Module", "description": "Analyzes feedback and prioritizes tasks.", "capabilities": ["NLP", "VADER"]},
            {"name": "Safe Executor Agent", "role": "Specialized Module", "description": "Executes tasks securely.", "capabilities": ["Sandboxing", "Validation"]},
            {"name": "RAG Memory Agent", "role": "Specialized Module", "description": "Manages project memory and context retrieval.", "capabilities": ["Vector DB", "Embeddings"]}
        ]
        
        for agent in default_agents:
            db.upsert_agent_role(agent["name"], agent["role"], agent["description"], agent["capabilities"], "active")

    def get_map(self) -> list[dict[str, Any]]:
        agents = db.list_agent_roles()
        
        # Define static extra metadata since DB schema is not changed
        extra_meta = {
            "Sentinel Lead Agent": {"state": "active", "related_service": "Agent Map Service"},
            "Project Scanner Agent": {"state": "active", "related_service": "Project Service"},
            "Code Review Agent": {"state": "active", "related_service": "System Service"},
            "Bug Fix Planner Agent": {"state": "idle", "related_service": "Agent Service"},
            "Frontend Agent": {"state": "future-ready", "related_service": "None"},
            "Backend Agent": {"state": "future-ready", "related_service": "None"},
            "Database Agent": {"state": "future-ready", "related_service": "None"},
            "Security Agent": {"state": "future-ready", "related_service": "None"},
            "Test Agent": {"state": "future-ready", "related_service": "None"},
            "Documentation Agent": {"state": "future-ready", "related_service": "None"},
            "Research Agent": {"state": "idle", "related_service": "Research Service"},
            "System Intelligence Agent": {"state": "active", "related_service": "System Service"},
            "Sentiment Priority Agent": {"state": "idle", "related_service": "Sentiment Service"},
            "Safe Executor Agent": {"state": "idle", "related_service": "System Service"},
            "RAG Memory Agent": {"state": "active", "related_service": "Memory Service"}
        }

        result = []
        for a in agents:
            meta = extra_meta.get(a["name"], {"state": "idle", "related_service": "Unknown"})
            # Override role from DB with actual ones just in case the DB has old roles
            role_map = {
                "Sentinel Lead Agent": "Agent Role",
                "Frontend Agent": "Future Autonomous Agent",
                "Backend Agent": "Future Autonomous Agent",
                "Database Agent": "Future Autonomous Agent",
                "Security Agent": "Future Autonomous Agent",
                "Test Agent": "Future Autonomous Agent",
                "Documentation Agent": "Future Autonomous Agent"
            }
            a_dict = dict(a)
            a_dict["state"] = meta["state"]
            a_dict["related_service"] = meta["related_service"]
            a_dict["role"] = role_map.get(a["name"], "Specialized Module")
            result.append(a_dict)
            
        # Ensure new agents are added if not in DB yet
        db_agent_names = {a["name"] for a in agents}
        default_agents = [
            {"name": "Sentinel Lead Agent", "role": "Agent Role", "description": "Coordinates sub-agents and plans execution.", "capabilities": ["Planning", "Routing"]},
            {"name": "Project Scanner Agent", "role": "Specialized Module", "description": "Analyzes project structure and dependencies.", "capabilities": ["File reading", "AST analysis"]},
            {"name": "Code Review Agent", "role": "Specialized Module", "description": "Finds bugs and suggests improvements.", "capabilities": ["Static analysis", "Linting"]},
            {"name": "Bug Fix Planner Agent", "role": "Specialized Module", "description": "Plans steps to resolve identified bugs.", "capabilities": ["Debugging", "Patch planning"]},
            {"name": "Frontend Agent", "role": "Future Autonomous Agent", "description": "Handles UI/UX and client-side logic.", "capabilities": ["React", "CSS", "TypeScript"]},
            {"name": "Backend Agent", "role": "Future Autonomous Agent", "description": "Handles API and server logic.", "capabilities": ["FastAPI", "Python", "Database"]},
            {"name": "Database Agent", "role": "Future Autonomous Agent", "description": "Manages schema and queries.", "capabilities": ["SQL", "Migrations"]},
            {"name": "Security Agent", "role": "Future Autonomous Agent", "description": "Checks for vulnerabilities.", "capabilities": ["Security scanning"]},
            {"name": "Test Agent", "role": "Future Autonomous Agent", "description": "Writes and runs tests.", "capabilities": ["Unit testing", "E2E testing"]},
            {"name": "Documentation Agent", "role": "Future Autonomous Agent", "description": "Generates documentation and comments.", "capabilities": ["Markdown", "Docstrings"]},
            {"name": "Research Agent", "role": "Specialized Module", "description": "Finds external knowledge and best practices.", "capabilities": ["Web search", "Summarization"]},
            {"name": "System Intelligence Agent", "role": "Specialized Module", "description": "Monitors local environment and tools.", "capabilities": ["CLI execution", "Environment checks"]},
            {"name": "Sentiment Priority Agent", "role": "Specialized Module", "description": "Analyzes feedback and prioritizes tasks.", "capabilities": ["NLP", "VADER"]},
            {"name": "Safe Executor Agent", "role": "Specialized Module", "description": "Executes tasks securely.", "capabilities": ["Sandboxing", "Validation"]},
            {"name": "RAG Memory Agent", "role": "Specialized Module", "description": "Manages project memory and context retrieval.", "capabilities": ["Vector DB", "Embeddings"]}
        ]
        
        for da in default_agents:
            if da["name"] not in db_agent_names:
                db.upsert_agent_role(da["name"], da["role"], da["description"], da["capabilities"], "active")
                meta = extra_meta.get(da["name"], {"state": "idle", "related_service": "Unknown"})
                a_dict = {
                    "id": "",
                    "name": da["name"],
                    "role": da["role"],
                    "description": da["description"],
                    "capabilities_json": json.dumps(da["capabilities"]),
                    "status": "active",
                    "last_used_at": utc_now(),
                    "state": meta["state"],
                    "related_service": meta["related_service"]
                }
                result.append(a_dict)

        return result


agent_map_service = AgentMapService()
