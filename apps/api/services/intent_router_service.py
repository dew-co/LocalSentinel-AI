from __future__ import annotations

import re


class IntentRouterService:
    def route_intent(self, text: str) -> str:
        text_lower = text.lower()
        if re.search(r'\b(scan|analyze|index) (project|workspace)\b', text_lower):
            return "project_scan"
        if re.search(r'\b(explain|what is) (this project|project)\b', text_lower):
            return "project_explanation"
        if re.search(r'\b(review|check) (code|this file)\b', text_lower):
            return "code_review"
        if re.search(r'\b(fix|solve) (bug|issue|error)\b', text_lower):
            return "bug_fix_plan"
        if re.search(r'\b(analyze|check) (feedback|reviews)\b', text_lower):
            return "feedback_analysis"
        if re.search(r'\b(generate|create) (task|tasks)\b', text_lower):
            return "task_generation"
        if re.search(r'\b(model|ollama) (status|check)\b', text_lower):
            return "model_status"
        if re.search(r'\b(system|tools|environment) (scan|check)\b', text_lower):
            return "system_scan"
        if re.search(r'\b(research|find out|compare)\b', text_lower):
            return "research_request"
        if re.search(r'\b(memory|remember|what do you know)\b', text_lower):
            return "memory_query"
        if re.search(r'\b(agent|map|structure)\b', text_lower):
            return "agent_map_query"
        return "general_chat"


intent_router_service = IntentRouterService()
