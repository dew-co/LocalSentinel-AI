# API Endpoints

Base URL: `http://localhost:8000`

## Health

- `GET /health`

## Models

- `GET /models/status`
- `GET /models/available`
- `POST /models/select`
- `POST /models/pull`
- `POST /models/test`

## Projects

- `POST /projects/create`
- `POST /projects/scan`
- `GET /projects`
- `GET /projects/{project_id}`

## Multi-Domain Memory

- `GET /api/memory/project/{project_id}`
- `POST /api/memory/project/{project_id}`
- `GET /api/memory/search?query=...`
- `DELETE /api/memory/{memory_id}`

## System Intelligence

- `GET /api/system/status`
- `POST /api/system/scan`
- `GET /api/system/tools`
- `GET /api/system/readiness`

## Research Center

- `POST /api/research/query`
- `POST /api/research/save`
- `GET /api/research/history`
- `GET /api/research/{research_id}`
- `DELETE /api/research/{research_id}`

## Activity Console

- `GET /api/activity`
- `GET /api/activity/{project_id}`
- `POST /api/activity`
- `DELETE /api/activity/clear`

## Agent Roles

- `GET /api/agents/map`
- `GET /api/agents/status`
- `POST /agent/plan` (Legacy agent planner)
- `POST /agent/preview`
- `POST /agent/execute`

## RAG

- `POST /rag/index`
- `POST /rag/query`
- `GET /rag/status`
- `POST /rag/memory/add`
- `GET /rag/memory/list`

## Chat

- `POST /chat`

Chat requests are pre-processed by the Intent Router and Activity Logger before being handed to the Model Router and Ollama.

Example:
```json
{
  "message": "Check system environment",
  "projectId": "local-project-id",
  "useRag": false,
  "model": "qwen2.5-coder:7b"
}
```

## Sentiment

- `POST /sentiment/analyze`

## Voice

- `GET /voice/status`
- `GET /voice/engines`
- `GET /voice/settings/defaults`

The MVP uses browser speech recognition and speech synthesis.
