import { Loader2, Radar, FolderKanban } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import type { SentimentResult } from "../../types/api";
import PriorityRadar from "./PriorityRadar";

export default function SentimentAnalyzer() {
  const [text, setText] = useState("The app keeps crashing after login and the client is very frustrated.");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const analyze = async () => {
    setLoading(true);
    try {
      setResult(await api.sentiment(text));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="panel rounded-xl border border-sentinel-border/50 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-xl flex flex-col">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">Feedback Input Matrix</h3>
        <textarea 
          className="min-h-44 w-full rounded-lg border border-sentinel-border bg-black/40 p-4 text-sm text-white shadow-inner focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50" 
          value={text} 
          onChange={(event) => setText(event.target.value)} 
          placeholder="Paste user feedback, bug reports, or communications here..."
        />
        
        <div className="mt-4 flex justify-end">
          <button 
            className="flex items-center gap-2 rounded bg-cyan-500 px-6 py-2.5 font-semibold text-slate-900 transition-all hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(53,231,255,0.4)] disabled:opacity-50 disabled:hover:shadow-none" 
            onClick={analyze} 
            disabled={loading || !text}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Radar size={18} />}
            {loading ? "Analyzing Matrix..." : "Analyze Sentiment"}
          </button>
        </div>

        {result && (
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-sentinel-border/30 pb-2">Analysis Results</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Sentiment" value={result.sentiment} highlight={result.sentiment === 'Negative' ? 'text-sentinel-rose' : result.sentiment === 'Positive' ? 'text-sentinel-green' : 'text-cyan-400'} />
              <Metric label="Compound" value={String(result.compoundScore)} highlight="text-white" />
              <Metric label="Urgency" value={result.urgency} highlight={result.urgency === 'High' ? 'text-sentinel-rose' : 'text-white'} />
              <Metric label="Priority" value={result.priority} highlight={result.priority === 'Critical' || result.priority === 'High' ? 'text-sentinel-amber' : 'text-white'} />
              <div className="sm:col-span-2 mt-4">
                <button 
                  onClick={async () => {
                    try {
                      await fetch('http://localhost:8000/api/tasks/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: "Feedback Task",
                          description: text,
                          priority: result.priority,
                          issue_category: "Feedback",
                          sentiment_source: result.sentiment,
                          status: "Backlog"
                        })
                      });
                      navigate('/task-board');
                    } catch (err) {
                      console.error("Failed to create task", err);
                    }
                  }}
                  className="flex w-full justify-center items-center gap-2 rounded bg-cyan-900/40 hover:bg-cyan-900/60 border border-cyan-500/50 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors shadow-sm"
                >
                  <FolderKanban size={16} />
                  Convert to Actionable Task
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
      <PriorityRadar result={result} />
    </div>
  );
}

function Metric({ label, value, highlight = "text-white" }: { label: string; value: string, highlight?: string }) {
  return (
    <div className="rounded border border-sentinel-border/50 bg-black/30 p-4 transition-colors hover:border-cyan-500/30">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight}`}>{value}</p>
    </div>
  );
}

