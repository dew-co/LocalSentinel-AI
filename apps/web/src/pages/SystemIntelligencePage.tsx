import { Activity, AlertTriangle, Box, Check, CheckCircle2, Cpu, FileWarning, RefreshCw, ShieldAlert, ShieldCheck, Terminal, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';

// Import icons correctly from lucide-react instead
import { Check as IconCheck, AlertTriangle as IconAlert, X as IconX, RefreshCw as IconRefresh, ShieldCheck as IconShield, Cpu as IconCpu, Box as IconBox, Terminal as IconTerminal } from 'lucide-react';

export function SystemIntelligencePage() {
  const [tools, setTools] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [models, setModels] = useState<any>(null);

  const fetchStatus = () => {
    fetch('http://localhost:8000/api/system/status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setTools(data.tools);
      }).catch(() => undefined);
      
    fetch('http://localhost:8000/api/system/readiness')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setReadiness(data.readiness);
      }).catch(() => undefined);
      
    fetch('http://localhost:8000/api/models/status')
      .then(res => res.json())
      .then(data => {
        setModels(data);
      }).catch(() => undefined);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleScan = () => {
    setScanning(true);
    fetch('http://localhost:8000/api/system/scan', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setTools(data.tools);
          fetchStatus();
        }
      })
      .finally(() => setScanning(false));
  };

  const installedTools = tools.filter(t => t.detected);
  const missingTools = tools.filter(t => !t.detected);

  return (
    <PageContainer>
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">System Intelligence</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
            <IconShield size={14} className="text-sentinel-green" /> 
            Local Runtime & Readiness Dashboard
            <span className="text-xs text-slate-500">(Only read-only checks are performed)</span>
          </p>
        </div>
        <button 
          onClick={handleScan} 
          disabled={scanning}
          className="flex items-center justify-center gap-2 rounded bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-cyan-400 disabled:opacity-50 shadow-[0_0_15px_rgba(53,231,255,0.4)]"
        >
          <IconRefresh size={16} className={scanning ? "animate-spin" : ""} />
          {scanning ? 'Scanning...' : 'Scan System Environment'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          
          {/* READINESS SUMMARY */}
          {readiness && (
            <section className="panel rounded-xl p-6">
              <div className="flex items-start gap-6">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-sentinel-green bg-sentinel-green/10 shadow-[0_0_30px_rgba(67,240,164,0.15)]">
                  <div className="text-center">
                    <span className="block text-3xl font-bold text-white">{readiness.score}<span className="text-sm">%</span></span>
                    <span className="text-[10px] uppercase tracking-wider text-sentinel-green">Readiness</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-white">System Environment Status: {readiness.readiness}</h3>
                  <p className="mb-4 text-sm text-slate-400">LocalSentinel has analyzed your development environment and determined it is suitable for local agentic operations.</p>
                  
                  {readiness.recommendations?.length > 0 && (
                    <div className="rounded border border-sentinel-amber/30 bg-sentinel-amber/10 p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sentinel-amber">
                        <IconAlert size={14} /> Recommended Fixes
                      </div>
                      <ul className="space-y-1 text-sm text-slate-300">
                        {readiness.recommendations.map((r: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 text-sentinel-amber">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* DEVELOPER TOOLS GRID */}
          <section className="panel rounded-xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-200/50">
              <IconTerminal size={14} /> Developer Tools
            </h3>
            
            {tools.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No tools scanned yet. Click 'Scan System' to detect environment.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {installedTools.map((tool, idx) => (
                  <div key={idx} className="flex flex-col justify-between rounded border border-sentinel-border bg-white/5 p-3 hover:bg-white/10 transition-colors">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{tool.tool_name}</span>
                      <IconCheck size={14} className="text-sentinel-green" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-cyan-400">{tool.version}</p>
                      <p className="mt-1 truncate text-[10px] text-slate-500" title={tool.path}>{tool.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {missingTools.length > 0 && (
              <div className="mt-4 border-t border-sentinel-border/50 pt-4">
                <h4 className="mb-3 text-xs font-medium text-slate-400">Missing Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {missingTools.map((tool, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 rounded border border-sentinel-rose/30 bg-sentinel-rose/10 px-2 py-1 text-xs text-sentinel-rose">
                      <IconX size={12} /> {tool.tool_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          
          {/* MODEL RUNTIME PANEL */}
          <section className="panel rounded-xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-200/50">
              <IconCpu size={14} /> Model Runtime
            </h3>
            
            <div className="mb-4 rounded border border-sentinel-border bg-black/40 p-4">
              <div className="mb-1 text-xs text-slate-500">Ollama Connection</div>
              <div className="flex items-center gap-2 font-medium">
                {models?.ollamaRunning ? (
                  <><div className="h-2 w-2 rounded-full bg-sentinel-green shadow-[0_0_8px_rgba(67,240,164,0.6)]"></div> <span className="text-sentinel-green">Online</span></>
                ) : (
                  <><div className="h-2 w-2 rounded-full bg-sentinel-rose"></div> <span className="text-sentinel-rose">Offline</span></>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded border border-sentinel-border bg-white/5 p-3">
                <span className="block text-[10px] uppercase text-slate-500">Active Model</span>
                <span className="block truncate text-sm font-semibold text-cyan-300 mt-1">
                  {models?.activeModel || "No model loaded"}
                </span>
              </div>
              
              <div className="rounded border border-sentinel-border bg-white/5 p-3">
                <span className="block text-[10px] uppercase text-slate-500">Recommended Model</span>
                <span className="block truncate text-sm font-semibold text-slate-300 mt-1">
                  {models?.recommendedModel || "llama3"}
                </span>
              </div>
            </div>
          </section>
          
          {/* ENVIRONMENT SUMMARY */}
          <section className="panel rounded-xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-200/50">
              <IconBox size={14} /> Summary
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between border-b border-sentinel-border/50 py-2">
                <span className="text-slate-500">OS Platform</span>
                <span>Linux</span>
              </div>
              <div className="flex justify-between border-b border-sentinel-border/50 py-2">
                <span className="text-slate-500">Installed Tools</span>
                <span>{installedTools.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Last Scan</span>
                <span>{tools.length > 0 ? "Just now" : "Never"}</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </PageContainer>
  );
}
