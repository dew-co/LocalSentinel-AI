import { useEffect, useState } from "react";
import { defaultSettings, saveSettings, SETTINGS_KEY, type LocalSentinelSettings } from "../lib/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) setSettings({ ...defaultSettings, ...JSON.parse(saved) });
  }, []);

  const update = (key: keyof LocalSentinelSettings, value: string | boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  return (
    <section className="panel mx-auto max-w-4xl rounded p-5">
      <h2 className="mb-5 text-2xl font-semibold">Settings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Text label="Ollama base URL" value={settings.ollamaBaseUrl} onChange={(value) => update("ollamaBaseUrl", value)} />
        <Text label="Active model" value={settings.activeModel} onChange={(value) => update("activeModel", value)} />
        <Text label="Default project path" value={settings.defaultProjectPath} onChange={(value) => update("defaultProjectPath", value)} />
        <Toggle label="Safe mode" checked={settings.safeMode} onChange={(value) => update("safeMode", value)} />
        <Toggle label="Voice mode" checked={settings.voiceMode} onChange={(value) => update("voiceMode", value)} />
        <Toggle label="Store voice summaries in memory" checked={settings.voiceMemory} onChange={(value) => update("voiceMemory", value)} />
        <Select label="Assistant tone" value={settings.assistantTone} options={["friendly", "calm", "concise", "teacher"]} onChange={(value) => update("assistantTone", value)} />
        <Select label="Response length" value={settings.responseLength} options={["brief", "balanced", "detailed"]} onChange={(value) => update("responseLength", value)} />
        <Toggle label="RAG indexing" checked={settings.ragEnabled} onChange={(value) => update("ragEnabled", value)} />
        <Toggle label="Auto-index changed files" checked={settings.autoIndex} onChange={(value) => update("autoIndex", value)} />
        <Toggle label="Auto-install approved models" checked={settings.autoInstallModels} onChange={(value) => update("autoInstallModels", value)} />
        <Toggle label="Online documentation updates" checked={settings.onlineDocs} onChange={(value) => update("onlineDocs", value)} />
      </div>
    </section>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-300">{label}</span>
      <input className="focus-ring w-full rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-300">{label}</span>
      <select className="focus-ring w-full rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded border border-sentinel-border bg-white/5 px-3 py-2 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
