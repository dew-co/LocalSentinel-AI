import { Activity, AlertTriangle, ArrowRight, BrainCircuit, CheckCircle2, ChevronRight, Command, Cpu, Database, FileText, Lock, Plus, ShieldAlert, ShieldCheck, Terminal, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ModelStatusCard from "../components/models/ModelStatusCard";
import SentinelCore from "../components/sentinel/SentinelCore";
import { api } from "../lib/api";
import type { ModelStatus } from "../types/api";

export default function DashboardPage() {
  const [status, setStatus] = useState<ModelStatus | null>(null);

  useEffect(() => {
    const refreshStatus = () => api.modelStatus().then(setStatus).catch(() => undefined);
    refreshStatus();
    const timer = window.setInterval(refreshStatus, 15000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-2 pb-10 sm:p-4">
      {/* HERO COMMAND SECTION */}
      <section className="relative overflow-hidden rounded-xl border border-sentinel-border/50 bg-gradient-to-br from-sentinel-bg/90 to-cyan-950/10 p-6 shadow-xl backdrop-blur-md lg:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]"></div>
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-3 text-xs uppercase tracking-widest text-cyan-200/60">
              <ShieldCheck size={14} className="text-sentinel-green" />
              <span>Safe Mode Active</span>
              <span className="h-1 w-1 rounded-full bg-slate-600"></span>
              <span>Project: localsentinel-ai</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">LocalSentinel Command Center</h1>
            <p className="text-slate-400">Your local-first, memory-aware development companion is standing by. All systems are operating within safe execution boundaries.</p>
          </div>
          
          <div className="flex w-full shrink-0 flex-col gap-3 lg:w-80">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400">
                <Terminal size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Quick command or question..." 
                className="w-full rounded border border-sentinel-border bg-black/40 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Command size={14} className="text-slate-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/chat" className="flex items-center justify-center gap-2 rounded bg-white/5 py-2 text-xs font-medium hover:bg-white/10 hover:text-cyan-300 border border-transparent hover:border-cyan-500/30 transition-all">
                <BrainCircuit size={14} /> Open Core Chat
              </Link>
              <button className="flex items-center justify-center gap-2 rounded bg-white/5 py-2 text-xs font-medium hover:bg-white/10 hover:text-cyan-300 border border-transparent hover:border-cyan-500/30 transition-all">
                <Zap size={14} /> Scan Project
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: 8 cols */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* SENTINEL CORE STATUS */}
            <section className="panel flex flex-col rounded-xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-cyan-200/50">SentinelCore</h3>
                <span className="flex items-center gap-1.5 rounded-full border border-sentinel-green/20 bg-sentinel-green/10 px-2 py-0.5 text-[10px] text-sentinel-green">
                  <div className="h-1.5 w-1.5 rounded-full bg-sentinel-green"></div> Ready
                </span>
              </div>
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-950/30 shadow-[0_0_20px_rgba(53,231,255,0.1)]">
                  <BrainCircuit size={28} className="text-cyan-400" />
                </div>
                <div className="flex-1 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Mode</span>
                    <span className="font-medium text-slate-200">Idle / Observing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Memory Status</span>
                    <span className="font-medium text-slate-200">Indexed (24s ago)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Runtime</span>
                    <span className="font-medium text-slate-200">{status?.ollamaRunning ? "Online" : "Offline"}</span>
                  </div>
                </div>
              </div>
              <Link to="/chat" className="mt-4 flex w-full items-center justify-center gap-2 rounded border border-sentinel-border bg-white/5 py-2 text-xs font-medium hover:bg-white/10 transition-colors">
                Connect to Companion <ArrowRight size={14} />
              </Link>
            </section>

            {/* PROJECT HEALTH / PRIORITY */}
            <section className="panel rounded-xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-cyan-200/50">Project Health</h3>
                <Link to="/task-board" className="text-xs text-cyan-400 hover:text-cyan-300">View tasks</Link>
              </div>
              <div className="space-y-4">
                <div className="rounded border border-sentinel-border/50 bg-black/20 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-sentinel-amber">
                    <AlertTriangle size={14} /> High Priority Issue
                  </div>
                  <p className="text-sm text-slate-300">Unoptimized re-renders detected in Dashboard components.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded border border-sentinel-border bg-white/5 p-2.5">
                    <span className="block text-xs text-slate-500">Critical Risks</span>
                    <span className="text-lg font-semibold text-sentinel-green">0</span>
                  </div>
                  <div className="rounded border border-sentinel-border bg-white/5 p-2.5">
                    <span className="block text-xs text-slate-500">Safe Actions</span>
                    <span className="text-lg font-semibold text-cyan-300">4 available</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ACTIVITY PREVIEW */}
          <section className="panel rounded-xl p-5">
             <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-cyan-200/50">Recent Activity</h3>
                <Link to="/activity-console" className="text-xs text-cyan-400 hover:text-cyan-300">View all logs</Link>
              </div>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle2, color: "text-sentinel-green", title: "Project codebase scanned successfully", time: "2 mins ago" },
                  { icon: ShieldCheck, color: "text-cyan-400", title: "Safe execution boundary validated", time: "15 mins ago" },
                  { icon: Database, color: "text-indigo-400", title: "RAG memory index updated (4 new files)", time: "1 hr ago" },
                ].map((act, i) => (
                  <div key={i} className="flex items-center gap-4 rounded border border-transparent px-2 py-2 hover:bg-white/5 transition-colors">
                    <act.icon size={16} className={act.color} />
                    <span className="flex-1 text-sm text-slate-300">{act.title}</span>
                    <span className="text-xs text-slate-500">{act.time}</span>
                  </div>
                ))}
              </div>
          </section>

        </div>

        {/* RIGHT COLUMN: 4 cols */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          
          {/* RUNTIME SYSTEM OVERVIEW */}
          <section className="panel rounded-xl p-5">
             <h3 className="mb-4 text-xs uppercase tracking-widest text-cyan-200/50">System Overview</h3>
             
             <div className="mb-6 flex items-center justify-center">
               <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-sentinel-green bg-sentinel-green/10 shadow-[0_0_30px_rgba(67,240,164,0.15)]">
                 <div className="text-center">
                   <span className="block text-2xl font-bold text-white">98<span className="text-sm">%</span></span>
                   <span className="text-[10px] uppercase text-sentinel-green">Readiness</span>
                 </div>
               </div>
             </div>

             <div className="space-y-3">
                <div className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-slate-400"><Cpu size={14} /> Ollama</span>
                  <span className={status?.ollamaRunning ? "text-sentinel-green" : "text-sentinel-rose"}>
                    {status?.ollamaRunning ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-slate-400"><Command size={14} /> Active Model</span>
                  <span className="text-cyan-300 max-w-[120px] truncate text-right">
                    {status?.activeModel ?? status?.recommendedModel ?? "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-slate-400"><Database size={14} /> RAG Engine</span>
                  <span className="text-sentinel-green">Ready</span>
                </div>
             </div>
          </section>

          {/* MEMORY SNAPSHOT */}
          <section className="panel rounded-xl p-5">
             <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest text-cyan-200/50">Memory Snapshot</h3>
                <Link to="/project-brain" className="text-xs text-cyan-400 hover:text-cyan-300">Open Brain</Link>
             </div>
             <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded border border-sentinel-border/50 bg-black/20 p-3 text-center">
                  <span className="block text-xl font-bold text-white">14</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Brain Items</span>
                </div>
                <div className="rounded border border-sentinel-border/50 bg-black/20 p-3 text-center">
                  <span className="block text-xl font-bold text-white">8</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Research Notes</span>
                </div>
             </div>
             <div>
                <p className="mb-2 text-xs font-medium text-slate-400">Recent Memory:</p>
                <div className="rounded border border-sentinel-border bg-white/5 p-3 text-sm">
                  <p className="line-clamp-2 text-slate-300">Decided to use standard Tailwind configuration for the Sentinel Design System to ensure long-term compatibility.</p>
                </div>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
}
