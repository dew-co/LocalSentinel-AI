# Project Progress

Last updated: 2026-07-17

## Completed

- Local-first React, TypeScript, FastAPI, SQLite, Ollama, RAG, Project Brain, System Intelligence, Research Center, Activity Console, Model Router, Intent Router, Safe Executor, VADER sentiment analysis, and SentinelCore workflows.
- Intelligence Engine with first-run consent, online-status check, manual refresh, source-attributed local cache, cache search/filter/delete, adaptive preferences, Activity Console logging, and offline-aware SentinelCore context.
- Intelligence Center route and sidebar entry, plus integrations in Research Center, System Intelligence, Project Brain, Activity Console, Settings, and chat.
- Teams Hierarchy right-side agent-details drawer that opens on node click, collapses, and reopens for the selected agent.

## In Progress / MVP Constraints

- Online refresh is manual and uses curated public-knowledge templates with trusted source URLs.
- Frequency preferences are persisted, but daily/weekly/monthly background jobs are not implemented.
- Live search, direct document fetching, cloud model routing, Genkit gateway, Firebase AI Logic, and Gemini integration are design work rather than shipped functionality.

## Recommended Next Work

- Add automated backend tests for consent transitions, blocked refreshes, cache retrieval, and adaptive-memory opt-out.
- Add opt-in source fetch adapters with per-source rate limits, extraction rules, freshness policies, and visible activity logs.
- Implement a scheduler only after a reliable user-visible next-run and pause/cancel model is defined.
- Add UI tests for the first-run modal, Intelligence Center permission controls, and Teams Hierarchy drawer behavior.
