import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Database,
  DownloadCloud,
  Eye,
  Globe2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Wifi,
  WifiOff
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import { api } from "../lib/api";
import type { AdaptivePreference, IntelligenceItem, IntelligencePermissions, IntelligenceStatus } from "../types/api";

const statusClass = {
  green: "border-sentinel-green/30 bg-sentinel-green/10 text-sentinel-green",
  cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  amber: "border-sentinel-amber/30 bg-sentinel-amber/10 text-sentinel-amber",
  rose: "border-sentinel-rose/30 bg-sentinel-rose/10 text-sentinel-rose",
  slate: "border-sentinel-border bg-white/5 text-slate-300"
};

function StatusBadge({ label, tone = "slate", icon: Icon }: { label: string; tone?: keyof typeof statusClass; icon?: typeof CheckCircle2 }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium ${statusClass[tone]}`}>
      {Icon && <Icon size={13} />}
      {label}
    </span>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded border border-sentinel-border bg-white/5 p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
      </div>
      <button
        className={`relative h-7 w-12 shrink-0 rounded-full border transition ${enabled ? "border-sentinel-green/40 bg-sentinel-green/30" : "border-sentinel-border bg-black/40"}`}
        onClick={() => onChange(!enabled)}
        type="button"
        aria-label={title}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

export function IntelligenceCenterPage() {
  const [status, setStatus] = useState<IntelligenceStatus | null>(null);
  const [permissions, setPermissions] = useState<IntelligencePermissions | null>(null);
  const [items, setItems] = useState<IntelligenceItem[]>([]);
  const [preferences, setPreferences] = useState<AdaptivePreference[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [statusResult, itemResult, prefResult, historyResult, sourceResult] = await Promise.all([
        api.intelligenceStatus(),
        api.intelligenceItems({ limit: 8 }),
        api.adaptivePreferences(),
        api.intelligenceRefreshHistory(),
        api.intelligenceSources()
      ]);
      setStatus(statusResult);
      setPermissions(statusResult.permissions);
      setItems(itemResult.items);
      setPreferences(prefResult.preferences);
      setHistory(historyResult.history as any[]);
      setSources(sourceResult.sources as any[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const updatePermission = async (patch: Partial<IntelligencePermissions>) => {
    if (!permissions) return;
    const next = { ...permissions, ...patch };
    setPermissions(next);
    const result = await api.updateIntelligencePermissions(patch);
    setPermissions(result.permissions);
    await load();
  };

  const runRefresh = async () => {
    setRefreshing(true);
    setMessage("");
    try {
      const result = await api.refreshIntelligence();
      setMessage(`Refresh ${String((result as any).status)}. Saved ${(result as any).saved ?? 0}, updated ${(result as any).updated ?? 0}.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Refresh failed.");
    } finally {
      setRefreshing(false);
    }
  };

  const clearCache = async () => {
    if (!confirm("Clear all cached intelligence items from the local database?")) return;
    const result = await api.clearIntelligenceCache();
    setMessage(`Cleared ${result.removed} cached intelligence items.`);
    await load();
  };

  const deleteItem = async (id: string) => {
    await api.deleteIntelligenceItem(id);
    setMessage("Deleted cached intelligence item.");
    await load();
  };

  const deletePreference = async (id: string) => {
    await api.deleteAdaptivePreference(id);
    await load();
  };

  const domains = useMemo(() => Object.entries(status?.memory_domains ?? {}), [status]);
  const categories = useMemo(() => Object.entries(status?.source_categories ?? {}), [status]);
  const statCards: { label: string; value: string | number; icon: typeof Database }[] = [
    { label: "Cached Items", value: status?.cached_items ?? 0, icon: Database },
    { label: "Stale Items", value: status?.stale_items ?? 0, icon: AlertTriangle },
    { label: "Memory Domains", value: domains.length, icon: BrainCircuit },
    { label: "Last Refresh", value: status?.last_refresh ? new Date(status.last_refresh).toLocaleString() : "Never", icon: RefreshCw }
  ];

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-200">
            <BrainCircuit size={14} />
            LocalSentinel Intelligence Engine
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Intelligence Center</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
            Permission-based online-to-offline knowledge gathering, local cache controls, adaptive preferences, and transparent refresh history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={status?.online ? "Online" : "Offline"} tone={status?.online ? "green" : "amber"} icon={status?.online ? Wifi : WifiOff} />
          <StatusBadge label={status?.offline_cache_ready ? "Cache Ready" : "Refresh Needed"} tone={status?.offline_cache_ready ? "green" : "amber"} icon={Database} />
          <StatusBadge label={permissions?.online_intelligence_enabled ? "Online Intel On" : "Permission Required"} tone={permissions?.online_intelligence_enabled ? "cyan" : "amber"} icon={Globe2} />
          <StatusBadge label={permissions?.adaptive_memory_enabled ? "Adaptive Memory On" : "Adaptive Memory Off"} tone={permissions?.adaptive_memory_enabled ? "green" : "slate"} icon={BrainCircuit} />
          <StatusBadge label="Manual Mode" tone="slate" icon={Lock} />
        </div>
      </div>

      {message && <p className="mb-5 rounded border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">{message}</p>}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <section key={label} className="panel rounded border border-sentinel-border/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-cyan-200/50">{label}</span>
              <Icon size={17} className="text-cyan-300" />
            </div>
            <p className="text-2xl font-semibold text-white">{String(value)}</p>
          </section>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="panel rounded border border-sentinel-border/70 p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Permissions</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">Stored locally in consent settings. Online gathering and background refresh are never silently enabled.</p>
            </div>
            <ShieldCheck size={20} className="text-sentinel-green" />
          </div>

          {permissions ? (
            <div className="space-y-3">
              <ToggleRow title="Online intelligence" description="Allow manual public knowledge refresh from trusted development sources." enabled={permissions.online_intelligence_enabled} onChange={(enabled) => updatePermission({ online_intelligence_enabled: enabled })} />
              <ToggleRow title="System scan" description="Allow read-only developer tool scans to be stored in System Brain." enabled={permissions.system_scan_allowed} onChange={(enabled) => updatePermission({ system_scan_allowed: enabled })} />
              <ToggleRow title="Project scan" description="Allow project-linked intelligence using selected project metadata only." enabled={permissions.project_scan_allowed} onChange={(enabled) => updatePermission({ project_scan_allowed: enabled })} />
              <ToggleRow title="Offline cache" description="Save structured summaries, source URLs, dates, and usage counts locally." enabled={permissions.offline_cache_enabled} onChange={(enabled) => updatePermission({ offline_cache_enabled: enabled })} />
              <ToggleRow title="Adaptive memory" description="Learn non-sensitive preferences from approvals, rejections, selected models, and workflows." enabled={permissions.adaptive_memory_enabled} onChange={(enabled) => updatePermission({ adaptive_memory_enabled: enabled })} />

              <label className="block rounded border border-sentinel-border bg-white/5 p-3">
                <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-cyan-200/50">Refresh frequency</span>
                <select
                  className="w-full rounded border border-sentinel-border bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                  value={permissions.refresh_frequency}
                  onChange={(event) => updatePermission({ refresh_frequency: event.target.value as IntelligencePermissions["refresh_frequency"], scheduled_refresh_enabled: event.target.value !== "manual" })}
                >
                  <option value="manual">Manual only</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Loading permissions...</p>
          )}
        </section>

        <section className="panel rounded border border-sentinel-border/70 p-5 xl:col-span-7">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Manual Refresh</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">Refresh public summaries only after permission is enabled. Local project code is not uploaded.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-sentinel-bg hover:bg-cyan-300 disabled:opacity-50"
                disabled={refreshing || !permissions?.online_intelligence_enabled}
                onClick={runRefresh}
                type="button"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh Intelligence"}
              </button>
              <button className="inline-flex items-center gap-2 rounded border border-sentinel-rose/40 bg-sentinel-rose/10 px-4 py-2 text-sm text-sentinel-rose hover:bg-sentinel-rose hover:text-white" onClick={clearCache} type="button">
                <Trash2 size={16} />
                Clear Cache
              </button>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {domains.length === 0 ? (
              <StatusBadge label="No domains cached yet" tone="slate" />
            ) : (
              domains.map(([domain, count]) => <StatusBadge key={domain} label={`${domain}: ${count}`} tone="cyan" />)
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="rounded border border-sentinel-border bg-white/5 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge label={item.memory_domain || "Research Brain"} tone="cyan" />
                  <StatusBadge label={item.confidence_level || "medium"} tone="slate" />
                </div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{item.summary}</p>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-sentinel-border/50 pt-3 text-xs text-slate-500">
                  <span className="truncate">{item.source_name || item.source_url}</span>
                  <span className="shrink-0">{item.freshness_date ? new Date(item.freshness_date).toLocaleDateString() : "No date"}</span>
                  <button className="grid h-7 w-7 shrink-0 place-items-center rounded border border-sentinel-border bg-black/30 text-slate-400 hover:text-sentinel-rose" onClick={() => deleteItem(item.id)} type="button" title="Delete cached item">
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            ))}
            {!loading && items.length === 0 && (
              <div className="rounded border border-dashed border-sentinel-border p-8 text-center text-sm text-slate-500 md:col-span-2">
                No cached intelligence yet. Enable online intelligence, then run a manual refresh.
              </div>
            )}
          </div>
        </section>

        <section className="panel rounded border border-sentinel-border/70 p-5 xl:col-span-5">
          <div className="mb-4 flex items-center gap-2">
            <Eye size={18} className="text-cyan-300" />
            <h2 className="text-lg font-semibold text-white">Adaptive Learning Summary</h2>
          </div>
          <div className="space-y-3">
            {preferences.slice(0, 8).map((pref) => (
              <div key={pref.id} className="flex items-center justify-between gap-3 rounded border border-sentinel-border bg-white/5 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{pref.preference_key}</p>
                  <p className="truncate text-xs text-slate-400">{pref.preference_value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-cyan-200/50">Confidence {Math.round(pref.confidence * 100)}%</p>
                </div>
                <button className="grid h-8 w-8 shrink-0 place-items-center rounded border border-sentinel-border bg-black/30 text-slate-400 hover:text-sentinel-rose" onClick={() => deletePreference(pref.id)} type="button" title="Delete preference">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {preferences.length === 0 && <p className="rounded border border-dashed border-sentinel-border p-6 text-center text-sm text-slate-500">No adaptive preferences stored.</p>}
          </div>
        </section>

        <section className="panel rounded border border-sentinel-border/70 p-5 xl:col-span-7">
          <div className="mb-4 flex items-center gap-2">
            <DownloadCloud size={18} className="text-cyan-300" />
            <h2 className="text-lg font-semibold text-white">Sources and Timeline</h2>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <StatusBadge label="No source categories cached" tone="slate" />
            ) : (
              categories.map(([category, count]) => <StatusBadge key={category} label={`${category}: ${count}`} tone="slate" />)
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {sources.slice(0, 6).map((source) => (
              <div key={source.id ?? source.base_url} className="rounded border border-sentinel-border bg-white/5 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold text-white">{source.name}</span>
                  <StatusBadge label={source.allowed ? "Allowed" : "Off"} tone={source.allowed ? "green" : "slate"} />
                </div>
                <p className="truncate text-xs text-slate-400">{source.base_url}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge label={source.category || "uncategorized"} tone="cyan" />
                  <StatusBadge label={`Trust ${source.trust_level || "medium"}`} tone="slate" />
                </div>
              </div>
            ))}
          </div>

          <div className="relative ml-2 border-l border-sentinel-border/60 pl-5">
            {history.slice(0, 6).map((run) => (
              <div key={run.id} className="relative mb-5">
                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(53,231,255,0.7)]" />
                <div className="rounded border border-sentinel-border bg-white/5 p-3">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <StatusBadge label={run.status} tone={run.status === "completed" ? "green" : run.status === "blocked" ? "amber" : "slate"} />
                    <span className="text-xs text-slate-500">{run.started_at ? new Date(run.started_at).toLocaleString() : ""}</span>
                  </div>
                  <p className="text-sm text-slate-300">Found {run.items_found ?? 0}, saved {run.items_saved ?? 0}, updated {run.items_updated ?? 0}</p>
                </div>
              </div>
            ))}
            {history.length === 0 && <p className="rounded border border-dashed border-sentinel-border p-6 text-center text-sm text-slate-500">No refresh runs yet.</p>}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
