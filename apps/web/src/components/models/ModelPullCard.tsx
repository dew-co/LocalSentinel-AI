import { Download, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { api } from "../../lib/api";

export default function ModelPullCard() {
  const [model, setModel] = useState("qwen2.5-coder:7b");
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState("");

  const pull = async () => {
    const response = await api.pullModel(model, approved);
    setMessage(JSON.stringify(response, null, 2));
  };

  return (
    <section className="panel rounded p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlert size={18} className="text-sentinel-amber" />
        <h3 className="font-semibold">Model Pull Approval</h3>
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <input className="focus-ring flex-1 rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2 text-sm" value={model} onChange={(event) => setModel(event.target.value)} />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} />
          Approved
        </label>
        <button className="focus-ring inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-sm hover:bg-white/15" onClick={pull}>
          <Download size={16} />
          Pull
        </button>
      </div>
      {message && <pre className="mt-3 overflow-x-auto rounded border border-sentinel-border bg-sentinel-bg/70 p-3 text-xs text-slate-300">{message}</pre>}
    </section>
  );
}

