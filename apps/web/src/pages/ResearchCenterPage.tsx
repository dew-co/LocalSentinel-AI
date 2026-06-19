import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { BookOpen, FileSearch, Loader2, Save, Sparkles } from 'lucide-react';

export function ResearchCenterPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    fetch('http://localhost:8000/api/research/history')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setHistory(data.history);
      }).catch(() => undefined);
  };

  const handleResearch = () => {
    if (!query) return;
    setLoading(true);
    fetch('http://localhost:8000/api/research/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode: 'offline' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setResult(data.result);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleSave = () => {
    if (!result) return;
    fetch('http://localhost:8000/api/research/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: result.topic,
        summary: result.summary,
        sources: result.sources || [],
        recommendation: result.recommendation,
        assumptions: result.assumptions
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          fetchHistory();
          setResult(null);
          setQuery('');
        }
      });
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Research Center</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
          <BookOpen size={14} className="text-cyan-400" />
          Offline intelligence gathering and knowledge synthesis
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-10 flex gap-4">
        <div className="relative flex-1">
          <FileSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Research the best local coding model..."
            className="w-full rounded-xl border border-sentinel-border bg-black/40 py-4 pl-12 pr-4 text-base text-white shadow-inner focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
          />
        </div>
        <button 
          onClick={handleResearch} 
          disabled={loading || !query}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 px-8 font-semibold text-slate-900 transition-all hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(53,231,255,0.4)] disabled:opacity-50 disabled:hover:shadow-none"
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Gathering Data...</>
          ) : (
            <><Sparkles size={18} /> Initiate Research</>
          )}
        </button>
      </div>

      {/* Result Panel */}
      {result && (
        <div className="panel mb-12 rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 to-black/40 p-6 shadow-2xl">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="mb-2 inline-block rounded bg-cyan-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cyan-400 border border-cyan-500/20">Research Result</span>
              <h2 className="text-2xl font-bold text-white">{result.topic}</h2>
            </div>
            <button 
              onClick={handleSave} 
              className="flex items-center gap-2 rounded border border-cyan-500/30 bg-cyan-950/30 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
            >
              <Save size={16} /> Save to Knowledge Base
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="rounded border border-sentinel-border/50 bg-black/30 p-4 text-sm leading-relaxed text-slate-300">
              {result.summary}
            </p>
            
            <div className="rounded border border-cyan-500/20 bg-cyan-950/20 p-4 text-sm text-cyan-100">
              <strong className="text-cyan-300">Recommendation:</strong> {result.recommendation}
            </div>
            
            {result.assumptions && (
              <div className="text-xs text-slate-500 italic">
                Assumptions: {result.assumptions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Saved Research Notes</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {history.map((note, idx) => (
            <div key={idx} className="panel flex flex-col rounded-xl border border-sentinel-border/50 bg-white/5 p-5 transition-colors hover:border-cyan-500/30">
              <h3 className="mb-3 font-semibold text-white">{note.topic}</h3>
              <p className="text-sm text-slate-400 line-clamp-4">{note.summary}</p>
            </div>
          ))}
          {history.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-slate-500">
              <BookOpen size={32} className="mx-auto mb-3 opacity-20" />
              No saved research notes found.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
