import { Activity, Command, Cpu, Lock, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import type { ModelStatus } from "../../types/api";

const pageDetails: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Command Center", subtitle: "LocalSentinel AI Operations" },
  "/projects": { title: "Projects", subtitle: "Manage local repositories" },
  "/projects/new": { title: "New Project", subtitle: "Initialize new codebase" },
  "/chat": { title: "Sentinel Core", subtitle: "Main conversational control room for your AI companion." },
  "/agent": { title: "Agent Mode", subtitle: "Autonomous task execution" },
  "/project-brain": { title: "Project Brain", subtitle: "Context & memory browser" },
  "/system-intelligence": { title: "System Intelligence", subtitle: "Runtime & readiness dashboard" },
  "/research-center": { title: "Research Center", subtitle: "Knowledge acquisition" },
  "/activity-console": { title: "Activity Console", subtitle: "Operational timeline & audit logs" },
  "/agent-map": { title: "Teams Hierarchy", subtitle: "Specialized internal modules & roles" },
  "/task-board": { title: "Task Board", subtitle: "Actionable project workflows" },
  "/models": { title: "Models", subtitle: "Local LLM runtime control" },
  "/rag-memory": { title: "RAG Memory", subtitle: "Indexed vector retrieval" },
  "/sentiment": { title: "Sentiment Radar", subtitle: "Feedback & risk analysis" },
  "/settings": { title: "Settings", subtitle: "Platform configuration" },
};

export default function TopBar() {
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const location = useLocation();

  const details = pageDetails[location.pathname] || { 
    title: "Sentinel Core", 
    subtitle: "Local-First Agentic Coding Assistant" 
  };

  // Mock active project for UI purposes
  const activeProject = "localsentinel-ai";

  useEffect(() => {
    api.modelStatus().then(setStatus).catch(() => setStatus(null));
    const timer = window.setInterval(() => api.modelStatus().then(setStatus).catch(() => undefined), 15000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="flex min-h-[4rem] flex-col items-start gap-3 border-b border-sentinel-border/80 bg-sentinel-bg/80 px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between lg:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-slate-100 sm:text-lg">{details.title}</h2>
          <p className="text-xs text-slate-400">{details.subtitle}</p>
        </div>
      </div>
      
      <div className="scrollbar-thin flex w-full items-center gap-3 overflow-x-auto text-xs sm:w-auto sm:flex-wrap sm:justify-end">
        <div className="flex h-8 items-center rounded border border-sentinel-border/60 bg-white/5 px-3">
          <Terminal size={14} className="mr-2 text-slate-400" />
          <span className="text-slate-300">{activeProject}</span>
        </div>

        <div className="flex h-8 items-center rounded border border-sentinel-border/60 bg-white/5 px-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          <Cpu size={14} className={`mr-2 ${status?.ollamaRunning ? "text-cyan-400" : "text-sentinel-rose"}`} />
          <span className="max-w-[12rem] truncate text-slate-200">
            {status?.activeModel ?? status?.recommendedModel ?? "No model"}
          </span>
        </div>
        
        <div className="flex h-8 items-center rounded border border-sentinel-border/60 bg-white/5 px-3">
          <Activity size={14} className={`mr-2 ${status?.ollamaRunning ? "text-sentinel-green" : "text-sentinel-amber"}`} />
          <span className="text-slate-300">{status?.ollamaRunning ? "Ollama Online" : "Ollama Offline"}</span>
        </div>
        
        <div className="flex h-8 items-center rounded border border-cyan-500/30 bg-cyan-950/30 px-3 text-cyan-300 shadow-[0_0_10px_rgba(53,231,255,0.1)]">
          <Lock size={14} className="mr-2" />
          Safe Mode
        </div>

        <button className="flex h-8 items-center justify-center rounded bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 transition-colors font-medium shadow-[0_0_15px_rgba(53,231,255,0.4)]">
          <Command size={14} className="mr-1.5" />
          Action
        </button>
      </div>
    </header>
  );
}
