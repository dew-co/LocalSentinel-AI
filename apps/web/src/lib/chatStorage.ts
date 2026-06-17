import type { VoiceTranscriptEntry } from "./voiceService";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  title: string;
  projectId?: string;
  messages: ChatMessage[];
  transcript: VoiceTranscriptEntry[];
  saved: boolean;
  createdAt: string;
  updatedAt: string;
};

const SESSIONS_KEY = "localsentinel-chat-sessions";
const ACTIVE_KEY_PREFIX = "localsentinel-active-chat";
const DRAFT_KEY_PREFIX = "localsentinel-chat-draft";

export const starterMessage: ChatMessage = {
  role: "assistant",
  content:
    "Sentinel Core ready. I can help plan projects, explain code, debug issues, prioritize urgent feedback, and prepare safe task plans before any changes.",
  createdAt: new Date().toISOString()
};

function now() {
  return new Date().toISOString();
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function contextKey(projectId?: string) {
  return `${ACTIVE_KEY_PREFIX}:${projectId ?? "global"}`;
}

function draftKey(projectId?: string) {
  return `${DRAFT_KEY_PREFIX}:${projectId ?? "global"}`;
}

function readSavedSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const sessions: ChatSession[] = raw ? JSON.parse(raw) : [];
    return sessions.filter((session) => session.saved);
  } catch {
    return [];
  }
}

function writeSavedSessions(sessions: ChatSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.filter((session) => session.saved)));
}

function readDraft(projectId?: string): ChatSession | null {
  try {
    const raw = sessionStorage.getItem(draftKey(projectId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeDraft(session: ChatSession) {
  sessionStorage.setItem(draftKey(session.projectId), JSON.stringify(session));
}

function removeDraft(projectId?: string) {
  sessionStorage.removeItem(draftKey(projectId));
}

function titleFromMessage(message: string) {
  const cleaned = message.trim().replace(/\s+/g, " ");
  if (!cleaned) return "New conversation";
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}...` : cleaned;
}

export const chatStorage = {
  createSession(projectId?: string): ChatSession {
    const timestamp = now();
    return {
      id: createId(),
      title: "New conversation",
      projectId,
      messages: [{ ...starterMessage, createdAt: timestamp }],
      transcript: [],
      saved: false,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  },

  getActive(projectId?: string): ChatSession {
    const activeId = sessionStorage.getItem(contextKey(projectId));
    const draft = readDraft(projectId);
    const savedSessions = readSavedSessions();
    const found = activeId
      ? draft?.id === activeId
        ? draft
        : savedSessions.find((session) => session.id === activeId)
      : draft ?? undefined;
    if (found) return found;
    const session = this.createSession(projectId);
    this.upsert(session);
    sessionStorage.setItem(contextKey(projectId), session.id);
    return session;
  },

  setActive(projectId: string | undefined, sessionId: string) {
    sessionStorage.setItem(contextKey(projectId), sessionId);
  },

  list(projectId?: string): ChatSession[] {
    return readSavedSessions()
      .filter((session) => (projectId ? session.projectId === projectId : !session.projectId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  listSaved(projectId?: string): ChatSession[] {
    return this.list(projectId).filter((session) => session.saved);
  },

  upsert(session: ChatSession) {
    const sessions = readSavedSessions();
    const index = sessions.findIndex((item) => item.id === session.id);
    const next = { ...session, updatedAt: now() };
    if (next.title === "New conversation") {
      const firstUserMessage = next.messages.find((message) => message.role === "user");
      if (firstUserMessage) next.title = titleFromMessage(firstUserMessage.content);
    }
    if (next.saved) {
      if (index >= 0) sessions[index] = next;
      else sessions.push(next);
      writeSavedSessions(sessions);
      if (readDraft(next.projectId)?.id === next.id) removeDraft(next.projectId);
    } else {
      writeDraft(next);
    }
    sessionStorage.setItem(contextKey(next.projectId), next.id);
    return next;
  },

  save(session: ChatSession) {
    return this.upsert({ ...session, saved: true });
  },

  discardIfUnsaved(sessionId: string, projectId?: string) {
    const draft = readDraft(projectId);
    if (draft?.id === sessionId && !draft.saved) removeDraft(projectId);
  },

  newConversation(projectId?: string, previousSessionId?: string) {
    if (previousSessionId) this.discardIfUnsaved(previousSessionId, projectId);
    const session = this.createSession(projectId);
    this.upsert(session);
    return session;
  },

  get(sessionId: string) {
    const draft = readDraft();
    if (draft?.id === sessionId) return draft;
    return readSavedSessions().find((session) => session.id === sessionId) ?? null;
  }
};
