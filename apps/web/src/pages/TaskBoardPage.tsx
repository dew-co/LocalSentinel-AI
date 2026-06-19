import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Plus, MoreVertical, Trash2, Calendar, FileText, AlertCircle, PlayCircle, FolderKanban } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  issue_category: string;
  sentiment_source: string;
  project_id: string;
  suggested_files: string[];
  status: string;
  ai_recommendation: string;
  created_at: string;
};

const COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Completed'];

export function TaskBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'Medium', issue_category: 'Feature', status: 'To Do'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/tasks/');
      const data = await res.json();
      if (data.status === 'ok') {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const createTask = async () => {
    if (!newTask.title) return;
    try {
      const res = await fetch('http://localhost:8000/api/tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewTask({ title: '', description: '', priority: 'Medium', issue_category: 'Feature', status: 'To Do' });
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'border-sentinel-rose/50 bg-sentinel-rose/10 text-sentinel-rose';
      case 'High': return 'border-sentinel-amber/50 bg-sentinel-amber/10 text-sentinel-amber';
      case 'Medium': return 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400';
      case 'Low': return 'border-sentinel-green/50 bg-sentinel-green/10 text-sentinel-green';
      default: return 'border-slate-500/50 bg-slate-500/10 text-slate-400';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Task Board</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
            <FolderKanban size={14} className="text-cyan-400" /> 
            Actionable project workflows
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-medium px-4 py-2 transition-colors shadow-[0_0_15px_rgba(53,231,255,0.4)]"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-black/40 border border-sentinel-border rounded outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-sm text-white w-64 transition-all"
          />
        </div>
        <select 
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="appearance-none px-4 py-2 bg-black/40 border border-sentinel-border rounded text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
        >
          <option value="All">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="appearance-none px-4 py-2 bg-black/40 border border-sentinel-border rounded text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
        >
          <option value="All">All Statuses</option>
          {COLUMNS.map(col => <option key={col} value={col}>{col}</option>)}
        </select>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col);
          return (
            <div key={col} className="flex-1 min-w-[320px] max-w-[400px] flex flex-col panel rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-200 text-sm uppercase tracking-wider">{col}</h3>
                <span className="bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {colTasks.length === 0 ? (
                  <div className="text-center text-sm text-slate-600 py-10 border border-dashed border-sentinel-border/50 rounded-lg">
                    No tasks here
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className="group flex flex-col rounded bg-gradient-to-br from-white/5 to-transparent border border-sentinel-border hover:border-cyan-500/40 transition-colors cursor-grab p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`inline-flex rounded px-2 py-0.5 text-[10px] uppercase font-semibold border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <div className="flex gap-1 items-center" onClick={e => e.stopPropagation()}>
                          <select 
                            className="bg-transparent text-[10px] text-slate-400 uppercase tracking-wider font-semibold border-none focus:outline-none appearance-none cursor-pointer"
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          >
                            {COLUMNS.map(c => <option key={c} value={c} className="bg-slate-900 text-white normal-case">{c}</option>)}
                          </select>
                          <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-sentinel-rose transition-colors ml-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-white text-sm mb-1 leading-tight group-hover:text-cyan-300 transition-colors">{task.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                      
                      {task.issue_category && (
                        <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 mb-3">
                          <AlertCircle className="w-3 h-3" />
                          <span>{task.issue_category}</span>
                          {task.sentiment_source && <span className="text-slate-600 px-1">•</span>}
                          {task.sentiment_source && <span className="text-slate-400">{task.sentiment_source}</span>}
                        </div>
                      )}
                      
                      <div className="pt-3 border-t border-sentinel-border/50 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                        {task.suggested_files?.length > 0 && (
                          <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded border border-white/5">
                            <FileText className="w-3 h-3 text-indigo-400" />
                            <span>{task.suggested_files.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl border border-cyan-500/30 bg-slate-950 p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-cyan-400">Create New Task</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Title</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full rounded border border-sentinel-border bg-black/40 p-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="Task title..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                <textarea 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="h-24 w-full rounded border border-sentinel-border bg-black/40 p-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="Details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full rounded border border-sentinel-border bg-black/40 p-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  >
                    <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Category</label>
                  <input 
                    type="text" 
                    value={newTask.issue_category}
                    onChange={e => setNewTask({...newTask, issue_category: e.target.value})}
                    className="w-full rounded border border-sentinel-border bg-black/40 p-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-sentinel-border/50 pt-4">
              <button onClick={() => setIsCreateModalOpen(false)} className="rounded px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white">Cancel</button>
              <button onClick={createTask} className="rounded bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-cyan-400">Create Task</button>
            </div>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div className="w-full max-w-2xl rounded-xl border border-cyan-500/30 bg-slate-950 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex flex-row items-start justify-between border-b border-sentinel-border/50 p-6 pb-4">
              <div>
                <span className={`mb-3 inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
                <h2 className="text-xl font-bold text-white">{selectedTask.title}</h2>
                <div className="mt-2 flex gap-2 text-xs text-slate-400">
                  <span>{selectedTask.issue_category}</span>
                  {selectedTask.sentiment_source && <><span className="text-slate-600">•</span><span>{selectedTask.sentiment_source}</span></>}
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-500 transition-colors hover:text-white">&times;</button>
            </div>
            <div className="space-y-6 p-6 pt-4">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Description</h4>
                <p className="rounded border border-sentinel-border/50 bg-black/30 p-4 text-sm leading-relaxed text-slate-300">
                  {selectedTask.description || "No description provided."}
                </p>
              </div>
              
              {selectedTask.ai_recommendation && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    <PlayCircle className="h-4 w-4" /> AI Recommendation
                  </h4>
                  <p className="rounded border border-cyan-500/20 bg-cyan-950/20 p-4 text-sm leading-relaxed text-cyan-200">
                    {selectedTask.ai_recommendation}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-sentinel-border/50 pt-4">
                <div className="rounded border border-sentinel-border/30 bg-white/5 p-3">
                  <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</h4>
                  <div className="text-sm font-medium text-white">{selectedTask.status}</div>
                </div>
                <div className="rounded border border-sentinel-border/30 bg-white/5 p-3">
                  <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Created At</h4>
                  <div className="text-sm font-medium text-white">{new Date(selectedTask.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
