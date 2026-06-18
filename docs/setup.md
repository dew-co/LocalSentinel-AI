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

