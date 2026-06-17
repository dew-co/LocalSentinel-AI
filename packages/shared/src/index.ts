export const PRODUCT_NAME = "LocalSentinel AI";
export const PRODUCT_SUBTITLE = "Local-First Agentic Coding Assistant with Sentiment-Aware Development Prioritization";
export const ASSISTANT_NAME = "Sentinel Core";

export const DEFAULT_SETTINGS = {
  ollamaBaseUrl: "http://localhost:11434",
  safeMode: true,
  voiceMode: true,
  ragEnabled: true,
  autoIndex: false,
  autoInstallModels: false,
  onlineDocs: false,
  voiceMemory: true,
  assistantTone: "friendly",
  responseLength: "balanced"
} as const;

export const SAFE_COMMANDS = [
  "npm install",
  "npm run dev",
  "npm run build",
  "pip install -r requirements.txt",
  "python main.py",
  "uvicorn main:app --reload",
  "git status",
  "git diff"
] as const;
