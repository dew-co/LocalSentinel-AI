import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function ProjectBrainPage() {
  const [memory, setMemory] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/memory/search?query=')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setMemory(data.results || []);
        }
      });
  }, []);

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Project Brain</h1>
        <p className="text-gray-400">Stores project-specific intelligence and memories.</p>
      </div>

      <div className="grid gap-4">
        {memory.map((item, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-lg">{item.title || 'Memory Item'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">{item.content}</p>
              <div className="mt-2 flex gap-2">
                <Badge>{item.memory_type}</Badge>
                {item.tags?.map((t: string, i: number) => (
                  <Badge key={i} variant="outline">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {memory.length === 0 && (
          <p className="text-gray-500">No memory items found.</p>
        )}
      </div>
    </PageContainer>
  );
}
