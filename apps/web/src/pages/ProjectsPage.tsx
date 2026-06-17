import { FolderSearch, ScanSearch } from "lucide-react";
import { useEffect, useState } from "react";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectTree from "../components/projects/ProjectTree";
import { api } from "../lib/api";
import type { ProjectRecord, ProjectScan } from "../types/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [path, setPath] = useState("");
  const [scan, setScan] = useState<ProjectScan | null>(null);
  const [error, setError] = useState("");

  const refresh = () => api.projects().then(setProjects).catch(() => setProjects([]));
  useEffect(() => {
    refresh();
  }, []);

  const scanProject = async () => {
    setError("");
    try {
      const result = await api.scanProject(path);
      setScan(result);
      refresh();
      await api.indexProject({ projectId: result.projectId }).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed.");
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_460px]">
      <section>
        <div className="mb-4 flex items-center gap-3">
          <FolderSearch className="text-sentinel-cyan" />
          <h2 className="text-2xl font-semibold">Projects</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
        {projects.length === 0 && <div className="panel rounded p-6 text-sm text-slate-400">No projects registered.</div>}
      </section>
      <aside className="panel rounded p-5">
        <div className="mb-4 flex items-center gap-2">
          <ScanSearch size={20} className="text-sentinel-violet" />
          <h3 className="font-semibold">Scan Existing Project</h3>
        </div>
        <div className="flex gap-2">
          <input className="focus-ring min-w-0 flex-1 rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2 text-sm" value={path} onChange={(event) => setPath(event.target.value)} placeholder="/path/to/project" />
          <button className="focus-ring rounded bg-sentinel-cyan px-3 py-2 text-sm font-medium text-sentinel-bg" onClick={scanProject}>Scan</button>
        </div>
        {error && <p className="mt-3 rounded border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}
        {scan && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-300">{scan.summary}</p>
            <ProjectTree files={scan.fileTree} />
          </div>
        )}
      </aside>
    </div>
  );
}
