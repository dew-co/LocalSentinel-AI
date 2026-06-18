from __future__ import annotations

import re

from fastapi import APIRouter

from schemas.chat_schema import ChatRequest
from services.agent_planner import agent_planner
from services.ollama_service import ollama_service
from services.rag_service import rag_service
from services.sentiment_service import sentiment_service
from storage.db import db

router = APIRouter(tags=["chat"])


def length_instruction(length: str) -> str:
    if length == "brief":
        return "Keep the response short: 3-6 sentences or a compact bullet list."
    if length == "detailed":
        return "Give a detailed but organized answer with clear steps and practical tradeoffs."
    return "Use a balanced length: enough context to be useful, without overexplaining."


def tone_instruction(tone: str) -> str:
    tones = {
        "friendly": "Use a friendly, calm, practical tone.",
        "calm": "Use a calm, steady, low-drama tone.",
        "concise": "Be direct, compact, and action-oriented.",
        "teacher": "Explain concepts simply and guide the user step by step.",
    }
    return tones.get(tone, tones["friendly"])


def should_analyze_sentiment(message: str) -> bool:
    lowered = message.lower()
    return any(term in lowered for term in ("client", "feedback", "urgent", "crash", "crashing", "broken", "frustrated", "payment", "login", "security"))


def normalize_text(message: str) -> str:
    return re.sub(r"\s+", " ", message.strip().lower())


def has_word(text: str, word: str) -> bool:
    return bool(re.search(rf"\b{re.escape(word)}\b", text))


def conversation_history_block(payload: ChatRequest) -> str:
    lines = []
    for turn in payload.conversationHistory[-8:]:
        role = "User" if turn.role == "user" else "Sentinel"
        content = re.sub(r"\s+", " ", turn.content).strip()
        if content:
            lines.append(f"{role}: {content[:900]}")
    return "\n".join(lines)


def asks_for_plan(text: str) -> bool:
    return bool(
        re.search(r"\b(tell me|show me|give me|generate|create|make)\b.*\b(plan|roadmap|steps)\b", text)
        or re.search(r"\b(plan first|project plan|implementation plan|yes please|yes,? do it|please do|go ahead)\b", text)
    )


def is_short_confirmation(text: str) -> bool:
    return bool(re.fullmatch(r"(yes|yes please|please|ok|okay|sure|go ahead|do it|tell me the plan|make the plan)[.!? ]*", text))


def contains_crm(text: str) -> bool:
    return has_word(text, "crm") or "customer relationship" in text


def contains_school_ledger(text: str) -> bool:
    return (
        "school ledger" in text
        or ("school" in text and any(term in text for term in ("ledger", "fee", "fees", "payment", "student", "management")))
    )


def latest_project_goal(message: str, payload: ChatRequest) -> str:
    text = normalize_text(message)
    if not is_short_confirmation(text) and not (asks_for_plan(text) and len(text.split()) <= 5):
        return message

    for turn in reversed(payload.conversationHistory):
        if turn.role != "user":
            continue
        candidate = normalize_text(turn.content)
        if not candidate or is_short_confirmation(candidate):
            continue
        if any(term in candidate for term in ("project", "app", "system", "management", "crm", "ledger", "attendance", "build", "create", "make")):
            return turn.content
    return message


def crm_answer(plan: bool = False) -> str:
    if plan:
        return (
            "Here is a practical CRM MVP plan:\n"
            "1. Define core records: customers, leads, contacts, notes, follow-ups, and activity history.\n"
            "2. Build authentication and simple role access for admins and team members.\n"
            "3. Create customer and lead list pages with search, filters, and status changes.\n"
            "4. Add notes, reminders, and follow-up dates so sales work is trackable.\n"
            "5. Add a dashboard for lead counts, conversion status, pending follow-ups, and recent activity.\n"
            "6. Start with React + Firebase for speed, or React + FastAPI + PostgreSQL if you need custom backend rules.\n\n"
            "Before creating files or running commands, I would show you the scaffold plan for approval."
        )
    return (
        "For a CRM MVP, start with customer records, lead tracking, notes, follow-ups, and a small analytics dashboard. "
        "React with Firebase is fast for an MVP; React with FastAPI is better if you need custom backend control. "
        "Would you like me to generate a project plan first?"
    )


def school_ledger_answer(plan: bool = False) -> str:
    if plan:
        return (
            "Yes. A school ledger management project is a strong MVP idea. Here is the plan:\n"
            "1. Core modules: students, guardians, classes/sections, fee categories, invoices, payments, dues, and receipts.\n"
            "2. User roles: admin, accountant, class teacher, and optional parent/student view.\n"
            "3. Main workflows: create fee structure, generate monthly or term invoices, record payments, track pending dues, and print receipts.\n"
            "4. Dashboard: total collected, pending dues, overdue students, recent payments, and class-wise fee status.\n"
            "5. Reports: student ledger, class ledger, date-wise collection, outstanding dues, and exportable CSV or PDF summaries.\n"
            "6. Suggested stack: React + TypeScript + Firebase for a fast MVP; React + FastAPI + PostgreSQL if you need audit logs, complex reports, or offline backups.\n"
            "7. First build step: create the data model and basic screens before adding advanced reports.\n\n"
            "I can create a safe project scaffold plan next. I’ll ask for approval before creating files or running commands."
        )
    return (
        "Yes, a school ledger management project is practical. For the MVP, focus on students, fee categories, invoices, payments, dues, receipts, and reports. "
        "React + Firebase is fast for a first version; React + FastAPI + PostgreSQL is better if you need stronger reporting, audit history, and backend control. "
        "Would you like me to generate the project plan?"
    )


