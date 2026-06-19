import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Cpu, Activity, Clock, Shield, Database, Layout, Code, Server, TestTube, FileText, Search, Brain, Zap, Key } from 'lucide-react';

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
  const childAgents = agents.filter(a => a.name !== 'Sentinel Lead Agent');

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
          isRoot ? 'w-72 z-10' : 'w-64 z-10'
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
              <span className="text-xs text-gray-400 uppercase tracking-wider">{agent.state}</span>
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(agent.state)}`} />
            </div>
          </div>
          
          <h3 className={`font-semibold mb-1 ${isSelected ? 'text-cyan-300' : 'text-gray-200'}`}>
            {agent.name}
          </h3>
          <p className="text-xs text-gray-400 font-mono mb-2">{agent.role}</p>
        </div>
      </div>
    );
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Agent Map
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Agent Map shows LocalSentinel AI's internal specialized modules. Some roles are active modules today; others are future-ready autonomous agents.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Tree Visualization Area */}
        <div className="flex-1 overflow-auto rounded-xl border border-cyan-500/20 bg-slate-950/50 backdrop-blur-sm p-8 relative">
          <div className="min-w-[800px] flex flex-col items-center">
            
            {/* Root */}
            <div className="mb-8 relative flex flex-col items-center">
              <AgentNode agent={rootAgent} isRoot={true} />
              <div className="w-px h-8 bg-gradient-to-b from-cyan-500/50 to-cyan-500/20 absolute -bottom-8" />
            </div>

            {/* Horizontal Connector */}
            <div className="w-[80%] h-px bg-cyan-500/20 relative flex justify-center mb-8">
              <div className="w-px h-8 bg-cyan-500/20 absolute -top-8" />
            </div>

            {/* Children Grid */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 w-full px-4">
              {childAgents.map((agent, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  <div className="w-px h-6 bg-cyan-500/20 absolute -top-6" />
                  <AgentNode agent={agent} />
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Details Panel */}
        {selectedAgent && (
          <Card className="w-full lg:w-96 shrink-0 border-cyan-500/30 bg-slate-900/80 backdrop-blur-md overflow-auto">
            <CardHeader className="border-b border-cyan-500/20 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-cyan-400 flex items-center gap-2">
                    {getIconForAgent(selectedAgent.name)}
                    {selectedAgent.name}
                  </CardTitle>
                  <div className="text-sm text-cyan-500/70 mt-1 font-mono">{selectedAgent.role}</div>
                </div>
                <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor(selectedAgent.state)}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Description & Task Ownership</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedAgent.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.capabilities_json && JSON.parse(selectedAgent.capabilities_json).map((cap: string, i: number) => (
                    <Badge key={i} variant="outline" className="bg-cyan-950/30 border-cyan-500/30 text-cyan-200">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">State</h4>
                  <div className="text-sm font-medium text-gray-200 capitalize">
                    {selectedAgent.state}
                  </div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Related Service</h4>
                  <div className="text-sm font-medium text-gray-200">
                    {selectedAgent.related_service || 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Recent Activity
                </h4>
                <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-gray-300 text-xs">Last used / initialized</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">
                          {selectedAgent.last_used_at ? new Date(selectedAgent.last_used_at).toLocaleString() : 'Never'}
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
