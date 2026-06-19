import { Activity, Bot, BrainCircuit, Cpu, Database, FolderKanban, Gauge, Home, MessageSquare, Network, Radar, Search, Settings, ShieldCheck, Sparkles, Network as TeamsIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

const menuGroups = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: Home },
      { label: "Projects", to: "/projects", icon: FolderKanban },
      { label: "New Project", to: "/projects/new", icon: Sparkles },
    ]
  },
  {
    title: "Sentinel",
    items: [
      { label: "Sentinel Core Chat", to: "/chat", icon: MessageSquare },
      { label: "Agent Mode", to: "/agent", icon: ShieldCheck },
      { label: "Project Brain", to: "/project-brain", icon: Database },
    ]
  },
  {
    title: "Operations",
    items: [
      { label: "System Intelligence", to: "/system-intelligence", icon: Cpu },
      { label: "Research Center", to: "/research-center", icon: Search },
      { label: "Activity Console", to: "/activity-console", icon: Activity },
    ]
  },
  {
    title: "Organization",
    items: [
      { label: "Teams Hierarchy", to: "/agent-map", icon: TeamsIcon },
      { label: "Task Board", to: "/task-board", icon: FolderKanban },
      { label: "Models", to: "/models", icon: Bot },
    ]
  },
  {
    title: "Data",
    items: [
      { label: "RAG Memory", to: "/rag-memory", icon: BrainCircuit },
      { label: "Sentiment Radar", to: "/sentiment", icon: Radar },
      { label: "Settings", to: "/settings", icon: Settings }
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="scrollbar-thin hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-sentinel-border/80 bg-sentinel-bg/90 p-4 lg:flex">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded border border-cyan-500/30 bg-cyan-400/10 text-sentinel-cyan shadow-core">
          <Gauge size={22} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/60">LocalSentinel</p>
          <h1 className="text-base font-semibold text-slate-100">AI Console</h1>
        </div>
      </div>
      <nav className="flex-1 space-y-6 pb-4">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {group.title}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded px-3 py-2 text-sm transition-all duration-200 ${
                        isActive 
                          ? "bg-cyan-400/10 text-cyan-300 shadow-[inset_2px_0_0_0_rgba(53,231,255,0.8)]" 
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`
                    }
                  >
                    <Icon size={16} className="transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="mt-4 rounded border border-sentinel-border/50 bg-white/5 p-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-sentinel-green shadow-[0_0_8px_rgba(67,240,164,0.6)]"></div>
          <span className="text-xs text-slate-300">Local Mode Active</span>
        </div>
      </div>
    </aside>
  );
}
