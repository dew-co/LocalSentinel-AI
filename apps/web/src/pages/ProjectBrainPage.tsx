import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { BrainCircuit, Database, Filter, Search, Tag } from 'lucide-react';
import { api } from '../lib/api';
import type { IntelligenceItem } from '../types/api';

export function ProjectBrainPage() {
  const [memory, setMemory] = useState<any[]>([]);
  const [intelligence, setIntelligence] = useState<IntelligenceItem[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/memory/search?query=')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setMemory(data.results || []);
        }
      }).catch(() => undefined);
    api.intelligenceItems({ limit: 24 })
      .then(data => setIntelligence(data.items.filter(item => ['Project Brain', 'Framework Brain', 'Package Brain', 'Error Solution Brain'].includes(item.memory_domain))))
      .catch(() => undefined);
  }, []);

  const filteredIntelligence = intelligence.filter(item => {
    const text = `${item.title} ${item.summary} ${item.memory_domain} ${item.category}`.toLowerCase();
    return !query || text.includes(query.toLowerCase());
  });

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Project Brain</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
            <Database size={14} className="text-cyan-400" /> 
            Context & Memory Browser
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search memory..." 
              className="w-full rounded border border-sentinel-border bg-black/40 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
          <button className="flex items-center gap-2 rounded border border-sentinel-border bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <BrainCircuit size={18} className="text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Project Intelligence Cache</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredIntelligence.map((item) => (
            <article key={item.id} className="panel rounded-xl border border-sentinel-border/50 bg-white/5 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded border border-cyan-500/20 bg-cyan-950/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cyan-300">
                  {item.memory_domain}
                </span>
                <span className="rounded border border-sentinel-border bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                  {item.category}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-400">{item.summary}</p>
              <div className="mt-3 border-t border-sentinel-border/40 pt-3 text-[10px] uppercase tracking-wider text-slate-500">
                {item.source_name || 'Local cache'} · {item.freshness_date ? new Date(item.freshness_date).toLocaleDateString() : 'No date'}
              </div>
            </article>
          ))}
          {filteredIntelligence.length === 0 && (
            <div className="rounded-xl border border-dashed border-sentinel-border p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-4">
              No project, framework, package, or error-solution intelligence is cached yet.
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {memory.map((item, idx) => (
          <div key={idx} className="panel flex flex-col rounded-xl p-5 border border-sentinel-border/50 bg-gradient-to-br from-white/5 to-transparent hover:border-cyan-500/30 transition-all group">
            <div className="mb-3 flex items-start justify-between">
              <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                {item.title || 'Memory Item'}
              </h3>
              <span className="shrink-0 rounded bg-cyan-950/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
                {item.memory_type || 'General'}
              </span>
            </div>
            
            <p className="text-sm text-slate-300 line-clamp-4 flex-1 mb-4">
              {item.content}
            </p>
            
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-sentinel-border/30">
                {item.tags.map((t: string, i: number) => (
                  <span key={i} className="flex items-center gap-1 rounded bg-black/30 px-2 py-1 text-[10px] text-slate-400 border border-white/5">
                    <Tag size={10} /> {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {memory.length === 0 && (
          <div className="col-span-full py-12 text-center flex flex-col items-center">
            <Database size={32} className="mb-3 text-slate-600 opacity-50" />
            <p className="text-slate-400">No memory items found in the Project Brain.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
