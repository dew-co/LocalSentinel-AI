import { Activity, AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, Filter, Info, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';

export function ActivityConsolePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/activity')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setLogs(data.logs);
      })
      .finally(() => setLoading(false));
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all operational activity logs?')) {
      fetch('http://localhost:8000/api/activity/clear', { method: 'DELETE' })
        .then(() => fetchLogs());
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertCircle size={14} className="text-sentinel-rose" />;
      case 'warning': return <AlertTriangle size={14} className="text-sentinel-amber" />;
      case 'success': return <CheckCircle2 size={14} className="text-sentinel-green" />;
      default: return <Info size={14} className="text-cyan-400" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-sentinel-rose/30 bg-sentinel-rose/5 text-sentinel-rose';
      case 'warning': return 'border-sentinel-amber/30 bg-sentinel-amber/5 text-sentinel-amber';
      case 'success': return 'border-sentinel-green/30 bg-sentinel-green/5 text-sentinel-green';
      default: return 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300';
    }
  };

  const filteredLogs = filterType === 'all' ? logs : logs.filter(l => l.activity_type === filterType);

  return (
    <PageContainer>
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Activity Console</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
            <Activity size={14} className="text-cyan-400" /> 
            Operational Timeline & Audit Logs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none rounded border border-sentinel-border bg-black/40 py-2 pl-3 pr-8 text-sm text-slate-300 outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Events</option>
              <option value="system">System</option>
              <option value="memory">Memory</option>
              <option value="agent">Agent</option>
              <option value="user">User</option>
              <option value="intelligence_refresh_started">Intelligence Refresh</option>
              <option value="intelligence_item_saved">Intelligence Items</option>
              <option value="intelligence_cache_cleared">Cache Clearing</option>
              <option value="adaptive_preference_learned">Adaptive Memory</option>
            </select>
            <Filter size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
          <button 
            onClick={handleClear} 
            className="flex items-center gap-2 rounded border border-sentinel-rose/50 bg-sentinel-rose/10 px-3 py-2 text-sm font-medium text-sentinel-rose transition-colors hover:bg-sentinel-rose hover:text-white"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* SUMMARY STRIP */}
      <div className="mb-6 flex gap-4 overflow-x-auto rounded border border-sentinel-border bg-white/5 px-4 py-3 text-sm">
        <div className="flex shrink-0 items-center gap-2 border-r border-sentinel-border/50 pr-4">
          <span className="text-slate-500">Total Events:</span>
          <span className="font-semibold text-white">{logs.length}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 border-r border-sentinel-border/50 pr-4">
          <span className="text-slate-500">Errors:</span>
          <span className="font-semibold text-sentinel-rose">{logs.filter(l => l.severity === 'error').length}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 border-r border-sentinel-border/50 pr-4">
          <span className="text-slate-500">Warnings:</span>
          <span className="font-semibold text-sentinel-amber">{logs.filter(l => l.severity === 'warning').length}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-slate-500">Status:</span>
          <span className="flex items-center gap-1.5 font-medium text-sentinel-green">
             <div className="h-1.5 w-1.5 rounded-full bg-sentinel-green"></div> Recording Active
          </span>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="panel flex min-h-[500px] flex-col rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-slate-500">Loading timeline...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-slate-500">
            <Activity size={32} className="mb-3 opacity-20" />
            <p>No operational events found.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="relative border-l border-sentinel-border/50 ml-3 space-y-6 sm:ml-4">
              {filteredLogs.map((log, idx) => (
                <div key={idx} className="relative pl-6 sm:pl-8">
                  {/* Timeline node */}
                  <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full border border-black bg-cyan-500 shadow-[0_0_8px_rgba(53,231,255,0.6)]"></div>
                  
                  <div className="group rounded border border-transparent hover:border-sentinel-border hover:bg-white/5 transition-all p-3 -mt-3">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <time className="text-xs font-mono text-cyan-400/80">{formatTime(log.created_at)}</time>
                      <span className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] uppercase tracking-wider border ${getSeverityClass(log.severity)}`}>
                        {getSeverityIcon(log.severity)} {log.severity || 'info'}
                      </span>
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase text-slate-400">
                        {log.activity_type}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-semibold text-white mb-1">{log.title}</h4>
                    {log.description && (
                      <p className="text-sm text-slate-400 line-clamp-2 group-hover:line-clamp-none transition-all">
                        {log.description}
                      </p>
                    )}
                    
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-3 rounded border border-sentinel-border/50 bg-black/30 p-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                          <ChevronDown size={12} /> Metadata Details
                        </div>
                        <pre className="text-[10px] text-slate-400 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
