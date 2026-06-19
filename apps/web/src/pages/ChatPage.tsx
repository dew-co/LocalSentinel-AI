import { useRef, useState } from "react";
import ChatPanel, { type ChatPanelRef } from "../components/chat/ChatPanel";
import SentinelCore, { type SentinelCoreStatus } from "../components/sentinel/SentinelCore";
import { PageContainer } from "../components/layout/PageContainer";
import { Activity, Database, ShieldCheck, Zap } from "lucide-react";

export default function ChatPage() {
  const [busy, setBusy] = useState(false);
  const [voice, setVoice] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<SentinelCoreStatus>("Ready");
  const chatPanelRef = useRef<ChatPanelRef>(null);

  const coreStatus = voiceStatus !== "Ready" ? voiceStatus : voice ? "Listening" : busy ? "Thinking" : "Ready";

  const suggestedCommands = [
    "Think through this idea",
    "Research the best approach",
    "Find possible bugs",
    "Analyze this feedback",
    "Check my system tools"
  ];

  return (
    <PageContainer className="flex-1 min-h-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Sentinel Core</h1>
          <p className="mt-1 text-sm text-slate-400">Main conversational control room for your AI companion.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_1fr_280px] flex-1 min-h-0">
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
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex-1 min-h-0 flex flex-col">
             <ChatPanel ref={chatPanelRef} onBusyChange={setBusy} onVoiceChange={setVoice} onVoiceStatusChange={setVoiceStatus} />
          </div>
          
          {/* Suggested Commands Strip */}
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestedCommands.map((cmd, i) => (
              <button 
                key={i} 
                onClick={() => chatPanelRef.current?.sendPrompt(cmd)}
                className="rounded-full border border-sentinel-border/50 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:border-cyan-500/30 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                type="button"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Context & Status */}
        <div className="flex flex-col gap-4">
          <section className="panel rounded-xl p-5 border border-sentinel-border/80 bg-sentinel-bg/50">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-200/50">Active Context</h3>
            
            <div className="space-y-4">
              <div className="rounded border border-sentinel-border bg-black/30 p-3">
                <span className="block text-[10px] uppercase text-slate-500 mb-1">Project</span>
                <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <Database size={14} className="text-cyan-400" /> localsentinel-ai
                </span>
              </div>
              
              <div className="rounded border border-sentinel-border bg-black/30 p-3">
                <span className="block text-[10px] uppercase text-slate-500 mb-1">Memory Utilization</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                  <div className="bg-sentinel-green h-full w-[45%]"></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>45%</span>
                  <span>1.2 GB / 8 GB</span>
                </div>
              </div>
            </div>
          </section>
          
          <section className="panel rounded-xl p-5 border border-sentinel-border/80 bg-sentinel-bg/50 flex-1">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-200/50">System Operations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded bg-white/5 p-2">
                <span className="flex items-center gap-2 text-slate-400"><Zap size={14} /> Readiness</span>
                <span className="text-sentinel-green font-medium">98%</span>
              </div>
              <div className="flex items-center justify-between rounded bg-white/5 p-2">
                <span className="flex items-center gap-2 text-slate-400"><Activity size={14} /> Model</span>
                <span className="text-cyan-300 font-medium truncate max-w-[90px]">llama3</span>
              </div>
              <div className="flex items-center justify-between rounded border border-cyan-500/20 bg-cyan-950/20 p-2">
                <span className="flex items-center gap-2 text-slate-400"><ShieldCheck size={14} className="text-cyan-400" /> Safety</span>
                <span className="text-cyan-400 font-medium">Enforced</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
