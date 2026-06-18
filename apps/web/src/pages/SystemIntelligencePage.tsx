import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function SystemIntelligencePage() {
  const [tools, setTools] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  const fetchStatus = () => {
    fetch('http://localhost:8000/api/system/status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setTools(data.tools);
      });
    fetch('http://localhost:8000/api/system/readiness')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setReadiness(data.readiness);
      });
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

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Intelligence</h1>
          <p className="text-gray-400">Stores local system environment knowledge.</p>
        </div>
        <Button onClick={handleScan} disabled={scanning}>
          {scanning ? 'Scanning...' : 'Scan System'}
        </Button>
      </div>

      {readiness && (
        <Card className="mb-6 border-blue-500/30 bg-blue-500/10">
          <CardHeader>
            <CardTitle>System Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold mb-2">Score: {readiness.score}%</p>
            <Badge className="mb-4">{readiness.readiness}</Badge>
            {readiness.recommendations?.length > 0 && (
              <ul className="list-disc list-inside text-gray-300">
                {readiness.recommendations.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-lg">{tool.tool_name}</CardTitle>
              <Badge variant={tool.detected ? 'default' : 'destructive'}>
                {tool.detected ? 'Installed' : 'Missing'}
              </Badge>
            </CardHeader>
            <CardContent>
              {tool.detected && (
                <>
                  <p className="text-sm text-gray-400">Version: {tool.version}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate" title={tool.path}>{tool.path}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
