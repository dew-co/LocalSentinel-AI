import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Cpu, Activity, Clock, Shield, Database, Layout, Code, Server, TestTube, FileText, Search, Brain, Zap, Key, Users, X, ChevronLeft } from 'lucide-react';

export function AgentMapPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/agents/map')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setAgents(data.agents);
        }
      });
  }, []);

  const rootAgent = agents.find(a => a.name === 'Sentinel Lead Agent');
  
  // Grouping agents manually
  const engineeringNames = ['Frontend Agent', 'Backend Agent', 'Database Agent', 'Code Review Agent', 'Bug Fix Planner Agent', 'Test Agent', 'Security Agent'];
  const knowledgeNames = ['Project Scanner Agent', 'Research Agent', 'RAG Memory Agent', 'Documentation Agent'];
  const operationsNames = ['System Intelligence Agent', 'Sentiment Priority Agent', 'Safe Executor Agent'];

  const engineeringTeam = agents.filter(a => engineeringNames.includes(a.name));
  const knowledgeTeam = agents.filter(a => knowledgeNames.includes(a.name));
  const operationsTeam = agents.filter(a => operationsNames.includes(a.name));

  const getIconForAgent = (name: string) => {
    switch (name) {
      case 'Sentinel Lead Agent': return <Brain className="w-5 h-5" />;
      case 'Project Scanner Agent': return <Search className="w-5 h-5" />;
      case 'Code Review Agent': return <Code className="w-5 h-5" />;
      case 'Bug Fix Planner Agent': return <Activity className="w-5 h-5" />;
      case 'Frontend Agent': return <Layout className="w-5 h-5" />;
      case 'Backend Agent': return <Server className="w-5 h-5" />;
      case 'Database Agent': return <Database className="w-5 h-5" />;
      case 'Security Agent': return <Shield className="w-5 h-5" />;
      case 'Test Agent': return <TestTube className="w-5 h-5" />;
      case 'Documentation Agent': return <FileText className="w-5 h-5" />;
      case 'Research Agent': return <Search className="w-5 h-5" />;
      case 'System Intelligence Agent': return <Cpu className="w-5 h-5" />;
      case 'Sentiment Priority Agent': return <Zap className="w-5 h-5" />;
      case 'Safe Executor Agent': return <Key className="w-5 h-5" />;
      case 'RAG Memory Agent': return <Database className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  const getStatusColor = (state: string) => {
    if (state === 'active') return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    if (state === 'idle') return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
    return 'bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.5)]';
  };

  const AgentNode = ({ agent, isRoot = false }: { agent: any, isRoot?: boolean }) => {
    if (!agent) return null;
    const isSelected = selectedAgent?.name === agent.name;
    
    return (
      <div 
        onClick={() => {
          setSelectedAgent(agent);
          setDetailsOpen(true);
        }}
        className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
          isRoot ? 'w-80 z-10' : 'w-full z-10'
        }`}
      >
        <div className={`p-4 rounded-xl border backdrop-blur-md transition-colors ${
          isSelected 
            ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
            : 'bg-slate-900/40 border-cyan-500/20 hover:border-cyan-500/50'
        }`}>
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/80 text-gray-400'}`}>
              {getIconForAgent(agent.name)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">{agent.state}</span>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.state)}`} />
            </div>
          </div>
          
          <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-cyan-300' : 'text-gray-200'}`}>
            {agent.name}
          </h3>
          <p className="text-[10px] text-cyan-500/70 font-mono line-clamp-1">{agent.role}</p>
        </div>
      </div>
    );
  };

  const TeamGroup = ({ title, agents }: { title: string, agents: any[] }) => (
    <div className="flex-1 flex flex-col items-center min-w-[280px] px-4">
      <div className="mb-6 flex items-center gap-2 rounded-full border border-sentinel-border/50 bg-black/40 px-4 py-1.5 backdrop-blur-sm">
        <Users size={14} className="text-cyan-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">{title}</span>
      </div>
      <div className="flex w-full flex-col gap-4 relative">
        <div className="absolute left-1/2 top-[-24px] bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-cyan-500/30 via-cyan-500/10 to-transparent pointer-events-none" />
        {agents.map((agent, idx) => (
          <div key={idx} className="relative w-full">
             <AgentNode agent={agent} />
          </div>
        ))}
      </div>
    </div>
  );

  const selectedCapabilities = (() => {
    if (!selectedAgent?.capabilities_json) return [];
    try {
      return JSON.parse(selectedAgent.capabilities_json);
    } catch {
      return [];
    }
  })();

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-1 flex items-center gap-2">
            Teams Hierarchy
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Teams Hierarchy shows how LocalSentinel AI organizes its specialized internal modules and future agent roles.
          </p>
        </div>
      </div>

      <div className="relative h-[calc(100vh-160px)] overflow-hidden">
        {/* Tree Visualization Area */}
        <div className="h-full overflow-auto rounded-xl border border-sentinel-border/80 bg-gradient-to-b from-sentinel-bg/50 to-cyan-950/10 backdrop-blur-sm p-8 relative">
          <div className="min-w-[900px] flex flex-col items-center">
            
            {/* Root */}
            <div className="mb-12 relative flex flex-col items-center">
              <AgentNode agent={rootAgent} isRoot={true} />
              <div className="w-px h-12 bg-gradient-to-b from-cyan-500/60 to-cyan-500/20 absolute -bottom-12" />
            </div>

            {/* Horizontal Connector */}
            <div className="w-[66%] h-px bg-cyan-500/30 relative flex justify-center mb-8">
              <div className="w-px h-8 bg-cyan-500/30 absolute -top-8" />
              {/* Dropdowns for the 3 columns */}
              <div className="absolute left-0 w-px h-8 bg-cyan-500/30 top-0" />
              <div className="absolute left-1/2 -translate-x-1/2 w-px h-8 bg-cyan-500/30 top-0" />
              <div className="absolute right-0 w-px h-8 bg-cyan-500/30 top-0" />
            </div>

            {/* Teams Columns Grid */}
            <div className="flex w-full justify-between items-start pt-2">
              <TeamGroup title="Knowledge Team" agents={knowledgeTeam} />
              <TeamGroup title="Engineering Team" agents={engineeringTeam} />
              <TeamGroup title="Operations Team" agents={operationsTeam} />
            </div>

          </div>
        </div>

        {detailsOpen && selectedAgent && (
          <button
            className="absolute inset-0 z-20 bg-black/30 backdrop-blur-[1px] lg:hidden"
            onClick={() => setDetailsOpen(false)}
            type="button"
            aria-label="Close agent details overlay"
          />
        )}

        {selectedAgent && !detailsOpen && (
          <button
            className="absolute right-0 top-1/2 z-30 flex -translate-y-1/2 items-center gap-2 rounded-l border border-r-0 border-cyan-500/30 bg-sentinel-bg/95 px-3 py-2 text-xs font-medium uppercase tracking-wider text-cyan-200 shadow-2xl backdrop-blur-md hover:bg-cyan-500/10"
            onClick={() => setDetailsOpen(true)}
            type="button"
          >
            <ChevronLeft size={14} />
            Details
          </button>
        )}

        {/* Details Drawer */}
        <aside
          className={`absolute right-0 top-0 z-30 h-full w-full max-w-md transform transition-all duration-300 ease-out ${
            detailsOpen && selectedAgent ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
          }`}
          aria-hidden={!detailsOpen}
        >
          {selectedAgent && (
          <Card className="h-full w-full overflow-auto rounded-l-xl rounded-r-xl border border-sentinel-border/80 bg-sentinel-bg/95 shadow-[-24px_0_60px_rgba(0,0,0,0.45)] backdrop-blur-md lg:rounded-r-none">
            <CardHeader className="border-b border-sentinel-border/50 pb-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                    {getIconForAgent(selectedAgent.name)}
                    {selectedAgent.name}
                  </CardTitle>
                  <div className="text-[11px] text-cyan-500/70 mt-1.5 font-mono uppercase tracking-wider">{selectedAgent.role}</div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(selectedAgent.state)}`} />
                  <button
                    className="grid h-8 w-8 place-items-center rounded border border-sentinel-border bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={() => setDetailsOpen(false)}
                    type="button"
                    title="Collapse details"
                    aria-label="Collapse agent details"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">Description & Ownership</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-black/20 p-3 rounded border border-sentinel-border/50">
                  {selectedAgent.description}
                </p>
              </div>

              {selectedCapabilities.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">Capabilities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCapabilities.map((cap: string, i: number) => (
                      <span key={i} className="rounded border border-cyan-500/20 bg-cyan-950/30 px-2 py-1 text-[10px] text-cyan-200">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 p-3 rounded border border-sentinel-border/50">
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-semibold">State</h4>
                  <div className="text-sm font-medium text-slate-200 capitalize">
                    {selectedAgent.state}
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded border border-sentinel-border/50">
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-semibold">Service</h4>
                  <div className="text-sm font-medium text-slate-200 truncate">
                    {selectedAgent.related_service || 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold flex items-center gap-1.5">
                  <Clock size={12} /> Recent Activity
                </h4>
                <div className="bg-black/20 border border-sentinel-border/50 rounded p-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1 shrink-0 shadow-[0_0_8px_rgba(53,231,255,0.6)]" />
                      <div>
                        <p className="text-slate-300 text-xs">Last Initialized</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">
                          {selectedAgent.last_used_at ? new Date(selectedAgent.last_used_at).toLocaleString() : 'Never used yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}
