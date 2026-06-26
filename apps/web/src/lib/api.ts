import type {
  AdaptivePreference,
  AgentPlan,
  ChatRequestPayload,
  ChatResponse,
  IntelligenceItem,
  IntelligencePermissions,
  IntelligenceStatus,
  ModelInfo,
  ModelStatus,
  ProjectRecord,
  ProjectScan,
  SentimentResult
} from "../types/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options
  });
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.detail ?? JSON.stringify(body);
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; safeMode: boolean; ragEnabled: boolean }>("/health"),
  modelStatus: () => request<ModelStatus>("/models/status"),
  models: () => request<ModelInfo[]>("/models/available"),
  selectModel: (model: string) => request<{ activeModel: string }>("/models/select", { method: "POST", body: JSON.stringify({ model }) }),
  pullModel: (model: string, approved = false) => request("/models/pull", { method: "POST", body: JSON.stringify({ model, approved }) }),
  testModel: (model?: string) => request<{ ok: boolean; response: string; message: string }>("/models/test", { method: "POST", body: JSON.stringify({ model }) }),
  projects: () => request<ProjectRecord[]>("/projects"),
  project: (id: string) => request<ProjectRecord>(`/projects/${id}`),
  createProject: (payload: unknown) => request<{ project: ProjectRecord; createdFiles: string[]; fileTree: string[]; message: string }>("/projects/create", { method: "POST", body: JSON.stringify(payload) }),
  scanProject: (path: string) => request<ProjectScan>("/projects/scan", { method: "POST", body: JSON.stringify({ path }) }),
  indexProject: (payload: { projectId?: string; path?: string }) => request<{ projectId: string; chunksIndexed: number; path: string }>("/rag/index", { method: "POST", body: JSON.stringify(payload) }),
  ragStatus: () => request<{ enabled: boolean; totalChunks: number; projects: { projectId: string; root: string; chunks: number }[] }>("/rag/status"),
  ragQuery: (query: string, projectId?: string) => request<{ matches: { filePath: string; score: number; preview: string }[] }>("/rag/query", { method: "POST", body: JSON.stringify({ query, projectId }) }),
  addMemory: (projectId: string, content: string, tags: string[] = []) => request("/rag/memory/add", { method: "POST", body: JSON.stringify({ projectId, content, tags }) }),
  listMemory: (projectId?: string) => request<{ id: string; projectId: string; content: string; tags: string[]; createdAt: string }[]>(`/rag/memory/list${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`),
  chat: (payload: ChatRequestPayload) => request<ChatResponse>("/chat", { method: "POST", body: JSON.stringify(payload) }),
  plan: (goal: string, projectId?: string) => request<AgentPlan>("/agent/plan", { method: "POST", body: JSON.stringify({ goal, projectId }) }),
  preview: (payload: unknown) => request<{ requiresApproval: boolean; warnings: string[]; commands: unknown[]; fileOperations: unknown[] }>("/agent/preview", { method: "POST", body: JSON.stringify(payload) }),
  execute: (payload: unknown) => request("/agent/execute", { method: "POST", body: JSON.stringify(payload) }),
  sentiment: (text: string) => request<SentimentResult>("/sentiment/analyze", { method: "POST", body: JSON.stringify({ text }) }),
  voiceStatus: () => request<{ browserSpeechRecognition: boolean; message: string }>("/voice/status"),
  intelligenceStatus: () => request<IntelligenceStatus>("/api/intelligence/status"),
  intelligenceOnlineStatus: () => request<{ online: boolean; checked_at: string; message: string }>("/api/intelligence/online-status"),
  intelligenceOnboardingStatus: () => request<{ first_run_completed: boolean; permissions: IntelligencePermissions }>("/api/intelligence/onboarding/status"),
  completeIntelligenceOnboarding: (permissions: Partial<IntelligencePermissions>) =>
    request("/api/intelligence/onboarding/complete", { method: "POST", body: JSON.stringify({ permissions }) }),
  skipIntelligenceOnboarding: () => request("/api/intelligence/onboarding/skip", { method: "POST" }),
  intelligencePermissions: () => request<{ permissions: IntelligencePermissions; source_categories: string[]; memory_domains: string[] }>("/api/intelligence/permissions"),
  updateIntelligencePermissions: (payload: Partial<IntelligencePermissions>) =>
    request<{ permissions: IntelligencePermissions }>("/api/intelligence/permissions", { method: "PATCH", body: JSON.stringify(payload) }),
  intelligenceSources: () => request<{ sources: unknown[]; categories: string[] }>("/api/intelligence/sources"),
  refreshIntelligence: (projectId?: string) =>
    request("/api/intelligence/refresh", { method: "POST", body: JSON.stringify({ project_id: projectId, triggered_by: "user" }) }),
  intelligenceRefreshHistory: () => request<{ history: unknown[] }>("/api/intelligence/refresh/history"),
  intelligenceItems: (params: Record<string, string | number | undefined> = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") search.set(key, String(value));
    });
    return request<{ items: IntelligenceItem[]; stats: unknown }>(`/api/intelligence/items${search.toString() ? `?${search}` : ""}`);
  },
  saveIntelligenceItem: (payload: Partial<IntelligenceItem> & { title: string }) =>
    request<{ item: IntelligenceItem }>("/api/intelligence/items", { method: "POST", body: JSON.stringify(payload) }),
  searchIntelligence: (query: string) => request<{ items: IntelligenceItem[] }>(`/api/intelligence/search?query=${encodeURIComponent(query)}`),
  deleteIntelligenceItem: (id: string) => request(`/api/intelligence/items/${id}`, { method: "DELETE" }),
  clearIntelligenceCache: () => request<{ status: string; removed: number }>("/api/intelligence/cache/clear", { method: "DELETE" }),
  adaptivePreferences: () => request<{ preferences: AdaptivePreference[]; enabled: boolean }>("/api/intelligence/adaptive/preferences"),
  adaptiveSignal: (payload: unknown) => request("/api/intelligence/adaptive/signal", { method: "POST", body: JSON.stringify(payload) }),
  deleteAdaptivePreference: (id: string) => request(`/api/intelligence/adaptive/preferences/${id}`, { method: "DELETE" })
};

export { API_URL };
