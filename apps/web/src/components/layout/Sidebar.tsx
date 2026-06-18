import { Activity, Bot, BrainCircuit, Cpu, Database, FolderKanban, Gauge, Home, MessageSquare, Network, Radar, Search, Settings, ShieldCheck, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "New Project", to: "/projects/new", icon: Sparkles },
  { label: "Chat", to: "/chat", icon: MessageSquare },
  { label: "Agent Mode", to: "/agent", icon: ShieldCheck },
  { label: "Project Brain", to: "/project-brain", icon: Database },
  { label: "System Intelligence", to: "/system-intelligence", icon: Cpu },
  { label: "Research Center", to: "/research-center", icon: Search },
  { label: "Activity Console", to: "/activity-console", icon: Activity },
  { label: "Agent Map", to: "/agent-map", icon: Network },
  { label: "Models", to: "/models", icon: Bot },
  { label: "RAG Memory", to: "/rag-memory", icon: BrainCircuit },
  { label: "Sentiment Radar", to: "/sentiment", icon: Radar },
  { label: "Settings", to: "/settings", icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="scrollbar-thin hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-sentinel-border/80 bg-sentinel-bg/90 p-4 lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded bg-cyan-400/12 text-sentinel-cyan shadow-core">
          <Gauge size={22} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200/70">LocalSentinel</p>
          <h1 className="text-lg font-semibold">AI Console</h1>
        </div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded px-3 py-2.5 text-sm transition ${
                  isActive ? "bg-cyan-400/12 text-sentinel-cyan" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
