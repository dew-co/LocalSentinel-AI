import { useEffect, useState } from "react";
import ModelPullCard from "../components/models/ModelPullCard";
import ModelSelector from "../components/models/ModelSelector";
import ModelStatusCard from "../components/models/ModelStatusCard";
import { api } from "../lib/api";
import type { ModelInfo, ModelStatus } from "../types/api";
import { PageContainer } from "../components/layout/PageContainer";
import { Cpu, PlayCircle } from "lucide-react";

export default function ModelsPage() {
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [test, setTest] = useState("");
  const [loadingTest, setLoadingTest] = useState(false);

  const refresh = () => {
    api.modelStatus().then(setStatus).catch(() => setStatus(null));
    api.models().then(setModels).catch(() => setModels([]));
  };

  useEffect(refresh, []);

  const runTest = async () => {
    setLoadingTest(true);
    try {
      const result = await api.testModel(status?.activeModel ?? undefined);
      setTest(result.response || result.message);
    } catch (e: any) {
      setTest(e.message || "Test failed.");
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Local Models</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
          <Cpu size={14} className="text-cyan-400" />
          Manage and monitor Ollama neural weights
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ModelStatusCard status={status} />
        <ModelSelector models={models} onSelected={refresh} />
        <ModelPullCard />
        
        {/* Smoke Test Panel */}
        <section className="panel rounded-xl border border-sentinel-border/50 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between border-b border-sentinel-border/30 pb-3">
            <h3 className="font-semibold text-white">Model Smoke Test</h3>
            <button 
              className="flex items-center gap-2 rounded bg-cyan-500/10 border border-cyan-500/50 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20 disabled:opacity-50" 
              onClick={runTest}
              disabled={loadingTest}
            >
              <PlayCircle size={14} />
              {loadingTest ? "Running..." : "Run Diagnostic"}
            </button>
          </div>
          
          <div className="min-h-[100px]">
            {test ? (
              <p className="rounded border border-sentinel-border/50 bg-black/40 p-4 text-sm leading-relaxed text-cyan-100 shadow-inner">
                {test}
              </p>
            ) : (
              <div className="flex h-full items-center justify-center rounded border border-dashed border-sentinel-border/50 p-6 text-sm text-slate-500">
                Run a diagnostic to verify the active model's response capability.
              </div>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
