# Architecture

LocalSentinel AI is a local-first MVP with a React dashboard and a FastAPI backend. It acts as an intelligent command center, connecting frontend UI interactions with local AI models, RAG memory, and secure system tooling.

## Monorepo Structure

```txt
apps/web              React + TypeScript + Vite dashboard
apps/api              FastAPI backend
apps/vscode-extension Future VS Code integration structure
packages/shared       Shared constants
data/projects         Reserved local project workspace
data/vector_store     Local RAG indexes
data/sqlite           SQLite metadata, tools, logs, and memory
docs                  Product and API documentation
```

## Backend Modules

The central intelligence layer relies on the following services:

- `intent_router_service.py` intercepts incoming requests and routes them to specific system components without requiring a slow LLM query for simple tasks.
- `model_router_service.py` manages connections to Ollama, tracks installed models, tests health, and falls back to secondary models if the primary coding model is unavailable.
- `system_intelligence_service.py` securely checks installed local tools (Node, Python, Git) using read-only commands and calculates a development readiness score.
- `memory_service.py` stores and retrieves cross-domain memory data (Project Brain, System Brain, User Work Brain, Interaction Brain) using SQLite.
- `research_service.py` tracks LLM-generated or manual research topics, sources, and recommendations.
- `activity_service.py` provides a transparent, centralized audit log of all critical LocalSentinel actions and errors.
- `agent_map_service.py` manages and lists the available internal specialized agent roles.
- `project_creator.py` & `project_scanner.py` handle safe codebase generation and metadata detection.
- `rag_service.py` indexes local text files into a lightweight JSON store and mirrors chunks into ChromaDB.
- `sentiment_service.py` uses VADER sentiment analysis to tag user feedback and assign development priority logic.
- `safe_executor.py` previews and runs commands securely behind approval gates.

## Frontend Modules

The sleek glassmorphism command center includes:

- **App Shell**: Top bar and responsive sidebar routing.
- **Sentinel Core**: An animated, sentient-feeling visualization supporting dynamic statuses and operation modes (Think Mode, Research Mode, Code Mode).
- **Project Brain Page**: View all localized project knowledge and architecture decisions.
- **System Intelligence Page**: Review your local tooling ecosystem and readiness score.
- **Research Center**: A staging area for querying development concepts and saving notes.
- **Activity Console**: A complete timeline of background events, tool actions, and errors.
- **Agent Map Page**: A visual tree representing the active sub-agents within the Sentinel ecosystem.
- **Dashboard & Chat**: Main hubs for interacting with the LLM, viewing RAG citations, and running the agent planner.

## Database (SQLite)

The `db.py` layer abstracts SQLite and tracks:
- `projects`, `project_files`, `settings`
- `memory_items` (Stores records for Project, System, Research, and Interaction brains)
- `system_tools` (Installed tools, versions, paths)
- `research_notes` (Stored external knowledge)
- `activity_logs` (Audit trails)
- `agent_roles` (Defined agent capabilities)

## Safety Boundaries

- **Suggestion Mode**: The default mode. Sentinel reads data, generates plans, and suggests code, but never edits without permission.
- **Approval Gates**: File creation and CLI commands are previewed.
- **Read-Only System Checks**: The System Intelligence Scanner only runs `--version` commands.
- **No Uploads**: No code or personal data is uploaded to external servers.

## Voice Companion Layer

Sentinel Core uses browser speech recognition for MVP speech-to-text and browser speech synthesis for text-to-speech. Wake word detection is intentionally disabled unless a future version adds explicit opt-in.