def general_project_plan(goal: str) -> str:
    cleaned_goal = re.sub(r"\s+", " ", goal).strip()
    return (
        f"Here is a safe MVP plan for: {cleaned_goal}\n"
        "1. Clarify users, roles, and the one workflow that must work first.\n"
        "2. Define the core data model and keep optional features out of the first build.\n"
        "3. Pick a stack based on speed versus control: Firebase for speed, FastAPI + PostgreSQL for custom backend logic.\n"
        "4. Create the starter project, README, architecture notes, and a small roadmap.\n"
        "5. Build the main screens, connect data, then add validation and basic tests.\n"
        "6. Review the plan and approve file creation before any scaffold or terminal command runs."
    )


def fast_companion_answer(message: str, payload: ChatRequest) -> str | None:
    text = normalize_text(message)
    goal_text = normalize_text(latest_project_goal(message, payload))
    wants_plan = asks_for_plan(text) or is_short_confirmation(text)
    greeting_patterns = (
        r"^(hi|hello|hey|yo)( sentinel| sentinel core)?[.!? ]*$",
        r"^sentinel( core)?[.!? ]*$",
    )
    if any(re.match(pattern, text) for pattern in greeting_patterns):
        return (
            "Hi, I’m ready. Tell me what you want to build, debug, plan, or prioritize, "
            "and I’ll guide you step by step. I’ll ask for approval before any file changes or terminal commands."
        )

    if contains_school_ledger(text) or (wants_plan and contains_school_ledger(goal_text)):
        return school_ledger_answer(plan=wants_plan)

    if "stuck" in text and ("login" in text or "auth" in text):
        return (
            "Let’s solve it step by step. First, check the login flow, auth service, route protection, and browser console errors. "
            "I can prepare a fix plan before any file changes."
        )

    if contains_crm(text) and any(term in text for term in ("create", "build", "project", "idea")):
        return crm_answer()

    if wants_plan and contains_crm(goal_text):
        return crm_answer(plan=True)

    if "tech stack" in text or re.search(r"\b(best|simple|suggest|recommend).*\bstack\b", text):
        if contains_crm(text):
            return (
                "For a CRM MVP, I’d use React + TypeScript for the dashboard, Firebase for auth and quick data storage, "
                "Tailwind for UI speed, and a small analytics layer once the core workflow works. "
                "If you need custom business rules or integrations, use React + FastAPI + PostgreSQL instead."
            )
        return (
            "For a fast MVP, start with React + TypeScript + Vite on the frontend. "
            "Use Firebase when you want speed and built-in auth; use FastAPI + PostgreSQL when you need backend control. "
            "Keep the first version small: auth, core data model, one dashboard, and tests for the critical flow."
        )

    if "explain code" in text or "explain this code" in text:
        return (
            "Share the code or select a project file, and I’ll explain it in simple language: what it does, how data flows, "
            "where bugs may hide, and what I would improve. I’ll avoid making changes unless you approve an Agent Mode plan."
        )

    if "what can you do" in text or "help me" in text:
        return (
            "I can help you plan software projects, pick a stack, explain code, debug issues, prioritize urgent feedback, "
            "and prepare safe task plans. Tell me your goal or paste the problem, and I’ll guide you step by step."
        )

    if "what should i do next" in text or "next steps" in text:
        return (
            "Start with the highest-risk workflow first. Check the current project state, list blockers, pick one small task, "
            "then create a safe plan with files to read, files to change, and any commands that need approval."
        )

    if wants_plan and goal_text != text:
        return general_project_plan(latest_project_goal(message, payload))

    if any(term in text for term in ("urgent feedback", "client feedback", "crashing after login", "app keeps crashing")):
        result = sentiment_service.analyze(message)
        return (
            f"I’d treat this as {result['priority']} priority with {result['urgency']} urgency. "
            f"Start by checking login/auth flow, recent login-related changes, browser console errors, and backend logs. "
            "I can prepare a safe investigation plan before any file changes."
        )

    return None


