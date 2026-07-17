# LocalSentinel Intelligence Engine

## Status

Implemented as a permission-based, local-first knowledge cache. It improves offline responses and provides transparent cache management without uploading local project code or silently starting online/background work.

## User Flow

```txt
First run -> permission setup -> optional read-only system scan
         -> optional manual refresh -> local SQLite cache -> Project Brain / RAG link
         -> cached context for SentinelCore and offline use
```

The first-run modal offers recommended setup, custom permissions, and skip. All settings are persisted in SQLite. The default is conservative: online intelligence, system scans, project scans, adaptive memory, and scheduled refresh are off; offline cache is local and enabled; refresh frequency is manual.

## Privacy Boundaries

- No whole-computer scan is started automatically.
- System scans are read-only and require permission.
- Project-linked intelligence is permission-gated and scoped to selected project metadata.
- `.env` contents, credentials, private keys, passwords, and tokens are not read or stored by this feature.
- The Intelligence Engine does not upload local project code.
- Online intelligence must be enabled explicitly. The user can delete individual items, clear the cache, disable online intelligence, and disable adaptive memory.
- Activity Console records setup, refresh, cache, permission, and adaptive-memory events.

## Refresh Behavior

Manual refresh requires all of the following:

- `online_intelligence_enabled` is true.
- `offline_cache_enabled` is true.
- The short online-status check succeeds.

Refresh saves structured, source-attributed entries to the local database and logs a refresh run. Current refresh content is a curated built-in catalog referencing trusted public documentation such as React, TypeScript, Vite, FastAPI, Docker, Ollama, OWASP, and database documentation. It selects project-relevant entries when an allowed project context is supplied.

This is deliberately not a live crawler or arbitrary internet searcher yet. The source URL and freshness timestamp make cache provenance visible without presenting the catalog as real-time research.

## Stored Data

| Table | Purpose |
| --- | --- |
| `intelligence_items` | Cached summaries, source metadata, tags, freshness, project link, and usage counters. |
| `intelligence_sources` | Trusted source catalog and allowed source categories. |
| `intelligence_refresh_runs` | Manual refresh history, counts, status, errors, and trigger. |
| `user_activity_signals` | Non-sensitive opt-in activity signals. |
| `adaptive_preferences` | User-editable preference records derived from signals. |
| `consent_settings` | Permission and refresh settings. |

Memory domains include Project Brain, User Work Brain, System Brain, Research Brain, Interaction Brain, Model Brain, Package Brain, Framework Brain, and Error Solution Brain.

## Retrieval and Offline Use

The chat flow checks cache context before sending a compact prompt to Ollama. Cache reads update `use_count` and `last_used_at`. SentinelCore handles direct local requests such as saved intelligence, offline-only knowledge, refresh requests, stale knowledge, local system summary, and preferred technologies. When offline or online intelligence is disabled, it identifies cached data as local and may show the last refresh date.

For simple local questions, existing routers can respond without an LLM, for example model/system status and known project information.

## API Summary

The API is available under `/api/intelligence`:

- Status/onboarding: `/status`, `/online-status`, `/onboarding/status`, `/onboarding/complete`, `/onboarding/skip`
- Permissions/sources: `/permissions`, `/sources`
- Cache/refresh: `/refresh`, `/refresh/history`, `/items`, `/search`, `/cache/clear`
- Adaptive memory: `/adaptive/preferences`, `/adaptive/signal`

See [API documentation](api.md) for methods, parameters, and complete endpoint names.

## Interface Surfaces

- **First-Time Intelligence Setup**: consent choices and privacy explanation.
- **Intelligence Center**: status badges, permissions, source categories, cache items, refresh history, adaptive preferences, and deletion controls.
- **Research Center**: saves user research to the local intelligence cache.
- **System Intelligence**: stores permitted developer-tool scan information in System Brain/cache.
- **Project Brain**: displays project-linked intelligence alongside project memory.
- **Activity Console**: displays intelligence-related audit events.
- **SentinelCore**: understands cache, offline, refresh, stale-content, system, project, and preference questions.

## Current Limitations and Next Steps

- Scheduled frequency preferences are stored but no background scheduler runs yet.
- Refresh uses curated templates, not live retrieval or page extraction.
- Project-specific refresh is based on project stack metadata, not source-code upload or cloud analysis.
- Future work should add opt-in live source fetchers, per-source freshness policies, scheduler execution with visible controls, cache relevance ranking, and tests for consent/refresh/cache behavior.
