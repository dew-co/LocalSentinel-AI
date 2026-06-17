import { useEffect, useState } from "react";
import AgentPlanCard from "../components/agent/AgentPlanCard";
import ChatPanel from "../components/chat/ChatPanel";
import ModelStatusCard from "../components/models/ModelStatusCard";
import PriorityRadar from "../components/sentiment/PriorityRadar";
import SentinelCore from "../components/sentinel/SentinelCore";
import { api } from "../lib/api";
import type { AgentPlan, ModelStatus } from "../types/api";
import type { SentinelCoreStatus } from "../components/sentinel/SentinelCore";

export default function DashboardPage() {
  const [busy, setBusy] = useState(false);
  const [voice, setVoice] = useState(false);
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [planning, setPlanning] = useState(true);
  const [voiceRuntimeStatus, setVoiceRuntimeStatus] = useState<SentinelCoreStatus>("Ready");

  useEffect(() => {
    const refreshStatus = () => api.modelStatus().then(setStatus).catch(() => undefined);
    refreshStatus();
    const timer = window.setInterval(refreshStatus, 10000);
    api
      .plan("Review current project health and propose next safe actions")
      .then(setPlan)
      .catch(() => undefined)
      .finally(() => setPlanning(false));
    return () => window.clearInterval(timer);
  }, []);

  const coreStatus = voiceRuntimeStatus !== "Ready" ? voiceRuntimeStatus : voice ? "Listening" : busy ? "Thinking" : planning ? "Planning" : "Ready";

  return (
    <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(280px,0.85fr)_minmax(420px,1.15fr)] 2xl:grid-cols-[minmax(300px,0.95fr)_minmax(420px,1.25fr)_minmax(300px,360px)]">
      <div className="space-y-4">
        <SentinelCore
          status={coreStatus}
          voiceActive={voice}
          responding={busy}
          modelOnline={Boolean(status?.ollamaRunning)}
          activeModel={status?.activeModel ?? status?.recommendedModel}
          memoryOnline
          safeMode
        />
        <AgentPlanCard plan={plan} />
      </div>
      <ChatPanel onBusyChange={setBusy} onVoiceChange={setVoice} onVoiceStatusChange={setVoiceRuntimeStatus} />
      <div className="space-y-4 xl:col-span-2 xl:grid xl:grid-cols-3 xl:gap-4 xl:space-y-0 2xl:col-span-1 2xl:block 2xl:space-y-4">
        <ModelStatusCard status={status} />
        <PriorityRadar result={null} />
        <section className="panel rounded p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/50">Project Health</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Safe mode" value="On" />
            <Metric label="RAG" value="Ready" />
            <Metric label="Voice" value={voice ? "Active" : "Idle"} />
            <Metric label="Runtime" value={status?.ollamaRunning ? "Online" : "Offline"} />
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-sentinel-border bg-white/5 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
