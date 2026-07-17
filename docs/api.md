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

## Intelligence Engine

All Intelligence Engine data is stored locally. Online intelligence is disabled by default and refresh is manual in the current MVP.

### Status and onboarding

- `GET /api/intelligence/status`
- `GET /api/intelligence/online-status`
- `GET /api/intelligence/onboarding/status`
- `POST /api/intelligence/onboarding/complete`
- `POST /api/intelligence/onboarding/skip`

### Permissions and sources

- `GET /api/intelligence/permissions`
- `PATCH /api/intelligence/permissions`
- `GET /api/intelligence/sources`

Supported permission keys are `online_intelligence_enabled`, `first_run_completed`, `system_scan_allowed`, `project_scan_allowed`, `adaptive_memory_enabled`, `scheduled_refresh_enabled`, `refresh_frequency`, `allowed_sources`, and `offline_cache_enabled`.

### Refresh and cache

- `POST /api/intelligence/refresh`
- `GET /api/intelligence/refresh/history`
- `GET /api/intelligence/items`
- `POST /api/intelligence/items`
- `GET /api/intelligence/items/{item_id}`
- `GET /api/intelligence/search?query=...`
- `DELETE /api/intelligence/items/{item_id}`
- `DELETE /api/intelligence/cache/clear`

`GET /api/intelligence/items` supports `query`, `category`, `source_type`, `memory_domain`, `freshness`, `project_id`, and `limit` query parameters.

Example manual refresh request:

```json
{
  "project_id": "optional-project-id",
  "triggered_by": "user"
}
```

The refresh is blocked unless the offline cache is enabled, online intelligence is enabled, and connectivity can be confirmed.

### Adaptive memory

- `GET /api/intelligence/adaptive/preferences`
- `POST /api/intelligence/adaptive/signal`
- `DELETE /api/intelligence/adaptive/preferences/{preference_id}`

Signals are accepted only while adaptive memory is enabled. The service is designed for non-sensitive preferences such as model choice, approved actions, framework preference, and workflow patterns.
