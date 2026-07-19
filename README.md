# LocalSentinel AI

**Local-First Intelligent Development Companion**

LocalSentinel AI is a local-first agentic coding command center that helps developers understand, build, debug, research, prioritize, and manage software projects using local AI models, RAG-based memory, system awareness, sentiment-aware prioritization, IDE integration, activity tracking, and the SentinelCore companion interface.

## Features

- **React + TypeScript Dashboard**: A premium, futuristic dark command-center UI.
- **FastAPI Backend**: A robust central intelligence layer connecting all systems.
- **Ollama Integration**: Seamless integration with local models like Qwen Coder and DeepSeek Coder, with fallback routing capabilities.
- **Multi-Domain Memory System**: Segmented memory modules including Project Brain, User Work Brain, System Brain, Research Brain, and Interaction Brain.
- **System Intelligence Scanner**: Automatically detects local developer tools, checks versions, and evaluates system readiness without destructive commands.
- **Research Center**: Ask SentinelCore to analyze external documentation or perform offline local knowledge retrieval.
- **Activity Console**: A transparent timeline tracking agent decisions, project scans, system checks, and feedback analysis.
- **Agent Map**: A unified dashboard displaying the active specialized AI modules (Code Reviewer, Frontend Agent, Security Auditor, etc.).
- **Enhanced SentinelCore Companion**: A voice and visual companion with selectable operational modes: *Think Mode, Research Mode, Code Mode, Companion Mode, System Mode*.
- **Intent Routing**: Smart request analysis that securely handles standard system queries without unnecessarily blocking on the LLM.
- **VADER Sentiment Analysis**: Prioritizes user feedback based on sentiment, urgency, and crash reporting keywords.
- **Project Scanning & Creation**: Generates new project scaffolding and scans existing local codebases.
- **Safe Executor**: Preview and approval gates for any file modifications or terminal commands.
- **Local RAG Indexing**: Persistent project indexing using lightweight SQLite and ChromaDB abstractions.
- **Intelligence Engine**: Permission-based public development knowledge cache with source URLs, dates, offline retrieval, and manual refresh history.
- **Adaptive Local Memory**: Optional local learning from non-sensitive approvals, rejections, model selections, and workflow signals.
- **Teams Hierarchy Drawer**: Click an agent in Teams Hierarchy to open its details in a collapsible panel that slides in from the right.

## Architecture

```txt
localsentinel-ai/
  apps/
    web/               React + TypeScript + Vite frontend
    api/               FastAPI backend
    vscode-extension/  Future VS Code integration structure
  packages/
    shared/            Shared constants
  data/
    projects/          Reserved local project workspace
    vector_store/      Local RAG indexes
    sqlite/            SQLite metadata and memory databases
  docs/                Product and API documentation
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

**Pick a model that fits your RAM.** Because models run on your own machine
(on the CPU if you have no dedicated GPU), an oversized model will swap to disk
and freeze the system. Match the model to your available memory:

| Available RAM | No dedicated GPU | Recommended model | Approx. RAM in use |
| --- | --- | --- | --- |
| 8 GB or less | yes | `qwen2.5-coder:1.5b` | ~1.5 GB |
| 8–12 GB | yes | `qwen2.5-coder:3b` | ~2.3 GB |
| 12–20 GB | either | `qwen2.5-coder:7b` | ~5.5 GB |
| 20 GB+ / GPU | either | `qwen2.5-coder:14b` | ~10 GB |

```bash
# Low-RAM / CPU-only machines (safe default)
ollama pull qwen2.5-coder:1.5b

# For RAG embeddings (tiny, ~275 MB)
ollama pull nomic-embed-text
```

> Note: 7B/8B models such as `deepseek-coder:6.7b` and `llama3:8b` need roughly
> 5–6 GB of free RAM and are slow on CPU-only hardware. Avoid them on machines
> with 8 GB or less. The Models page shows a recommendation sized to your RAM.

Use the Models page or settings to select and test the active coding and fast reasoning models.

## How to Use

1. **Dashboard**: View overall project health, active models, and recent plans.
2. **Projects**: Start a new project or scan an existing local directory.
3. **Project Brain**: View stored memories, architecture decisions, and summaries specific to a project.
4. **System Intelligence**: Run a system scan to ensure tools like Node, Docker, Git, and Python are detected.
5. **Research Center**: Save offline notes or trigger SentinelCore to summarize architectural ideas.
6. **Activity Console**: Review a timeline of all backend events and scans.
7. **SentinelCore**: Start a chat, engage Voice mode, and select operational states like "Think Mode" or "Code Mode".
8. **Intelligence Center**: Complete the first-run permission setup, review local cache status, run a manual refresh, manage sources, and clear cached knowledge or adaptive preferences.

## Safety Modes

- **Suggestion Mode (Default)**: Reads safe project files, analyzes code, summarizes projects, generates tasks, and prepares plans.
- SentinelCore never edits, deletes, installs, or commits code automatically without explicit approval.
- Destructive commands such as `rm -rf`, `git push`, deploy commands, publish commands, shutdown, reboot, and database drop/delete commands are permanently blocked.
- `.env`, private key names, secrets, ignored build folders, and dependency folders are never indexed.
- Online intelligence is disabled until the user opts in. Scheduled refresh is stored as a preference but does not run in the background in this MVP.
- Local project code is not sent to external services by the Intelligence Engine.

## Known Limitations

- RAG writes a lightweight JSON index and relies on ChromaDB abstractions (ensure Chroma is available for deep dense retrieval).
- Manual intelligence refresh currently saves a curated, source-attributed public knowledge catalog; live website fetching and arbitrary web search are not implemented yet.
- Voice mode relies on browser APIs. Unsupported browsers fall back to text.
- Agent routing relies on the intent engine; complex multi-agent orchestration is planned for a future update.

## Future Roadmap

- Deep Research capabilities with active online scraping.
- Scheduled refresh worker with visible next-run status and opt-in source fetching.
- Per-project stack detection for richer project-specific intelligence refreshes.
- Full autonomous agent execution loops (Approval Mode & Autonomous Mode).
- Complete VS Code Side Panel and Continue.dev integration.
- Desktop CLI / Tauri Wrapper.
- Whisper.cpp and Piper/Coqui for entirely local, offline wake-word voice detection.
