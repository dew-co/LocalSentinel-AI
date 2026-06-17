import type { AgentPlan, ChatRequestPayload, ChatResponse, ModelInfo, ModelStatus, ProjectRecord, ProjectScan, SentimentResult } from "../types/api";

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
  voiceStatus: () => request<{ browserSpeechRecognition: boolean; message: string }>("/voice/status")
};

export { API_URL };