@router.post("/chat")
async def chat(payload: ChatRequest):
    selected_model = payload.model or db.get_setting("active_model")
    citations = []
    context_block = ""
    if payload.useRag and payload.projectId:
        matches = rag_service.query(payload.message, payload.projectId, top_k=5)
        citations = [
            {"filePath": item["filePath"], "score": item["score"], "preview": item["preview"]}
            for item in matches
        ]
        context_block = "\n\n".join(f"File: {item['filePath']}\n{item['text']}" for item in matches)

    project = db.get_project(payload.projectId) if payload.projectId else None
    project_summary = project["summary"] if project else "No active project summary."
    sentiment_context = ""
    if should_analyze_sentiment(payload.message):
        result = sentiment_service.analyze(payload.message)
        sentiment_context = (
            "Sentiment and urgency signal: "
            f"sentiment={result['sentiment']}, urgency={result['urgency']}, priority={result['priority']}, "
            f"issues={', '.join(result['detectedIssues']) or 'none'}, recommendedAction={result['recommendedAction']}"
        )

    # Intent routing & Activity logging
    from services.intent_router_service import intent_router_service
    from services.activity_service import activity_service
    intent = intent_router_service.route_intent(payload.message)
    activity_service.log(
        project_id=payload.projectId,
        activity_type="chat_request",
        title=f"Chat Intent: {intent}",
        description=f"User asked: {payload.message[:100]}",
        severity="info"
    )

    quick_answer = fast_companion_answer(payload.message, payload)
    if quick_answer:
        return {
            "answer": quick_answer,
            "model": selected_model,
            "citations": citations,
            "suggestedFiles": [],
            "safeActions": ["Use Agent Mode when you want approved file changes or commands."],
            "memoryStored": False,
        }

    if not selected_model or not await ollama_service.is_running():
        plan = agent_planner.plan(payload.message, payload.projectId)
        answer = (
            "I cannot reach the selected local model right now. "
            "Start Ollama and select a model to enable full companion chat.\n\n"
            f"Draft plan:\n- " + "\n- ".join(plan.steps)
        )
        return {
            "answer": answer,
            "model": selected_model,
            "citations": citations,
            "suggestedFiles": plan.filesToRead + plan.filesToCreate + plan.filesToModify,
            "safeActions": ["Select or pull an Ollama model", "Use Agent Mode for approved changes"],
            "memoryStored": False,
        }

    asks_for_change = bool(re.search(r"\b(add|change|edit|fix|create|remove|implement|refactor)\b", payload.message, re.I))
    system = (
        "You are Sentinel Core, the voice-enabled companion layer inside LocalSentinel AI. "
        "You help with software development, project planning, debugging, learning, task prioritization, and productivity. "
        "Be friendly, practical, developer-focused, clear, and step-by-step. "
        "Use empathy-style language when useful, but never claim to be conscious, emotional, human, or able to feel. "
        "Never overstate certainty. State assumptions and ask for missing details when needed. "
        "Use project context, memory, and recent conversation when provided. "
        "Resolve short follow-ups like 'yes please' or 'tell me the plan' from the recent conversation. "
        "If the user discusses an idea, suggest a pragmatic MVP scope and suitable tech stack. "
        "If the user asks about code, explain it in simple language. "
        "If the user reports urgent feedback, use sentiment/urgency signals to prioritize next steps. "
        "Do not claim to have edited files or run commands. "
        "Always ask for approval before file changes, terminal execution, installs, destructive actions, or deployments. "
        "If the user asks for code changes, produce a task plan first and mention that Agent Mode requires approval. "
        f"{tone_instruction(payload.assistantTone)} {length_instruction(payload.responseLength)}"
    )
    recent_conversation = conversation_history_block(payload)
    user = (
        f"Project summary: {project_summary}\n\n"
        f"Recent conversation:\n{recent_conversation or 'No previous conversation.'}\n\n"
        f"Relevant context:\n{context_block or 'No RAG context available.'}\n\n"
        f"{sentiment_context}\n\n"
        f"Input mode: {'voice' if payload.isVoice else 'text'}\n\n"
        f"User message: {payload.message}"
    )
    try:
        answer = (await ollama_service.complete(selected_model, system, user, payload.responseLength)).strip()
        if not answer:
            raise RuntimeError("The selected local model returned an empty response.")
    except Exception as exc:
        fallback = quick_answer or (
            "The local model is taking longer than expected, so I’m switching to quick guidance. "
            "Tell me the goal, bug, or project idea, and I’ll give you a safe step-by-step plan before any changes."
        )
        answer = fallback
    plan = agent_planner.plan(payload.message, payload.projectId) if asks_for_change else None
    memory_stored = False
    if payload.isVoice and payload.rememberVoice and payload.projectId:
        summary = f"Voice exchange: user asked '{payload.message[:180]}'; Sentinel replied '{answer[:240]}'."
        try:
            rag_service.add_memory(payload.projectId, summary, ["voice", "conversation"])
            memory_stored = True
        except Exception:
            memory_stored = False

    return {
        "answer": answer,
        "model": selected_model,
        "citations": citations,
        "suggestedFiles": (plan.filesToRead + plan.filesToCreate + plan.filesToModify) if plan else [],
        "safeActions": ["Open Agent Mode to preview and approve changes"] if asks_for_change else [],
        "memoryStored": memory_stored,
    }
