import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Cpu, Activity, Clock, Shield, Database, Layout, Code, Server, TestTube, FileText, Search, Brain, Zap, Key, Users } from 'lucide-react';

export function AgentMapPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/agents/map')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setAgents(data.agents);
          const root = data.agents.find((a: any) => a.name === 'Sentinel Lead Agent');
          if (root) setSelectedAgent(root);
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
        onClick={() => setSelectedAgent(agent)}
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

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
        {/* Tree Visualization Area */}
        <div className="flex-1 overflow-auto rounded-xl border border-sentinel-border/80 bg-gradient-to-b from-sentinel-bg/50 to-cyan-950/10 backdrop-blur-sm p-8 relative">
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

        {/* Details Panel */}
        {selectedAgent && (
          <Card className="w-full lg:w-96 shrink-0 border border-sentinel-border/80 bg-sentinel-bg/90 backdrop-blur-md overflow-auto shadow-2xl">
            <CardHeader className="border-b border-sentinel-border/50 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-cyan-400 flex items-center gap-2">
                    {getIconForAgent(selectedAgent.name)}
                    {selectedAgent.name}
                  </CardTitle>
                  <div className="text-[11px] text-cyan-500/70 mt-1.5 font-mono uppercase tracking-wider">{selectedAgent.role}</div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${getStatusColor(selectedAgent.state)}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">Description & Ownership</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-black/20 p-3 rounded border border-sentinel-border/50">
                  {selectedAgent.description}
                </p>
              </div>

              {selectedAgent.capabilities_json && JSON.parse(selectedAgent.capabilities_json).length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">Capabilities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {JSON.parse(selectedAgent.capabilities_json).map((cap: string, i: number) => (
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
      </div>
    </PageContainer>
  );
}
