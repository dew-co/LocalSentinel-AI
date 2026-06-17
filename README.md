# LocalSentinel AI

**Local-First Agentic Coding Assistant with Sentiment-Aware Development Prioritization**

LocalSentinel AI is a practical MVP for a local-first coding assistant. It can create starter projects, scan existing codebases, chat with local Ollama models, index project context for RAG, analyze client feedback with VADER sentiment, generate development priority signals, and plan approved agent actions.

The assistant visual is named **Sentinel Core**.

## Features

- React + TypeScript dashboard with a futuristic dark command-center UI.
- FastAPI backend with the required health, model, project, RAG, chat, agent, sentiment, and voice endpoints.
- Ollama status detection, model listing, model selection, pull approval, and model smoke tests.
- Project creation for React/Vite, React/Firebase placeholder, FastAPI, full-stack React/FastAPI, and static starters.
- Existing project scanner with stack, language, dependency, package manager, README, and important file detection.
- Local RAG indexing stored under `data/vector_store`.
- SQLite metadata and project memory under `data/sqlite`.
- VADER sentiment analysis with priority rules for urgent development work.
- Agent planner that creates structured safe plans before changes.
- Safe executor with preview and approval gates.
- Browser voice input and speech synthesis MVP.
- Sentinel Core voice companion layer with Listening, Thinking, Speaking, and Ready states.
- Assistant settings for voice mode, assistant tone, response length, and voice-memory summaries.
- Placeholder VS Code extension structure and Continue compatibility documentation.

## Architecture

```txt
localsentinel-ai/
  apps/
    web/
    api/
    vscode-extension/
  packages/
    shared/
  data/
    projects/
    vector_store/
    sqlite/
  docs/
```

## Backend Setup

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Windows:

```bash
.venv\Scripts\activate
```

The backend runs at `http://localhost:8000`.

## Frontend Setup

```bash
cd apps/web
npm install
npm run dev
```

The dashboard runs at `http://localhost:5173`.

## Ollama Setup

Install and start Ollama locally. LocalSentinel AI checks:

```txt
http://localhost:11434
```

Recommended model options:

```bash
ollama pull qwen2.5-coder:7b
ollama pull deepseek-coder:6.7b
ollama pull qwen2.5-coder:1.5b
```

Use the Models page to select and test the active model.

## Running the App

Terminal 1:

```bash
cd apps/api
source .venv/bin/activate
uvicorn main:app --reload
```

Terminal 2:

```bash
cd apps/web
npm run dev
```

Open `http://localhost:5173`.

## Safety Modes

- The chat endpoint answers and plans; it does not edit files.
- Sentinel Core uses friendly, practical assistant language without claiming consciousness, emotions, or human identity.
- Agent execution requires preview and explicit approval.
- Destructive commands such as `rm -rf`, `git push`, deploy commands, publish commands, shutdown, reboot, and database drop/delete commands are blocked.
- Safe commands are still approval-gated.
- `.env`, private key names, secrets, ignored build folders, and dependency folders are not indexed.
- Online documentation updates are disabled by default.

## Known Limitations

- RAG writes a lightweight JSON index and mirrors into ChromaDB when the dependency is installed and available.
- Voice uses browser APIs; unsupported browsers fall back to text chat.
- Voice summaries are stored in project memory only when enabled and a project is active.
- The VS Code extension is a placeholder structure.
- Agent execution is intentionally narrow and allowlisted.
- Model quality depends on the local Ollama model and machine resources.

## Roadmap

- Add diff-based file modification previews.
- Add file watching and auto-indexing.
- Add richer ChromaDB embedding support with fully local embedding models.
- Implement a Tauri wrapper.
- Build the VS Code side panel.
- Add Continue context-provider experiments.
- Add Whisper.cpp and Piper or Coqui for fully local voice.
- Add multilingual voice support and explicit opt-in wake word detection.
- Add test suites for backend services and frontend components.
