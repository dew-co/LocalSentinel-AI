import { History, Plus, Save, X } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { api } from "../../lib/api";
import { chatStorage, type ChatMessage, type ChatSession } from "../../lib/chatStorage";
import { getSettings } from "../../lib/settings";
import { voiceService, type VoiceRuntimeStatus, type VoiceTranscriptEntry } from "../../lib/voiceService";
import type { ChatCitation } from "../../types/api";
import type { SentinelCoreStatus } from "../sentinel/SentinelCore";
import VoiceButton from "../sentinel/VoiceButton";
import VoiceTranscript from "../sentinel/VoiceTranscript";
import MessageBubble from "./MessageBubble";
import PromptInput from "./PromptInput";

type Props = {
  projectId?: string;
  onBusyChange?: (busy: boolean) => void;
  onVoiceChange?: (active: boolean) => void;
  onVoiceStatusChange?: (status: SentinelCoreStatus) => void;
  onVoiceTranscriptChange?: (entries: VoiceTranscriptEntry[], status: VoiceRuntimeStatus) => void;
  showVoiceTranscript?: boolean;
};

export interface ChatPanelRef {
  sendPrompt: (message: string) => void;
}

const ChatPanel = forwardRef<ChatPanelRef, Props>(
  ({ projectId, onBusyChange, onVoiceChange, onVoiceStatusChange, onVoiceTranscriptChange, showVoiceTranscript = true }, ref) => {
  const [session, setSession] = useState<ChatSession>(() => chatStorage.getActive(projectId));
  const [citations, setCitations] = useState<ChatCitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceRuntimeStatus>("Ready");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ChatSession[]>(() => chatStorage.listSaved(projectId));

  useEffect(() => {
    const active = chatStorage.getActive(projectId);
    setSession(active);
    setHistory(chatStorage.listSaved(projectId));
  }, [projectId]);

  useEffect(() => {
    onVoiceTranscriptChange?.(session.transcript, voiceStatus);
  }, [onVoiceTranscriptChange, session.transcript, voiceStatus]);

  const persistSession = (updater: (current: ChatSession) => ChatSession) => {
    setSession((current) => {
      const next = chatStorage.upsert(updater(current));
      setHistory(chatStorage.listSaved(projectId));
      return next;
    });
  };

  const appendMessages = (...newMessages: ChatMessage[]) => {
    persistSession((current) => ({ ...current, messages: [...current.messages, ...newMessages] }));
  };

  const setCompanionVoiceStatus = (status: VoiceRuntimeStatus) => {
    setVoiceStatus(status);
    onVoiceChange?.(status === "Listening");
    onVoiceStatusChange?.(status);
  };

  const addTranscript = (entry: VoiceTranscriptEntry) => {
    persistSession((current) => ({ ...current, transcript: [...current.transcript.slice(-11), entry] }));
  };

  const newConversation = () => {
    voiceService.cancelSpeech();
    const next = chatStorage.newConversation(projectId, session.id);
    setSession(next);
    setCitations([]);
    setHistory(chatStorage.listSaved(projectId));
    setHistoryOpen(false);
    setCompanionVoiceStatus("Ready");
  };

  const saveConversation = () => {
    const saved = chatStorage.save(session);
    setSession(saved);
    setHistory(chatStorage.listSaved(projectId));
  };

  const openSession = (sessionId: string) => {
    const found = chatStorage.get(sessionId);
    if (!found) return;
    chatStorage.setActive(projectId, found.id);
    setSession(found);
    setCitations([]);
    setHistoryOpen(false);
    setCompanionVoiceStatus("Ready");
  };

  const send = async (message: string, source: "text" | "voice" = "text") => {
    const settings = getSettings();
    const conversationHistory = session.messages
      .filter((item) => item.content !== "")
      .slice(-10)
      .map((item) => ({ role: item.role, content: item.content }));
    appendMessages({ role: "user", content: message, createdAt: new Date().toISOString() });
    if (source === "voice") addTranscript(voiceService.createEntry("user", message));
    setLoading(true);
    onBusyChange?.(true);
    setCompanionVoiceStatus("Thinking");
    try {
      const response = await api.chat({
        message,
        projectId,
        useRag: settings.ragEnabled,
        assistantTone: settings.assistantTone,
        responseLength: settings.responseLength,
        isVoice: source === "voice",
        rememberVoice: settings.voiceMemory,
        conversationHistory
      });
      appendMessages({ role: "assistant", content: response.answer, createdAt: new Date().toISOString() });
      setCitations(response.citations);
      if (source === "voice") {
        addTranscript(voiceService.createEntry("assistant", response.answer));
        await voiceService.speak(response.answer, {
          enabled: settings.voiceMode,
          responseLength: settings.responseLength,
          onStatus: setCompanionVoiceStatus
        });
      } else {
        setCompanionVoiceStatus("Ready");
      }
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Chat request failed.";
      appendMessages({ role: "assistant", content: errorText, createdAt: new Date().toISOString() });
      if (source === "voice") addTranscript(voiceService.createEntry("system", errorText));
      setCompanionVoiceStatus("Ready");
    } finally {
      setLoading(false);
      onBusyChange?.(false);
    }
  };

  useImperativeHandle(ref, () => ({
    sendPrompt: (message: string) => {
      send(message, "text");
    }
  }));

  return (
    <section className="panel flex w-full flex-1 min-h-0 min-w-0 max-h-[900px] flex-col overflow-hidden rounded p-3 sm:p-4">
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/50">Conversation</p>
          <h3 className="text-lg font-semibold">Local AI Chat</h3>
          <p className="mt-1 max-w-[18rem] truncate text-xs text-slate-500 sm:max-w-72">{session.title}</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button className="focus-ring inline-flex items-center gap-2 rounded border border-sentinel-border bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10" onClick={newConversation} type="button">
            <Plus size={15} />
            New
          </button>
          <button className="focus-ring inline-flex items-center gap-2 rounded border border-sentinel-border bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10" onClick={saveConversation} type="button">
            <Save size={15} />
            {session.saved ? "Saved" : "Save"}
          </button>
          <button className="focus-ring inline-flex items-center gap-2 rounded border border-sentinel-border bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10" onClick={() => setHistoryOpen((open) => !open)} type="button">
            <History size={15} />
            History
          </button>
          <VoiceButton
            disabled={loading}
            onStatus={setCompanionVoiceStatus}
            onError={(message) => addTranscript(voiceService.createEntry("system", message))}
            onTranscript={(text) => {
              send(text, "voice");
            }}
          />
        </div>
      </div>
      {historyOpen && (
        <div className="mb-3 min-w-0 rounded border border-sentinel-border bg-sentinel-bg/80 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/50">Chat History</p>
            <button className="grid h-7 w-7 place-items-center rounded border border-sentinel-border bg-white/5 text-slate-300" onClick={() => setHistoryOpen(false)} type="button" title="Close history">
              <X size={14} />
            </button>
          </div>
          <div className="scrollbar-thin max-h-40 space-y-2 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No saved chats yet. Click Save to keep this conversation in history.</p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  className={`focus-ring block w-full rounded border px-3 py-2 text-left text-sm transition ${
                    item.id === session.id ? "border-cyan-300/40 bg-cyan-300/10" : "border-sentinel-border bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => openSession(item.id)}
                  type="button"
                >
                  <span className="block truncate text-slate-100">{item.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {item.saved ? "Saved" : "Draft"} · {new Date(item.updatedAt).toLocaleString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      <div className="scrollbar-thin min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
        {session.messages.map((message, index) => (
          <MessageBubble key={`${message.role}-${message.createdAt}-${index}`} role={message.role} content={message.content} />
        ))}
      </div>
      {citations.length > 0 && (
        <div className="my-3 min-w-0 rounded border border-sentinel-border bg-white/5 p-3 text-xs text-slate-300">
          <p className="mb-2 uppercase tracking-[0.18em] text-cyan-200/50">Citations</p>
          <div className="space-y-1 [overflow-wrap:anywhere]">
            {citations.map((citation) => (
              <p key={`${citation.filePath}-${citation.score}`}>
                {citation.filePath} <span className="text-cyan-200/60">score {citation.score}</span>
              </p>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 min-w-0 space-y-3">
        {showVoiceTranscript && <VoiceTranscript entries={session.transcript} status={voiceStatus} />}
        <PromptInput disabled={loading} onSend={send} />
      </div>
    </section>
  );
});

export default ChatPanel;
