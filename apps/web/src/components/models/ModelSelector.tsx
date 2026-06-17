import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../lib/api";
import type { ModelInfo } from "../../types/api";

type Props = {
  models: ModelInfo[];
  onSelected: () => void;
};

export default function ModelSelector({ models, onSelected }: Props) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const choose = async () => {
    if (!selected) return;
    setLoading(true);
    await api.selectModel(selected);
    setLoading(false);
    onSelected();
  };

  return (
    <section className="panel rounded p-4">
      <h3 className="mb-3 font-semibold">Available Models</h3>
      <div className="flex gap-2">
        <select className="focus-ring flex-1 rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2 text-sm" value={selected} onChange={(event) => setSelected(event.target.value)}>
          <option value="">Select model</option>
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
        <button className="focus-ring inline-flex items-center gap-2 rounded bg-sentinel-cyan px-3 py-2 text-sm font-medium text-sentinel-bg" onClick={choose} disabled={loading || !selected}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
          Select
        </button>
      </div>
      {models.length === 0 && <p className="mt-3 text-sm text-slate-400">No local models found.</p>}
    </section>
  );
}

