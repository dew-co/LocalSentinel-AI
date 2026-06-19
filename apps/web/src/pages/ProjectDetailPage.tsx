import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatPanel from "../components/chat/ChatPanel";
import MemoryPanel from "../components/rag/MemoryPanel";
import StackBadge from "../components/projects/StackBadge";
import SentinelNeuralCompanion from "../components/sentinel/SentinelNeuralCompanion";
import type { SentinelCoreStatus } from "../components/sentinel/SentinelCore";
import { api } from "../lib/api";
import type { ModelStatus, ProjectRecord } from "../types/api";
import { PageContainer } from "../components/layout/PageContainer";
import { Database, FolderGit2 } from "lucide-react";

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

  const status = voiceRuntimeStatus !== "Ready" ? voiceRuntimeStatus : busy ? "Thinking" : "Ready";

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-3">
            <FolderGit2 className="text-cyan-400" size={28} />
            {project?.name ?? "Project Workspace"}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400 font-mono">
            {project?.path || "Loading project path..."}
          </p>
        </div>
      </div>

      <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(280px,320px)_minmax(420px,1fr)_minmax(300px,360px)]">
        <div className="space-y-6">
          <div className="panel flex flex-col rounded-xl overflow-hidden border border-sentinel-border/80 bg-gradient-to-b from-sentinel-bg/50 to-cyan-950/10 backdrop-blur-sm shadow-xl p-4">
            <SentinelNeuralCompanion status={status} />
          </div>
          
          <section className="panel rounded-xl p-5 shadow-xl border border-sentinel-border/50 bg-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Project Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project?.stack.map((item) => <StackBadge key={item} label={item} />)}
              {(!project?.stack || project.stack.length === 0) && (
                <span className="text-sm text-slate-500">No stack detected</span>
              )}
            </div>
          </section>
        </div>
        
        <div className="flex flex-col rounded-xl overflow-hidden border border-sentinel-border/50 shadow-xl bg-black/20">
          <ChatPanel projectId={id} onBusyChange={setBusy} onVoiceStatusChange={setVoiceRuntimeStatus} />
        </div>
        
        <div className="xl:col-span-2 2xl:col-span-1 space-y-6">
          <section className="panel rounded-xl border border-sentinel-border/50 bg-white/5 shadow-xl p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
              <Database size={16} className="text-cyan-400" /> Active RAG Memory
            </h3>
            <MemoryPanel projectId={id} />
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
