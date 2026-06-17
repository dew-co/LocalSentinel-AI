# Architecture

LocalSentinel AI is a local-first MVP with a React dashboard and a FastAPI backend. It does not upload code to external services. Optional online documentation updates are disabled by default.

## Monorepo

```txt
apps/web              React + TypeScript + Vite dashboard
apps/api              FastAPI backend
apps/vscode-extension Future VS Code integration structure
packages/shared       Shared constants
data/projects         Reserved local project workspace
data/vector_store     Local RAG indexes
data/sqlite           SQLite metadata and memory
docs                  Product and API documentation
```

## Backend Modules

- `model_manager.py` checks Ollama status, lists models, selects active models, previews pulls, and runs smoke tests.
- `project_creator.py` creates controlled starter projects after approval.
- `project_scanner.py` detects stacks, dependency files, important files, README content, and recommendations.
- `rag_service.py` indexes local text files into a lightweight JSON store and mirrors chunks into ChromaDB when available.
- `sentiment_service.py` uses VADER sentiment and issue keywords to prioritize feedback.
- `agent_planner.py` converts user goals into structured plans.
- `safe_executor.py` previews file operations and commands, then executes only allowlisted commands after approval.

## Frontend Modules

- App shell with sidebar and top status bar.
- Sentinel Core animated assistant visual.
- Chat panel with RAG citations, browser voice recognition, browser speech synthesis, and voice transcript.
- Project creation and scanning pages.
- Agent mode with plan and approval panels.
- Models page for Ollama status, selection, pull approval, and smoke tests.
- RAG memory and sentiment priority dashboard.

## Safety Boundaries

- Safe mode defaults to on.
- Model downloads require explicit approval.
- File creation and command execution are previewed before execution.
- Destructive commands are blocked even if approval is set.
- Secrets and `.env` files are excluded from indexing.
- The chat endpoint never edits files directly.
- Voice summaries are stored in project memory only when the user enables the setting.

## Voice Companion Layer

Sentinel Core uses browser speech recognition for MVP speech-to-text and browser speech synthesis for text-to-speech. The backend exposes placeholder voice engine endpoints for future local Whisper.cpp and Piper or Coqui integration. Wake word detection is intentionally disabled unless a future version adds explicit opt-in.
