import { useEffect, useState } from "react";
import IndexingStatus from "../components/rag/IndexingStatus";
import MemoryPanel from "../components/rag/MemoryPanel";
import { api } from "../lib/api";

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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel rounded p-5">
        <h2 className="mb-4 text-2xl font-semibold">RAG Memory</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="focus-ring rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2 text-sm" value={projectId} onChange={(event) => setProjectId(event.target.value)} placeholder="Project ID" />
          <input className="focus-ring rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2 text-sm" value={path} onChange={(event) => setPath(event.target.value)} placeholder="Project path" />
        </div>
        <button className="focus-ring mt-3 rounded bg-sentinel-cyan px-4 py-2 text-sm font-medium text-sentinel-bg" onClick={index}>Index</button>
        <div className="mt-6 flex gap-2">
          <input className="focus-ring min-w-0 flex-1 rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search project context" />
          <button className="focus-ring rounded bg-white/10 px-3 py-2 text-sm hover:bg-white/15" onClick={search}>Query</button>
        </div>
        <div className="mt-4 space-y-3">
          {matches.map((match) => (
            <article key={`${match.filePath}-${match.score}`} className="rounded border border-sentinel-border bg-white/5 p-3">
              <p className="font-mono text-xs text-cyan-100">{match.filePath} score {match.score}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{match.preview}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="space-y-4">
        <IndexingStatus totalChunks={status?.totalChunks} projects={status?.projects} />
        <MemoryPanel projectId={projectId || undefined} />
      </div>
    </div>
  );
}
