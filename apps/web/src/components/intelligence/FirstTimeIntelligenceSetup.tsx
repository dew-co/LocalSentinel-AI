import { BrainCircuit, CheckCircle2, Cpu, Database, DownloadCloud, FolderSearch, RotateCw, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { IntelligencePermissions } from "../../types/api";

type Props = {
  open: boolean;
  onClose: () => void;
};

const conservativeDefaults: IntelligencePermissions = {
  online_intelligence_enabled: false,
  first_run_completed: false,
  system_scan_allowed: false,
  project_scan_allowed: false,
  adaptive_memory_enabled: false,
  scheduled_refresh_enabled: false,
  refresh_frequency: "manual",
  allowed_sources: [
    "official_documentation",
    "framework_best_practices",
    "package_documentation",
    "local_ai_models",
    "common_error_solutions",
    "security_best_practices",
    "deployment_guides",
    "database_guides",
    "frontend_guides",
    "backend_guides",
    "user_project_topics"
  ],
  offline_cache_enabled: true
};

const recommendedSetup: IntelligencePermissions = {
  ...conservativeDefaults,
  system_scan_allowed: true,
  online_intelligence_enabled: true,
  adaptive_memory_enabled: true,
  offline_cache_enabled: true,
  refresh_frequency: "manual"
};

const permissionRows = [
  {
    key: "system_scan_allowed",
    title: "Scan local developer tools",
    description: "Node, npm, Python, Git, Docker, Ollama, installed models, and package managers.",
    icon: Cpu
  },
  {
    key: "project_scan_allowed",
    title: "Analyze selected project folders",
    description: "Only folders you select. Private folders are not scanned automatically and .env contents are never read.",
    icon: FolderSearch
  },
  {
    key: "online_intelligence_enabled",
    title: "Download public development knowledge summaries",
    description: "Official docs, package docs, local model guidance, common error fixes, and best practices.",
    icon: DownloadCloud
  },
  {
    key: "offline_cache_enabled",
    title: "Build offline knowledge cache",
    description: "Save summaries locally with source URLs and last updated dates.",
    icon: Database
  },
  {
    key: "adaptive_memory_enabled",
    title: "Enable adaptive user memory",
    description: "Remember preferred stacks, accepted decisions, rejected suggestions, workflows, and model choices.",
    icon: BrainCircuit
  },
  {
    key: "scheduled_refresh_enabled",
    title: "Enable scheduled intelligence refresh",
    description: "Manual mode is default. Daily, weekly, and monthly preferences are saved for future background refresh.",
    icon: RotateCw
  }
] as const;

export function FirstTimeIntelligenceSetup({ open, onClose }: Props) {
  const [customizing, setCustomizing] = useState(false);
  const [permissions, setPermissions] = useState<IntelligencePermissions>(conservativeDefaults);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setCustomizing(false);
    setPermissions(conservativeDefaults);
    setMessage("");
  }, [open]);

  if (!open) return null;

  const complete = async (next: IntelligencePermissions) => {
    setSaving(true);
    setMessage("");
    try {
      await api.completeIntelligenceOnboarding({ ...next, first_run_completed: true });
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Setup failed.");
    } finally {
      setSaving(false);
    }
  };

  const skip = async () => {
    setSaving(true);
    try {
      await api.skipIntelligenceOnboarding();
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Skip failed.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof IntelligencePermissions) => {
    setPermissions((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section className="panel max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded border border-cyan-500/30 bg-sentinel-bg/95 p-5 shadow-[0_0_60px_rgba(53,231,255,0.16)] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-200">
              <ShieldCheck size={14} />
              LocalSentinel First-Time Intelligence Setup
            </div>
            <h2 className="text-2xl font-semibold text-white">Welcome to LocalSentinel AI</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              LocalSentinel AI can build a local intelligence cache to improve offline use, faster responses, project understanding, and personalized development guidance. What would you like to allow?
            </p>
          </div>
          <button className="grid h-9 w-9 shrink-0 place-items-center rounded border border-sentinel-border bg-white/5 text-slate-300 hover:bg-white/10" onClick={skip} type="button" title="Skip setup">
            <X size={16} />
          </button>
        </div>

        <div className="mb-5 rounded border border-sentinel-green/30 bg-sentinel-green/10 p-4 text-sm leading-6 text-slate-200">
          <div className="mb-2 flex items-center gap-2 font-semibold text-sentinel-green">
            <CheckCircle2 size={16} />
            Privacy defaults
          </div>
          Online intelligence is off until enabled, project scans require selected folders, .env contents are never read, local code is not uploaded, and scheduled refresh remains manual by default.
        </div>

        {customizing && (
          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {permissionRows.map((row) => {
              const Icon = row.icon;
              const enabled = Boolean(permissions[row.key]);
              return (
                <button
                  key={row.key}
                  className={`flex min-h-[116px] items-start gap-3 rounded border p-4 text-left transition ${
                    enabled ? "border-cyan-400/40 bg-cyan-400/10" : "border-sentinel-border bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={() => toggle(row.key)}
                  type="button"
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded border ${enabled ? "border-cyan-400/40 text-cyan-300" : "border-sentinel-border text-slate-400"}`}>
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{row.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">{row.description}</span>
                    <span className={`mt-2 inline-flex rounded border px-2 py-0.5 text-[10px] uppercase tracking-wider ${enabled ? "border-sentinel-green/30 bg-sentinel-green/10 text-sentinel-green" : "border-sentinel-border bg-black/30 text-slate-500"}`}>
                      {enabled ? "Allowed" : "Ask later"}
                    </span>
                  </span>
                </button>
              );
            })}

            <label className="rounded border border-sentinel-border bg-white/5 p-4 text-sm text-slate-300 md:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-cyan-200/60">Refresh frequency</span>
              <select
                className="w-full rounded border border-sentinel-border bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                value={permissions.refresh_frequency}
                onChange={(event) => setPermissions((current) => ({ ...current, refresh_frequency: event.target.value as IntelligencePermissions["refresh_frequency"], scheduled_refresh_enabled: event.target.value !== "manual" }))}
              >
                <option value="manual">Manual only</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>
        )}

        {message && <p className="mb-4 rounded border border-sentinel-rose/40 bg-sentinel-rose/10 p-3 text-sm text-sentinel-rose">{message}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            className="inline-flex items-center justify-center gap-2 rounded border border-sentinel-border bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
            disabled={saving}
            onClick={() => setCustomizing(true)}
            type="button"
          >
            Customize Permissions
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded border border-sentinel-border bg-black/30 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
            disabled={saving}
            onClick={skip}
            type="button"
          >
            Skip for Now
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-sentinel-bg shadow-[0_0_18px_rgba(53,231,255,0.35)] hover:bg-cyan-300 disabled:opacity-50"
            disabled={saving}
            onClick={() => complete(customizing ? permissions : recommendedSetup)}
            type="button"
          >
            <ShieldCheck size={16} />
            {saving ? "Saving..." : customizing ? "Save Custom Setup" : "Enable Recommended Local Intelligence Setup"}
          </button>
        </div>
      </section>
    </div>
  );
}
