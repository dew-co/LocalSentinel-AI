import { Activity, Server } from "lucide-react";
import type { ModelStatus } from "../../types/api";

type Props = {
  status: ModelStatus | null;
};

export default function ModelStatusCard({ status }: Props) {
  return (
    <section className="panel rounded p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded bg-cyan-300/10 text-sentinel-cyan">
          <Server size={20} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/50">Model Runtime</p>
          <h3 className="font-semibold">Ollama</h3>
        </div>
      </div>
      <div className="space-y-2 text-sm text-slate-300">
        <p className="flex items-center gap-2">
          <Activity size={15} className={status?.ollamaRunning ? "text-sentinel-green" : "text-sentinel-rose"} />
          {status?.message ?? "Checking runtime..."}
        </p>
        <p>Base URL: {status?.baseUrl ?? "http://localhost:11434"}</p>
        <p>Active model: {status?.activeModel ?? "Not selected"}</p>
        <p>Recommended: {status?.recommendedModel ?? "Pending"}</p>
      </div>
    </section>
  );
}

