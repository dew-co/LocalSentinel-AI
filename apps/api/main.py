from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import ensure_data_dirs, settings
from routers import agent, chat, models, projects, rag, sentiment, voice, memory, system, research, activity, agents

ensure_data_dirs()

app = FastAPI(
    title=settings.app_name,
    description="Local-first agentic coding assistant with sentiment-aware development prioritization.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models.router)
app.include_router(projects.router)
app.include_router(rag.router)
app.include_router(chat.router)
app.include_router(agent.router)
app.include_router(sentiment.router)
app.include_router(voice.router)
app.include_router(memory.router)
app.include_router(system.router)
app.include_router(research.router)
app.include_router(activity.router)
app.include_router(agents.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "name": settings.app_name,
        "safeMode": settings.safe_mode,
        "ragEnabled": settings.rag_enabled,
    }

