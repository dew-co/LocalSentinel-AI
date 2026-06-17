import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatPanel from "../components/chat/ChatPanel";
import MemoryPanel from "../components/rag/MemoryPanel";
import StackBadge from "../components/projects/StackBadge";
import SentinelCore from "../components/sentinel/SentinelCore";
import type { SentinelCoreStatus } from "../components/sentinel/SentinelCore";
import { api } from "../lib/api";
import type { ModelStatus, ProjectRecord } from "../types/api";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [voiceRuntimeStatus, setVoiceRuntimeStatus] = useState<SentinelCoreStatus>("Ready");
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);

  useEffect(() => {
    if (id) api.project(id).then(setProject).catch(() => setProject(null));
    api.modelStatus().then(setModelStatus).catch(() => setModelStatus(null));
  }, [id]);

  return (
    <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(280px,0.85fr)_minmax(420px,1.15fr)] 2xl:grid-cols-[minmax(300px,360px)_minmax(420px,1fr)_minmax(300px,360px)]">
      <div className="space-y-4">
        <SentinelCore
          status={voiceRuntimeStatus !== "Ready" ? voiceRuntimeStatus : busy ? "Thinking" : "Ready"}
          responding={busy}
          voiceActive={voiceRuntimeStatus === "Listening"}
          modelOnline={Boolean(modelStatus?.ollamaRunning)}
          activeModel={modelStatus?.activeModel ?? modelStatus?.recommendedModel}
          memoryOnline
        />
        <section className="panel rounded p-4">
          <h2 className="text-xl font-semibold">{project?.name ?? "Project"}</h2>
          <p className="mt-2 break-all text-sm text-slate-400">{project?.path}</p>
          <div className="mt-4 flex flex-wrap gap-2">{project?.stack.map((item) => <StackBadge key={item} label={item} />)}</div>
        </section>
      </div>
      <ChatPanel projectId={id} onBusyChange={setBusy} onVoiceStatusChange={setVoiceRuntimeStatus} />
      <div className="xl:col-span-2 2xl:col-span-1">
        <MemoryPanel projectId={id} />
      </div>
    </div>
  );
}
