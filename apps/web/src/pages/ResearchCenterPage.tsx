import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function ResearchCenterPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    fetch('http://localhost:8000/api/research/history')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setHistory(data.history);
      });
  };

  const handleResearch = () => {
    if (!query) return;
    setLoading(true);
    fetch('http://localhost:8000/api/research/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode: 'offline' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setResult(data.result);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleSave = () => {
    if (!result) return;
    fetch('http://localhost:8000/api/research/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: result.topic,
        summary: result.summary,
        sources: result.sources || [],
        recommendation: result.recommendation,
        assumptions: result.assumptions
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          fetchHistory();
          setResult(null);
          setQuery('');
        }
      });
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Research Center</h1>
        <p className="text-gray-400">Ask SentinelCore to research external documentation and best practices.</p>
      </div>

      <div className="mb-8 flex gap-4">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Research the best local coding model..."
          className="flex-1 bg-black/40 border border-white/10 rounded-md px-4 text-sm focus:outline-none focus:border-white/30"
          onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
        />
        <Button onClick={handleResearch} disabled={loading || !query}>
          {loading ? 'Researching...' : 'Research'}
        </Button>
      </div>

      {result && (
        <Card className="mb-8 border-purple-500/30">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>{result.topic}</CardTitle>
            <Button size="sm" onClick={handleSave}>Save Note</Button>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-300">{result.summary}</p>
            <div className="text-sm">
              <strong>Recommendation:</strong> {result.recommendation}
            </div>
            {result.assumptions && (
              <div className="text-sm mt-2 text-gray-500">
                <em>Assumptions: {result.assumptions}</em>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Saved Research Notes</h2>
        <div className="grid gap-4">
          {history.map((note, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">{note.topic}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300">{note.summary}</p>
              </CardContent>
            </Card>
          ))}
          {history.length === 0 && (
            <p className="text-gray-500">No saved research notes.</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
