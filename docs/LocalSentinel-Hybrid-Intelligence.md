You are a senior local AI systems engineer, Genkit engineer, Firebase engineer, FastAPI backend engineer, React TypeScript frontend engineer, RAG engineer, and privacy-first AI product architect.

Modify and enhance my existing project:

# LocalSentinel AI

## Local-First Intelligent Development Companion

LocalSentinel AI currently focuses on local-first AI coding assistance using Ollama, local RAG memory, system intelligence, project scanning, SentinelCore, Activity Console, Project Brain, Research Center, VADER sentiment analysis, and safe suggestion-mode workflows.

Now enhance LocalSentinel AI with a hybrid intelligence system:

# LocalSentinel Hybrid Intelligence Layer

The goal is to keep Ollama as the default local/offline coding brain, add Genkit as the AI orchestration and model-routing layer, and optionally use Firebase AI Logic / Gemini for online cloud intelligence when the user explicitly enables it.

Do not fully replace Ollama.
Do not remove existing Ollama functionality.
Do not break existing local-first behavior.
Do not send private project code to cloud providers unless the user explicitly enables cloud code analysis.

---

# 1. Core Architecture

Implement this architecture:

```txt
LocalSentinel AI Core
├── FastAPI Backend
├── Local RAG Database
├── Project Brain
├── System Brain
├── Research Brain
├── User Work Brain
├── Interaction Brain
├── Ollama Local Provider
├── Genkit AI Gateway
│   ├── Ollama Provider
│   ├── Google GenAI / Gemini Provider
│   └── Future Provider Interface
├── Firebase AI Logic Optional Client Layer
├── Hybrid Model Router
├── Privacy Gate
├── Cloud Permission Manager
├── Intelligence Cache
└── SentinelCore Companion
```

Recommended implementation approach:

* Keep FastAPI as the main LocalSentinel backend.
* Add a new TypeScript Genkit gateway service in:

```txt
apps/ai-gateway/
```

* FastAPI should call the Genkit gateway through local HTTP endpoints.
* The frontend should continue calling FastAPI, not the Genkit gateway directly.
* Genkit gateway should handle model orchestration and provider routing.
* Ollama remains the default provider.
* Gemini / Firebase AI Logic is optional and disabled by default.

---

# 2. New Provider Strategy

Add these intelligence modes:

## A. Offline Mode

Use only:

```txt
Ollama
Local RAG
SQLite/local database
Project Brain
System Brain
VADER/local rules
```

No cloud calls.

## B. Hybrid Mode

Default recommended mode.

Use:

```txt
Ollama first
Local RAG first
Gemini/Google provider only for online research, summaries, and non-private reasoning
```

Cloud usage must require permission.

## C. Cloud Boost Mode

Use Gemini/Google provider for advanced reasoning, research, multimodal tasks, or fallback when local models are weak.

Must show clear warning:

```txt
Cloud Boost Mode may send selected prompt content to an online provider. Private project code is blocked unless you explicitly allow cloud code analysis.
```

## D. Privacy Lock Mode

Strict local-only mode.

Use:

```txt
Ollama only
Local database only
No cloud provider
No online research
No Firebase AI Logic
No Genkit cloud model calls
```

---

# 3. Genkit Gateway

Create a new service:

```txt
apps/ai-gateway/
```

Use:

```txt
TypeScript
Node.js
Genkit
Ollama plugin
Google GenAI / Gemini plugin if configured
Express or lightweight HTTP server
```

Suggested structure:

```txt
apps/ai-gateway/
  src/
    index.ts
    genkit.ts
    providers/
      ollamaProvider.ts
      googleProvider.ts
    flows/
      chatFlow.ts
      researchFlow.ts
      codePlanFlow.ts
      summarizeFlow.ts
      embedFlow.ts
    services/
      privacyGate.ts
      providerRouter.ts
      promptRedactor.ts
      sourceLogger.ts
    types/
      aiGatewayTypes.ts
  package.json
  tsconfig.json
  .env.example
```

The Genkit gateway should expose local endpoints:

```txt
GET /health
GET /providers
POST /route
POST /chat
POST /research
POST /code-plan
POST /summarize
POST /embed
```

Example request:

```json
{
  "task_type": "code_plan",
  "mode": "hybrid",
  "provider_preference": "auto",
  "allow_cloud": false,
  "allow_private_code_cloud": false,
  "project_context": "...",
  "user_prompt": "Create a plan to add role-based access"
}
```

Example response:

```json
{
  "provider_used": "ollama",
  "model_used": "qwen2.5-coder:latest",
  "cloud_used": false,
  "privacy_filtered": true,
  "response": "...",
  "sources": [],
  "latency_ms": 1240
}
```

