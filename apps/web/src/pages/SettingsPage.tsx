import { useEffect, useState } from "react";
import { defaultSettings, saveSettings, SETTINGS_KEY, type LocalSentinelSettings } from "../lib/settings";
import { PageContainer } from "../components/layout/PageContainer";
import { Settings2, Cpu, Mic, Zap, Shield, BrainCircuit } from "lucide-react";
import { api } from "../lib/api";
import type { IntelligencePermissions } from "../types/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [intelligence, setIntelligence] = useState<IntelligencePermissions | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) setSettings({ ...defaultSettings, ...JSON.parse(saved) });
    api.intelligencePermissions()
      .then((data) => setIntelligence(data.permissions))
      .catch(() => undefined);
  }, []);

  const update = (key: keyof LocalSentinelSettings, value: string | boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const updateIntelligence = async (patch: Partial<IntelligencePermissions>) => {
    const result = await api.updateIntelligencePermissions(patch);
    setIntelligence(result.permissions);
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">System Configuration</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
          <Settings2 size={14} className="text-cyan-400" />
          Manage global preferences and Sentinel behaviors
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Core System */}
        <section className="panel rounded-xl border border-sentinel-border/50 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-xl">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-sentinel-border/30 pb-2">
            <Cpu size={16} className="text-cyan-400" /> Core Engine
          </h3>
          <div className="space-y-4">
            <Text label="Ollama base URL" value={settings.ollamaBaseUrl} onChange={(value) => update("ollamaBaseUrl", value)} />
            <Text label="Active model" value={settings.activeModel} onChange={(value) => update("activeModel", value)} />
            <Text label="Default project path" value={settings.defaultProjectPath} onChange={(value) => update("defaultProjectPath", value)} />
          </div>
        </section>

        {/* Behavior & Voice */}
        <section className="panel rounded-xl border border-sentinel-border/50 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-xl">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-sentinel-border/30 pb-2">
            <Mic size={16} className="text-indigo-400" /> Interface & Voice
          </h3>
          <div className="space-y-4">
            <Select label="Assistant tone" value={settings.assistantTone} options={["friendly", "calm", "concise", "teacher"]} onChange={(value) => update("assistantTone", value)} />
            <Select label="Response length" value={settings.responseLength} options={["brief", "balanced", "detailed"]} onChange={(value) => update("responseLength", value)} />
            <div className="pt-2 space-y-3">
              <Toggle label="Voice mode enabled" checked={settings.voiceMode} onChange={(value) => update("voiceMode", value)} />
              <Toggle label="Store voice summaries in memory" checked={settings.voiceMemory} onChange={(value) => update("voiceMemory", value)} />
            </div>
          </div>
        </section>

        {/* Memory & Automation */}
        <section className="panel rounded-xl border border-sentinel-border/50 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-xl">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-sentinel-border/30 pb-2">
            <Zap size={16} className="text-amber-400" /> Memory & Automation
          </h3>
          <div className="space-y-3">
            <Toggle label="RAG indexing engine" checked={settings.ragEnabled} onChange={(value) => update("ragEnabled", value)} />
            <Toggle label="Auto-index changed files" checked={settings.autoIndex} onChange={(value) => update("autoIndex", value)} />
            <Toggle label="Auto-install approved models" checked={settings.autoInstallModels} onChange={(value) => update("autoInstallModels", value)} />
            <Toggle label="Online documentation updates" checked={settings.onlineDocs} onChange={(value) => update("onlineDocs", value)} />
          </div>
        </section>

        {/* Security */}
        <section className="panel rounded-xl border border-sentinel-border/50 bg-gradient-to-br from-sentinel-rose/5 to-transparent p-6 shadow-xl">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-sentinel-rose border-b border-sentinel-border/30 pb-2">
            <Shield size={16} /> Security Constraints
          </h3>
          <div className="space-y-3">
            <Toggle 
              label="Safe mode (require approval for all actions)" 
              checked={settings.safeMode} 
              onChange={(value) => update("safeMode", value)} 
              highlight={settings.safeMode ? "text-sentinel-green" : "text-sentinel-rose"}
            />
            <p className="text-xs text-slate-500 leading-relaxed">
              When Safe Mode is disabled, LocalSentinel may execute terminal commands, modify files, and access external services without explicit user approval. Proceed with caution.
            </p>
          </div>
        </section>

        {/* Intelligence Engine */}
        <section className="panel rounded-xl border border-sentinel-border/50 bg-gradient-to-br from-cyan-950/10 to-transparent p-6 shadow-xl md:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-sentinel-border/30 pb-2">
            <BrainCircuit size={16} className="text-cyan-400" /> Intelligence Engine Permissions
          </h3>
          {intelligence ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Toggle label="online_intelligence_enabled" checked={intelligence.online_intelligence_enabled} onChange={(value) => updateIntelligence({ online_intelligence_enabled: value })} />
              <Toggle label="system_scan_allowed" checked={intelligence.system_scan_allowed} onChange={(value) => updateIntelligence({ system_scan_allowed: value })} />
              <Toggle label="project_scan_allowed" checked={intelligence.project_scan_allowed} onChange={(value) => updateIntelligence({ project_scan_allowed: value })} />
              <Toggle label="adaptive_memory_enabled" checked={intelligence.adaptive_memory_enabled} onChange={(value) => updateIntelligence({ adaptive_memory_enabled: value })} />
              <Toggle label="offline_cache_enabled" checked={intelligence.offline_cache_enabled} onChange={(value) => updateIntelligence({ offline_cache_enabled: value })} />
              <label className="block rounded border border-sentinel-border/50 bg-black/20 px-4 py-3 text-sm">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">refresh_frequency</span>
                <select
                  className="w-full rounded border border-sentinel-border bg-black/40 px-3 py-2 text-white focus:border-cyan-500/50 focus:outline-none"
                  value={intelligence.refresh_frequency}
                  onChange={(event) => updateIntelligence({ refresh_frequency: event.target.value as IntelligencePermissions["refresh_frequency"], scheduled_refresh_enabled: event.target.value !== "manual" })}
                >
                  <option value="manual">manual</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                </select>
              </label>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Loading intelligence permissions...</p>
          )}
        </section>
      </div>
    </PageContainer>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <input 
        className="w-full rounded border border-sentinel-border bg-black/40 px-3 py-2 text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all" 
        value={value} 
        onChange={(event) => onChange(event.target.value)} 
      />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <select 
        className="w-full rounded border border-sentinel-border bg-black/40 px-3 py-2 text-white appearance-none focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all" 
        value={value} 
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-900 capitalize">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange, highlight = "text-white" }: { label: string; checked: boolean; onChange: (value: boolean) => void; highlight?: string }) {
  return (
    <label className="flex items-center justify-between rounded border border-sentinel-border/50 bg-black/20 px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-black/40 hover:border-cyan-500/30">
      <span className={`font-medium ${highlight}`}>{label}</span>
      <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-slate-600'}`}>
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
