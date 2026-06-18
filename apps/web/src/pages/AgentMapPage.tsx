import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function AgentMapPage() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/agents/map')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setAgents(data.agents);
      });
  }, []);

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Agent Map</h1>
        <p className="text-gray-400">Internal specialized agent structure of LocalSentinel AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, idx) => (
          <Card key={idx} className="border-cyan-500/20 bg-cyan-950/10">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg text-cyan-400">{agent.name}</CardTitle>
                <div className="text-xs text-gray-500 mt-1">{agent.role}</div>
              </div>
              <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                {agent.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300 mb-4">{agent.description}</p>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities_json && JSON.parse(agent.capabilities_json).map((cap: string, i: number) => (
                  <Badge key={i} variant="outline" className="border-cyan-500/30 text-xs">
                    {cap}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
