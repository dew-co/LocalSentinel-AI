import { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Plus, MoreVertical, Trash2, Calendar, FileText, AlertCircle, PlayCircle } from 'lucide-react';

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

  // Form state for creating task
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
      case 'Critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      case 'High': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'Medium': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Task Board
          </h1>
          <p className="text-gray-400">Manage and track AI-recommended tasks and bug fixes.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 text-white w-64"
          />
        </div>
        <select 
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 text-white"
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
          className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 text-white"
        >
          <option value="All">All Statuses</option>
          {COLUMNS.map(col => <option key={col} value={col}>{col}</option>)}
        </select>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col);
          return (
            <div key={col} className="flex-1 min-w-[320px] max-w-[400px] flex flex-col bg-slate-900/30 rounded-xl border border-slate-800/50 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-200">{col}</h3>
                <span className="bg-slate-800 text-gray-400 text-xs px-2 py-1 rounded-full">{colTasks.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {colTasks.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-8 border border-dashed border-slate-700 rounded-lg">
                    No tasks here yet.
                  </div>
                ) : (
                  colTasks.map(task => (
                    <Card 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className="bg-slate-950/60 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/50 transition-colors cursor-grab"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className={`text-[10px] ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            <select 
                              className="bg-transparent text-xs text-gray-400 border-none focus:outline-none"
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                            >
                              {COLUMNS.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
                            </select>
                            <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-400">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-gray-200 mb-1 leading-tight">{task.title}</h4>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{task.description}</p>
                        
                        {task.issue_category && (
                          <div className="flex items-center gap-1.5 text-[10px] text-cyan-500/70 mb-2">
                            <AlertCircle className="w-3 h-3" />
                            <span>{task.issue_category}</span>
                            {task.sentiment_source && <span className="text-gray-600 px-1">•</span>}
                            {task.sentiment_source && <span>{task.sentiment_source}</span>}
                          </div>
                        )}
                        
                        <div className="pt-3 mt-3 border-t border-slate-800/50 flex justify-between items-center text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(task.created_at).toLocaleDateString()}</span>
                          </div>
                          {task.suggested_files?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{task.suggested_files.length}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
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
          <Card className="w-full max-w-lg bg-slate-900 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-400">Create New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                  >
                    <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={newTask.issue_category}
                    onChange={e => setNewTask({...newTask, issue_category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button onClick={createTask} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm transition-colors">Create Task</button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* View Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <Card className="w-full max-w-2xl bg-slate-900 border-cyan-500/30" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <Badge variant="outline" className={`mb-2 ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </Badge>
                <CardTitle className="text-xl text-white">{selectedTask.title}</CardTitle>
                <div className="flex gap-2 text-xs text-gray-400 mt-2">
                  <span>{selectedTask.issue_category}</span>
                  {selectedTask.sentiment_source && <><span>•</span><span>{selectedTask.sentiment_source}</span></>}
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-500 hover:text-white text-xl">&times;</button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                <p className="text-sm text-gray-200 bg-slate-950 p-4 rounded-lg border border-slate-800">{selectedTask.description || "No description provided."}</p>
              </div>
              
              {selectedTask.ai_recommendation && (
                <div>
                  <h4 className="text-sm font-medium text-cyan-500 flex items-center gap-2 mb-2">
                    <PlayCircle className="w-4 h-4" /> AI Recommendation
                  </h4>
                  <p className="text-sm text-cyan-100 bg-cyan-950/30 p-4 rounded-lg border border-cyan-900/50">
                    {selectedTask.ai_recommendation}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</h4>
                  <div className="text-sm text-white">{selectedTask.status}</div>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created At</h4>
                  <div className="text-sm text-white">{new Date(selectedTask.created_at).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