---

# 4. Provider Router Logic

Create a hybrid provider routing system.

Routing rules:

```txt
model_status              -> FastAPI/local direct check
system_scan               -> FastAPI local system scanner
feedback_analysis         -> VADER/local priority engine
project_scan              -> local project scanner
memory_query              -> local RAG/database
simple_project_question   -> local RAG + Ollama
coding_plan               -> Ollama Qwen/DeepSeek by default
code_review               -> Ollama only by default
private_code_analysis     -> Ollama only unless user explicitly enables cloud code analysis
online_research           -> Genkit + Gemini if online intelligence is enabled
public_docs_summary       -> Genkit + Gemini if enabled
complex_reasoning         -> Ollama first, Gemini fallback if allowed
multimodal_future         -> Firebase AI Logic / Gemini if enabled
```

Default routing behavior:

```txt
Local first.
Cloud only when enabled.
Private code blocked from cloud by default.
All cloud usage logged.
All cloud usage visible to user.
```

---

# 5. Privacy Gate

Add a privacy gate before any cloud call.

Create:

```txt
apps/ai-gateway/src/services/privacyGate.ts
```

The privacy gate should detect and block:

```txt
.env contents
API keys
tokens
passwords
private keys
secret strings
database URLs
project source code if cloud code analysis is disabled
private file paths if unnecessary
personal information if not needed
```

If blocked, return:

```txt
This request contains private project or secret-like content. Cloud routing was blocked. I will use the local Ollama model instead.
```

Never silently send blocked content to Gemini/Firebase.

---

# 6. FastAPI Backend Integration

Keep FastAPI as the main API used by the frontend.

Add or update backend service:

```txt
apps/api/services/hybrid_ai_service.py
```

Responsibilities:

```py
check_gateway_status()
list_providers()
route_ai_request()
call_local_ollama_direct_if_gateway_unavailable()
call_genkit_gateway()
log_provider_usage()
save_response_to_activity_console()
save_useful_summary_to_memory()
```

Add backend endpoints:

```txt
GET /api/hybrid/status
GET /api/hybrid/providers
POST /api/hybrid/route
POST /api/hybrid/chat
POST /api/hybrid/research
POST /api/hybrid/code-plan
GET /api/hybrid/usage
```

FastAPI should fallback to existing Ollama service if Genkit gateway is offline.

Fallback behavior:

```txt
Genkit gateway unavailable.
Using direct Ollama local provider.
```

---

# 7. Database Additions

Add tables if missing.

## ai_providers

Fields:

```txt
id
provider_name
provider_type
enabled
local_only
base_url
default_model
status
last_checked_at
metadata_json
```

Provider examples:

```txt
ollama
google_genai
firebase_ai_logic
openai_compatible_future
```

## ai_routing_logs

Fields:

```txt
id
task_type
provider_used
model_used
mode
cloud_used
privacy_filtered
latency_ms
success
error_message
created_at
metadata_json
```

## cloud_permission_settings

Fields:

```txt
id
setting_key
setting_value
updated_at
```

Settings:

```txt
hybrid_mode_enabled
cloud_boost_enabled
privacy_lock_enabled
allow_online_research
allow_cloud_code_analysis
allow_firebase_ai_logic
allow_google_genai
default_ai_mode
```

## intelligence_cache

Preserve or connect with existing Intelligence Engine.

Fields:

```txt
id
title
summary
content
source_type
source_url
provider_used
model_used
memory_domain
tags_json
created_at
updated_at
last_used_at
```

---

# 8. Frontend Updates

Update LocalSentinel AI UI.

## A. Model Settings Page

Add a new section:

# Hybrid AI Providers

Show:

```txt
Ollama Local Provider
Genkit Gateway
Google GenAI / Gemini
Firebase AI Logic
```

Each provider card should show:

```txt
enabled/disabled
online/offline
base URL
active model
last checked
test button
privacy status
```

Add mode selector:

```txt
Privacy Lock Mode
Offline Mode
Hybrid Mode
Cloud Boost Mode
```

Default selected mode:

```txt
Hybrid Mode, but cloud disabled until user enables it
```

## B. SentinelCore Chat

SentinelCore should show:

```txt
Provider used
Model used
Cloud used: yes/no
Privacy filter: applied/not needed
Response speed
Memory used
```

If cloud was blocked:

```txt
Cloud routing blocked by Privacy Gate. Using local Ollama instead.
```

## C. Intelligence Center

Enhance Intelligence Center with:

