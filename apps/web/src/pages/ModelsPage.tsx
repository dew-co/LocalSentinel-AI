import { useEffect, useState } from "react";
import ModelPullCard from "../components/models/ModelPullCard";
import ModelSelector from "../components/models/ModelSelector";
import ModelStatusCard from "../components/models/ModelStatusCard";
import { api } from "../lib/api";
import type { ModelInfo, ModelStatus } from "../types/api";

export default function ModelsPage() {
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [test, setTest] = useState("");

  const refresh = () => {
    api.modelStatus().then(setStatus).catch(() => setStatus(null));
    api.models().then(setModels).catch(() => setModels([]));
  };

  useEffect(refresh, []);

  const runTest = async () => {
    const result = await api.testModel(status?.activeModel ?? undefined);
    setTest(result.response || result.message);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ModelStatusCard status={status} />
      <ModelSelector models={models} onSelected={refresh} />
      <ModelPullCard />
      <section className="panel rounded p-4">
        <h3 className="mb-3 font-semibold">Model Smoke Test</h3>
        <button className="focus-ring rounded bg-sentinel-cyan px-4 py-2 text-sm font-medium text-sentinel-bg" onClick={runTest}>Run Test</button>
        {test && <p className="mt-3 rounded border border-sentinel-border bg-white/5 p-3 text-sm text-slate-300">{test}</p>}
      </section>
    </div>
  );
}

