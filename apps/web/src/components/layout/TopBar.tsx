import { Activity, Cpu, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { ModelStatus } from "../../types/api";

export default function TopBar() {
  const [status, setStatus] = useState<ModelStatus | null>(null);

  useEffect(() => {
    api.modelStatus().then(setStatus).catch(() => setStatus(null));
    const timer = window.setInterval(() => api.modelStatus().then(setStatus).catch(() => undefined), 15000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="flex min-h-16 flex-col items-start gap-3 border-b border-sentinel-border/80 bg-sentinel-bg/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 md:px-6">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/60">Sentinel Core</p>
        <h2 className="text-sm font-semibold leading-5 sm:text-base md:text-lg">Local-First Agentic Coding Assistant</h2>
      </div>
      <div className="scrollbar-thin flex w-full items-center gap-2 overflow-x-auto text-xs sm:w-auto sm:flex-wrap sm:justify-end">
        <span className="inline-flex max-w-[15rem] shrink-0 items-center gap-2 rounded border border-sentinel-border bg-white/5 px-3 py-2">
          <Cpu size={14} className={status?.ollamaRunning ? "text-sentinel-green" : "text-sentinel-rose"} />
          <span className="truncate">{status?.activeModel ?? status?.recommendedModel ?? "No model"}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded border border-sentinel-border bg-white/5 px-3 py-2">
          <Activity size={14} className={status?.ollamaRunning ? "text-sentinel-green" : "text-sentinel-amber"} />
          {status?.ollamaRunning ? "Ollama online" : "Ollama offline"}
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded border border-sentinel-border bg-white/5 px-3 py-2">
          <Lock size={14} className="text-sentinel-cyan" />
          Safe mode on
        </span>
      </div>
    </header>
  );
}
