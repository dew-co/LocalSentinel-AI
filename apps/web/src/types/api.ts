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

export type IntelligencePermissions = {
  online_intelligence_enabled: boolean;
  first_run_completed: boolean;
  system_scan_allowed: boolean;
  project_scan_allowed: boolean;
  adaptive_memory_enabled: boolean;
  scheduled_refresh_enabled: boolean;
  refresh_frequency: "manual" | "daily" | "weekly" | "monthly";
  allowed_sources: string[];
  offline_cache_enabled: boolean;
};

export type IntelligenceItem = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  memory_domain: string;
  source_type: string;
  source_url: string;
  source_name: string;
  confidence_level: string;
  freshness_date: string;
  expires_at?: string | null;
  tags_json?: string;
  tags?: string[];
  related_project_id?: string | null;
  created_at: string;
  updated_at: string;
  last_used_at?: string | null;
  use_count: number;
};

export type IntelligenceStatus = {
  online: boolean | null;
  online_intelligence_enabled: boolean;
  offline_cache_ready: boolean;
  last_refresh?: string | null;
  cached_items: number;
  stale_items: number;
  memory_domains: Record<string, number>;
  source_categories: Record<string, number>;
  permissions: IntelligencePermissions;
};

export type AdaptivePreference = {
  id: string;
  preference_key: string;
  preference_value: string;
  confidence: number;
  source: string;
  created_at: string;
  updated_at: string;
  user_editable: boolean;
};
