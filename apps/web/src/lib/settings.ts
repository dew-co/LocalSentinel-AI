export type AssistantTone = "friendly" | "calm" | "concise" | "teacher";
export type ResponseLength = "brief" | "balanced" | "detailed";

export type LocalSentinelSettings = {
  ollamaBaseUrl: string;
  activeModel: string;
  defaultProjectPath: string;
  safeMode: boolean;
  voiceMode: boolean;
  ragEnabled: boolean;
  autoIndex: boolean;
  autoInstallModels: boolean;
  onlineDocs: boolean;
  voiceMemory: boolean;
  assistantTone: AssistantTone;
  responseLength: ResponseLength;
};

export const SETTINGS_KEY = "localsentinel-settings";

export const defaultSettings: LocalSentinelSettings = {
  ollamaBaseUrl: "http://localhost:11434",
  activeModel: "",
  defaultProjectPath: "",
  safeMode: true,
  voiceMode: true,
  ragEnabled: true,
  autoIndex: false,
  autoInstallModels: false,
  onlineDocs: false,
  voiceMemory: true,
  assistantTone: "friendly",
  responseLength: "balanced"
};

export function getSettings(): LocalSentinelSettings {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: LocalSentinelSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

