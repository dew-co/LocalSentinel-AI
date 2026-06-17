export type ModelStatus = {
  ollamaRunning: boolean;
  baseUrl: string;
  activeModel?: string | null;
  availableCount: number;
  recommendedModel?: string | null;
  message: string;
};

export type ModelInfo = {
  name: string;
  size?: number | null;
  modifiedAt?: string | null;
};

export type ProjectRecord = {
  id: string;
  name: string;
  path: string;
  idea: string;
  stack: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectScan = {
  projectId: string;
  projectName: string;
  projectPath: string;
  detectedStack: string[];
  importantFiles: string[];
  fileTree: string[];
  summary: string;
  recommendations: string[];
};

export type SentimentResult = {
  sentiment: string;
  compoundScore: number;
  urgency: string;
  priority: string;
  detectedIssues: string[];
  recommendedAction: string;
};

export type AgentPlan = {
  goal: string;
  riskLevel: "low" | "medium" | "high";
  steps: string[];
  filesToRead: string[];
  filesToCreate: string[];
  filesToModify: string[];
  commandsNeeded: string[];
  requiresApproval: boolean;
};

export type ChatCitation = {
  filePath: string;
  score: number;
  preview: string;
};

export type ChatResponse = {
  answer: string;
  model?: string | null;
  citations: ChatCitation[];
  suggestedFiles: string[];
  safeActions: string[];
  memoryStored?: boolean;
};

export type ChatRequestPayload = {
  message: string;
  projectId?: string;
  useRag: boolean;
  model?: string;
  assistantTone?: "friendly" | "calm" | "concise" | "teacher";
  responseLength?: "brief" | "balanced" | "detailed";
  isVoice?: boolean;
  rememberVoice?: boolean;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
};
