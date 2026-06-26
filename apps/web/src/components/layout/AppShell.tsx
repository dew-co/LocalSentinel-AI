import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { FirstTimeIntelligenceSetup } from "../intelligence/FirstTimeIntelligenceSetup";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const mobileItems = [
  ["Dashboard", "/dashboard"],
  ["Projects", "/projects"],
  ["New Project", "/projects/new"],
  ["Chat", "/chat"],
  ["Agent", "/agent"],
  ["Intel", "/intelligence-center"],
  ["Models", "/models"],
  ["RAG", "/rag-memory"],
  ["Sentiment", "/sentiment"],
  ["Settings", "/settings"]
] as const;

export default function AppShell() {
  const [showIntelligenceSetup, setShowIntelligenceSetup] = useState(false);

  useEffect(() => {
    api.intelligenceOnboardingStatus()
      .then((status) => setShowIntelligenceSetup(!status.first_run_completed))
      .catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen bg-sentinel-bg text-slate-100 lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
          <TopBar />
          <nav className="scrollbar-thin flex gap-2 overflow-x-auto border-b border-sentinel-border bg-sentinel-bg/80 px-4 py-2 lg:hidden">
            {mobileItems.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded border px-3 py-2 text-xs ${
                    isActive ? "border-cyan-300/40 bg-cyan-300/12 text-cyan-100" : "border-sentinel-border bg-white/5 text-slate-300"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <main className="mx-auto flex w-full max-w-[1720px] flex-col p-3 sm:p-4 md:p-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <FirstTimeIntelligenceSetup open={showIntelligenceSetup} onClose={() => setShowIntelligenceSetup(false)} />
    </div>
  );
}
