import { useCallback, useEffect, useRef, useState } from "react";
import ChatPanel, { type ChatPanelRef } from "../components/chat/ChatPanel";
import SentinelCore, { type SentinelCoreStatus } from "../components/sentinel/SentinelCore";
import VoiceTranscript from "../components/sentinel/VoiceTranscript";
import { PageContainer } from "../components/layout/PageContainer";
import { Activity, Database, ShieldCheck, Zap } from "lucide-react";
import { api } from "../lib/api";
import type { VoiceRuntimeStatus, VoiceTranscriptEntry } from "../lib/voiceService";

export default function ChatPage() {
  const [busy, setBusy] = useState(false);
  const [voice, setVoice] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<SentinelCoreStatus>("Ready");
  const [transcriptEntries, setTranscriptEntries] = useState<VoiceTranscriptEntry[]>([]);
  const [transcriptStatus, setTranscriptStatus] = useState<VoiceRuntimeStatus>("Ready");
  const [intelligenceStatus, setIntelligenceStatus] = useState<any>(null);
  const chatPanelRef = useRef<ChatPanelRef>(null);

  const coreStatus = voiceStatus !== "Ready" ? voiceStatus : voice ? "Listening" : busy ? "Thinking" : "Ready";

  const updateVoiceTranscript = useCallback((entries: VoiceTranscriptEntry[], status: VoiceRuntimeStatus) => {
    setTranscriptEntries(entries);
    setTranscriptStatus(status);
  }, []);

  useEffect(() => {
    api.intelligenceStatus()
      .then(setIntelligenceStatus)
      .catch(() => undefined);
  }, []);

  const suggestedCommands = [
    "Think through this idea",
    "What intelligence do you have about this project?",
    "Update my local intelligence cache",
    "Use offline knowledge only",
    "What did you learn from my recent work?",
    "What should I refresh when online?"
  ];

  return (
    <PageContainer className="flex-1 min-h-0">
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(220px,280px)] flex-1 min-h-0">
        {/* Left Panel - Neural Companion */}
        <SentinelCore
          status={coreStatus}
          mode="Companion Mode"
          modelOnline={true}
          activeModel="qwen2.5-coder:latest"
          memoryOnline={true}
          safeMode={true}
          voiceActive={voice}
          responding={busy}
        />

        {/* Center Panel - Chat Workspace */}
        <div className="flex min-w-0 flex-col gap-4 flex-1 min-h-0">
          <div className="flex-1 min-h-0 min-w-0 flex flex-col">
             <ChatPanel
               ref={chatPanelRef}
               onBusyChange={setBusy}
               onVoiceChange={setVoice}
               onVoiceStatusChange={setVoiceStatus}
               onVoiceTranscriptChange={updateVoiceTranscript}
               showVoiceTranscript={false}
             />
          </div>
          
          {/* Suggested Commands Strip */}
          <div className="flex min-w-0 flex-wrap gap-2 pt-2">
            {suggestedCommands.map((cmd, i) => (
              <button 
                key={i} 
                onClick={() => chatPanelRef.current?.sendPrompt(cmd)}
                className="max-w-full rounded-full border border-sentinel-border/50 bg-white/5 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-cyan-500/30 hover:bg-white/10 hover:text-cyan-300"
                type="button"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Context & Status */}
        <div className="flex min-w-0 flex-col gap-4">
          <VoiceTranscript entries={transcriptEntries} status={transcriptStatus} className="panel border-sentinel-border/80" />

          <section className="panel min-w-0 rounded-xl p-5 border border-sentinel-border/80 bg-sentinel-bg/50">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-200/50">Active Context</h3>
            
            <div className="space-y-4">
              <div className="min-w-0 rounded border border-sentinel-border bg-black/30 p-3">
                <span className="block text-[10px] uppercase text-slate-500 mb-1">Project</span>
                <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-200">
                  <Database size={14} className="shrink-0 text-cyan-400" />
                  <span className="truncate">localsentinel-ai</span>
                </span>
              </div>
              
              <div className="min-w-0 rounded border border-sentinel-border bg-black/30 p-3">
                <span className="block text-[10px] uppercase text-slate-500 mb-1">Memory Utilization</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                  <div className="bg-sentinel-green h-full" style={{ width: `${Math.min(100, (intelligenceStatus?.cached_items ?? 0) * 4)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{intelligenceStatus?.cached_items ?? 0} cached items</span>
                  <span>{intelligenceStatus?.offline_cache_ready ? "Cache ready" : "No cache"}</span>
                </div>
              </div>
            </div>
          </section>
          
          <section className="panel min-w-0 rounded-xl p-5 border border-sentinel-border/80 bg-sentinel-bg/50 flex-1">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-200/50">System Operations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex min-w-0 items-center justify-between rounded bg-white/5 p-2">
                <span className="flex items-center gap-2 text-slate-400"><Zap size={14} /> Readiness</span>
                <span className="text-sentinel-green font-medium">98%</span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-2 rounded bg-white/5 p-2">
                <span className="flex shrink-0 items-center gap-2 text-slate-400"><Activity size={14} /> Model</span>
                <span className="text-cyan-300 font-medium truncate max-w-[90px]">llama3</span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-2 rounded border border-cyan-500/20 bg-cyan-950/20 p-2">
                <span className="flex items-center gap-2 text-slate-400"><ShieldCheck size={14} className="text-cyan-400" /> Safety</span>
                <span className="text-cyan-400 font-medium">Enforced</span>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-2 rounded bg-white/5 p-2">
                <span className="flex items-center gap-2 text-slate-400"><Database size={14} /> Intelligence</span>
                <span className={`font-medium ${intelligenceStatus?.online_intelligence_enabled ? "text-sentinel-green" : "text-sentinel-amber"}`}>
                  {intelligenceStatus?.online_intelligence_enabled ? "Enabled" : "Manual"}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
