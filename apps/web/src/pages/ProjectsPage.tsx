import { FolderSearch, ScanSearch, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectTree from "../components/projects/ProjectTree";
import { api } from "../lib/api";
import type { ProjectRecord, ProjectScan } from "../types/api";
import { PageContainer } from "../components/layout/PageContainer";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [path, setPath] = useState("");
  const [scan, setScan] = useState<ProjectScan | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = () => api.projects().then(setProjects).catch(() => setProjects([]));
  useEffect(() => {
    refresh();
  }, []);

  const scanProject = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await api.scanProject(path);
      setScan(result);
      refresh();
      await api.indexProject({ projectId: result.projectId }).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBrowse = async () => {
    try {
      const result = await fetch('http://localhost:8000/api/system/dialog/folder', { method: 'POST' }).then(res => res.json());
      if (result.status === 'ok' && result.path) {
        setPath(result.path);
      }
    } catch (err) {
      console.error("Browse failed", err);
    }
  };

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Workspace Projects</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
            <FolderSearch size={14} className="text-cyan-400" /> 
            Manage local codebases and AI indexing
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <section>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
          {projects.length === 0 && (
            <div className="panel rounded-xl border border-sentinel-border/50 bg-white/5 p-12 text-center text-slate-400">
              <FolderSearch size={40} className="mx-auto mb-4 opacity-20" />
              <p>No projects registered in the Sentinel Workspace.</p>
              <p className="mt-2 text-xs">Use the scanner panel to add a local directory.</p>
            </div>
          )}
        </section>
        
        <aside className="panel rounded-xl border border-sentinel-border/50 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-xl h-fit">
          <div className="mb-6 flex items-center gap-2 border-b border-sentinel-border/30 pb-3">
            <ScanSearch size={18} className="text-cyan-400" />
            <h3 className="font-semibold text-white uppercase tracking-wider text-sm">Scanner Protocol</h3>
          </div>
          
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Local Directory Path</label>
            <div className="flex gap-2">
              <input 
                className="w-full rounded border border-sentinel-border bg-black/40 px-3 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50" 
                value={path} 
                onChange={(event) => setPath(event.target.value)} 
                placeholder="/path/to/project" 
              />
              <button 
                onClick={handleBrowse}
                className="flex items-center justify-center rounded border border-sentinel-border bg-white/5 px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                title="Browse Folders"
              >
                <FolderOpen size={16} />
              </button>
            </div>
          </div>
          
          <button 
            className="w-full rounded bg-cyan-500 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan-400 shadow-[0_0_15px_rgba(53,231,255,0.3)] disabled:opacity-50" 
            onClick={scanProject}
            disabled={loading || !path}
          >
            {loading ? "Scanning Directory..." : "Initiate Full Scan"}
          </button>
          
          {error && <p className="mt-4 rounded border border-sentinel-rose/50 bg-sentinel-rose/10 p-3 text-sm text-sentinel-rose leading-relaxed">{error}</p>}
          
          {scan && (
            <div className="mt-6 space-y-4 rounded-lg border border-cyan-500/20 bg-black/30 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Scan Complete</h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-black/20 p-3 rounded border border-sentinel-border/30">{scan.summary}</p>
              <div className="max-h-64 overflow-y-auto rounded border border-sentinel-border/30 bg-black/40 p-2 scrollbar-thin">
                <ProjectTree files={scan.fileTree} />
              </div>
            </div>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}
