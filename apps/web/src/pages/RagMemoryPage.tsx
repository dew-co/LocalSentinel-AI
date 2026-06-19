import { useEffect, useState } from "react";
import IndexingStatus from "../components/rag/IndexingStatus";
import MemoryPanel from "../components/rag/MemoryPanel";
import { api } from "../lib/api";
import { PageContainer } from "../components/layout/PageContainer";
import { Database, Search, FolderSync } from "lucide-react";

export default function RagMemoryPage() {
  const [projectId, setProjectId] = useState("");
  const [path, setPath] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<{ totalChunks: number; projects: { projectId: string; root: string; chunks: number }[] } | null>(null);
  const [matches, setMatches] = useState<{ filePath: string; score: number; preview: string }[]>([]);

  const refresh = () => api.ragStatus().then(setStatus).catch(() => undefined);
  useEffect(() => {
    refresh();
  }, []);

  const index = async () => {
    await api.indexProject({ projectId: projectId || undefined, path: path || undefined });
    refresh();
  };

  const search = async () => {
    const result = await api.ragQuery(query, projectId || undefined);
    setMatches(result.matches);
  };

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">RAG Memory Matrix</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
            <Database size={14} className="text-cyan-400" /> 
            Manage embedded codebase context and memory
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex flex-col gap-6">
          <div className="panel rounded-xl border border-sentinel-border/50 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-xl">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">Index Project Context</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <input 
                className="w-full rounded border border-sentinel-border bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50" 
                value={projectId} 
                onChange={(event) => setProjectId(event.target.value)} 
                placeholder="Project ID (e.g. localsentinel-ai)" 
              />
              <input 
                className="w-full rounded border border-sentinel-border bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50" 
                value={path} 
                onChange={(event) => setPath(event.target.value)} 
                placeholder="Absolute Path to Project" 
              />
            </div>
            <button 
              className="mt-4 flex items-center gap-2 rounded bg-cyan-500 px-6 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan-400 shadow-[0_0_15px_rgba(53,231,255,0.3)]" 
              onClick={index}
            >
              <FolderSync size={16} /> Force Index Project
            </button>
          </div>

          <div className="panel flex-1 rounded-xl border border-sentinel-border/50 bg-white/5 p-6 shadow-xl">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">Query Embedded Knowledge</h3>
            <div className="mb-6 flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  className="w-full rounded border border-sentinel-border bg-black/40 py-2 pl-9 pr-4 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50" 
                  value={query} 
                  onChange={(event) => setQuery(event.target.value)} 
                  placeholder="Semantic search across embedded files..." 
                  onKeyDown={(e) => e.key === 'Enter' && search()}
                />
              </div>
              <button 
                className="rounded border border-cyan-500/30 bg-cyan-950/40 px-6 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-950/60 hover:text-cyan-300" 
                onClick={search}
              >
                Search
              </button>
            </div>
            
            <div className="space-y-4">
              {matches.map((match) => (
                <article key={`${match.filePath}-${match.score}`} className="rounded-lg border border-sentinel-border/50 bg-black/30 p-4 transition-colors hover:border-cyan-500/30">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-mono text-xs font-medium text-cyan-300">{match.filePath}</p>
                    <span className="rounded bg-cyan-950/50 px-2 py-0.5 text-[10px] font-semibold text-cyan-500 border border-cyan-500/20">Score: {match.score.toFixed(3)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-mono bg-black/20 p-2 rounded">{match.preview}</p>
                </article>
              ))}
              {matches.length === 0 && query && (
                <div className="py-8 text-center text-sm text-slate-500">
                  No semantic matches found for this query.
                </div>
              )}
            </div>
          </div>
        </section>
        
        <div className="space-y-6">
          <IndexingStatus totalChunks={status?.totalChunks} projects={status?.projects} />
          <MemoryPanel projectId={projectId || undefined} />
        </div>
      </div>
    </PageContainer>
  );
}
