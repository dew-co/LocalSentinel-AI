import { Loader2, Radar } from "lucide-react";
import { useState } from "react";
import { api } from "../../lib/api";
import type { SentimentResult } from "../../types/api";
import PriorityRadar from "./PriorityRadar";

export default function SentimentAnalyzer() {
  const [text, setText] = useState("The app keeps crashing after login and the client is very frustrated.");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      setResult(await api.sentiment(text));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="panel rounded p-5">
        <h2 className="mb-4 text-2xl font-semibold">Feedback Analysis</h2>
        <textarea className="focus-ring min-h-44 w-full rounded border border-sentinel-border bg-sentinel-bg/70 p-3 text-sm" value={text} onChange={(event) => setText(event.target.value)} />
        <button className="focus-ring mt-4 inline-flex items-center gap-2 rounded bg-sentinel-cyan px-4 py-2 font-medium text-sentinel-bg" onClick={analyze} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Radar size={18} />}
          Analyze
        </button>
        {result && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="Sentiment" value={result.sentiment} />
            <Metric label="Compound" value={String(result.compoundScore)} />
            <Metric label="Urgency" value={result.urgency} />
            <Metric label="Priority" value={result.priority} />
          </div>
        )}
      </section>
      <PriorityRadar result={result} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-sentinel-border bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/50">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

