# Setup

## Backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Windows activation:

```bash
.venv\Scripts\activate
```

The API runs at `http://localhost:8000`.

## Frontend

```bash
cd apps/web
npm install
npm run dev
```

The dashboard runs at `http://localhost:5173`.

## Ollama

Install Ollama from `https://ollama.com`, start it locally, then pull a coding model after reviewing the size:

```bash
ollama pull qwen2.5-coder:7b
```

Useful alternatives:

```bash
ollama pull deepseek-coder:6.7b
ollama pull llama3:8b
```

LocalSentinel AI checks Ollama at `http://localhost:11434`.

## First-Run Intelligence Setup

On the first dashboard load, LocalSentinel opens the Intelligence Setup modal. Its conservative defaults keep online intelligence, system scanning, project-linked intelligence, and adaptive memory disabled. Offline cache storage is enabled locally, while refresh remains manual.

To test the flow:

1. Start the API and dashboard.
2. Open `http://localhost:5173`.
3. Choose **Customize Permissions**, or use **Enable Recommended Local Intelligence Setup**.
4. Open **Intelligence Center** from the sidebar to review the saved permissions and sources.

The recommended setup enables a read-only local developer-tool scan, manual online intelligence refresh, local cache storage, and adaptive memory. It does not enable background refresh.

## Manual Intelligence Refresh

1. In Intelligence Center, enable **Online intelligence** and leave **Offline cache** enabled.
2. Confirm the status badge reports online connectivity.
3. Select the refresh control.
4. Review the new cache items, their sources, freshness dates, and refresh history.

The MVP refresh uses a bundled curated catalog of public development guidance with trusted source URLs. It does not fetch arbitrary web pages, upload local files, or run background updates.

## Offline Cache Test

1. Run a successful manual refresh once.
2. Disconnect from the network or disable online intelligence.
3. Ask SentinelCore about saved intelligence, your system, a cached topic, or use the **Use offline knowledge only** phrasing.
4. LocalSentinel uses the SQLite cache, Project Brain links, local RAG, and Ollama where needed. Responses identify cached-information freshness instead of claiming real-time knowledge.

## Teams Hierarchy

Open **Teams Hierarchy** and click an agent node. Its details slide in from the right. Use the close control to collapse the drawer; the right-edge **Details** tab reopens it for the currently selected agent.