```txt
Online intelligence provider
Genkit gateway status
Gemini provider status
Firebase AI Logic status
Local cache status
Last online refresh
Cloud permission status
```

## D. Research Center

Add provider selector:

```txt
Auto
Local only
Gemini online research
```

Add checkbox:

```txt
Save result to Local Intelligence Cache
```

## E. Activity Console

Log all hybrid AI events:

```txt
Genkit gateway checked
Provider selected
Cloud provider used
Cloud request blocked
Ollama fallback used
Research saved to cache
Hybrid route completed
```

---

# 9. Firebase AI Logic Role

Do not make Firebase AI Logic the default backend brain.

Use Firebase AI Logic as an optional future-facing provider for:

```txt
web/mobile AI features
Gemini direct client SDK integration
multimodal assistant features
cloud chat mode
future mobile LocalSentinel companion app
```

In current LocalSentinel AI web dashboard, prefer server-side Genkit routing for safer provider control.

If Firebase AI Logic is added in frontend, keep it behind explicit setting:

```txt
Enable Firebase AI Logic client features
```

Show warning:

```txt
Firebase AI Logic calls Gemini through Firebase client SDKs. Use this only for approved cloud features. Private project code remains local unless cloud code analysis is explicitly enabled.
```

---

# 10. Environment Variables

Add `.env.example` files.

## apps/ai-gateway/.env.example

```env
PORT=8787
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_LOCAL_MODEL=qwen2.5-coder:latest
BACKUP_LOCAL_MODEL=deepseek-coder:latest

GOOGLE_GENAI_API_KEY=
GOOGLE_GENAI_MODEL=gemini-2.5-flash

ENABLE_GOOGLE_GENAI=false
ENABLE_FIREBASE_AI_LOGIC=false
ALLOW_CLOUD_CODE_ANALYSIS=false
```

## apps/api/.env.example additions

```env
AI_GATEWAY_URL=http://localhost:8787
HYBRID_AI_ENABLED=true
DEFAULT_AI_MODE=hybrid
ALLOW_ONLINE_RESEARCH=false
ALLOW_CLOUD_CODE_ANALYSIS=false
```

Never commit real API keys.

---

# 11. README Updates

Update README with:

```txt
Hybrid AI architecture
Why Ollama remains default
What Genkit does
What Firebase AI Logic does
How to run Genkit gateway
How to enable Google GenAI/Gemini
How privacy modes work
How cloud blocking works
How to test Ollama fallback
How to test hybrid mode
How to test cloud boost mode
```

Add run commands:

```bash
# API
cd apps/api
uvicorn main:app --reload --port 8000

# Web
cd apps/web
npm run dev

# AI Gateway
cd apps/ai-gateway
npm install
npm run dev

# Ollama
ollama serve
ollama pull qwen2.5-coder
```

---

# 12. Safety Requirements

Strict rules:

1. Ollama must remain available as local default.
2. Cloud providers disabled by default.
3. Private project code must not go to cloud unless explicitly enabled.
4. `.env` contents must never be read or sent.
5. Cloud usage must be visible in UI.
6. Every AI response should show provider/model metadata where possible.
7. Genkit gateway failure must not break local mode.
8. User can switch to Privacy Lock Mode anytime.
9. All provider calls must be logged in Activity Console.
10. All settings must be user-editable.

---

# 13. Acceptance Criteria

This enhancement is complete when:

1. Ollama local provider still works.
2. Genkit gateway service exists.
3. FastAPI can call the Genkit gateway.
4. FastAPI falls back to direct Ollama if gateway fails.
5. Hybrid provider settings exist in UI.
6. Privacy Lock, Offline, Hybrid, and Cloud Boost modes exist.
7. Google/Gemini provider is optional and disabled by default.
8. Firebase AI Logic is documented as optional/future client provider.
9. Private code is blocked from cloud by default.
10. Activity Console logs provider routing.
11. SentinelCore shows provider/model/cloud metadata.
12. Research Center can use online provider only when enabled.
13. Intelligence Cache can save useful online results locally.
14. Existing pages and APIs still work.
15. README explains the new hybrid system.

---

# 14. Final Report

When complete, report:

1. Files inspected.
2. Files changed.
3. New services added.
4. Genkit gateway structure.
5. Backend endpoints added.
6. Database tables added.
7. UI pages updated.
8. How to run Ollama.
9. How to run FastAPI.
10. How to run Genkit gateway.
11. How to run frontend.
12. How to test local-only mode.
13. How to test hybrid mode.
14. How to test cloud-blocking privacy gate.
15. Known limitations.
16. Recommended next improvements.
