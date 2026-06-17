# API

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

## RAG

- `POST /rag/index`
- `POST /rag/query`
- `GET /rag/status`
- `POST /rag/memory/add`
- `GET /rag/memory/list`

## Chat

- `POST /chat`

Example:

```json
{
  "message": "Explain this project",
  "projectId": "local-project-id",
  "useRag": true,
  "model": "qwen2.5-coder:7b"
}
```

## Agent

- `POST /agent/plan`
- `POST /agent/preview`
- `POST /agent/execute`

Execution requires `approved: true`; unsafe commands remain blocked.

## Sentiment

- `POST /sentiment/analyze`

## Voice

- `GET /voice/status`
- `GET /voice/engines`
- `GET /voice/settings/defaults`

The MVP uses browser speech recognition and speech synthesis.
