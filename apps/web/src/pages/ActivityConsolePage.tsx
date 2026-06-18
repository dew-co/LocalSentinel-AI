import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function ActivityConsolePage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    fetch('http://localhost:8000/api/activity')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setLogs(data.logs);
      });
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all activity logs?')) {
      fetch('http://localhost:8000/api/activity/clear', { method: 'DELETE' })
        .then(() => fetchLogs());
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Activity Console</h1>
          <p className="text-gray-400">Transparent activity log system.</p>
        </div>
        <Button variant="outline" onClick={handleClear}>Clear Activity</Button>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        {logs.map((log, idx) => (
          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <div className={`w-3 h-3 rounded-full ${log.severity === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
            </div>
            
            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:bg-white/5 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-white">{log.title}</div>
                  <time className="text-xs font-medium text-indigo-400">{formatTime(log.created_at)}</time>
                </div>
                <div className="text-sm text-gray-400 mb-2">{log.description}</div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">{log.activity_type}</Badge>
                  {log.severity !== 'info' && (
                    <Badge variant={log.severity === 'error' ? 'destructive' : 'default'} className="text-xs">{log.severity}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-gray-500 text-center py-8">No recent activity.</p>
        )}
      </div>
    </PageContainer>
  );
}
