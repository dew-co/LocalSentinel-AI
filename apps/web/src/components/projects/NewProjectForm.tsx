import { Check, FolderPlus, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { api } from "../../lib/api";
import ProjectTree from "./ProjectTree";

const appTypes = ["fullstack", "react", "react-firebase", "fastapi", "static"];

export default function NewProjectForm() {
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [idea, setIdea] = useState("");
  const [preferredStack, setPreferredStack] = useState("React + FastAPI");
  const [appType, setAppType] = useState("fullstack");
  const [allowOverwrite, setAllowOverwrite] = useState(false);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ fileTree: string[]; message: string } | null>(null);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!approved) {
      setError("Approve the scaffold preview before creating files.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.createProject({ name, path, idea, preferredStack, appType, allowOverwrite });
      setResult(response);
      await api.indexProject({ projectId: response.project.id }).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Project creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <form onSubmit={submit} className="panel space-y-4 rounded p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/50">New Project</p>
          <h2 className="text-2xl font-semibold">Create Local Starter</h2>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-300">Project name</span>
          <input className="focus-ring w-full rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-300">Parent path</span>
          <input className="focus-ring w-full rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2" value={path} onChange={(event) => setPath(event.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-300">Project idea</span>
          <textarea className="focus-ring min-h-28 w-full rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2" value={idea} onChange={(event) => setIdea(event.target.value)} required />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">Preferred stack</span>
            <input className="focus-ring w-full rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2" value={preferredStack} onChange={(event) => setPreferredStack(event.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">App type</span>
            <select className="focus-ring w-full rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2" value={appType} onChange={(event) => setAppType(event.target.value)}>
              {appTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 rounded border border-sentinel-border bg-white/5 p-4 text-sm md:grid-cols-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} />
            Approve controlled file creation
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={allowOverwrite} onChange={(event) => setAllowOverwrite(event.target.checked)} />
            Allow overwrite
          </label>
        </div>
        {error && <p className="rounded border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}
        <button className="focus-ring inline-flex items-center gap-2 rounded bg-sentinel-cyan px-4 py-2 font-medium text-sentinel-bg disabled:opacity-60" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <FolderPlus size={18} />}
          Create Project
        </button>
      </form>
      <aside className="panel rounded p-5">
        <div className="mb-4 flex items-center gap-2">
          <Check size={18} className="text-sentinel-green" />
          <h3 className="font-semibold">Scaffold Preview</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <p>Name: {name || "Untitled"}</p>
          <p>Target: {path && name ? `${path.replace(/\/$/, "")}/${name}` : "Pending"}</p>
          <p>Stack: {preferredStack || "Auto"}</p>
          <p>Type: {appType}</p>
        </div>
        <div className="mt-5">
          <ProjectTree files={result?.fileTree ?? ["README.md", ".localsentinel/project.json", ".localsentinel/memory.md", "docs/roadmap.md", "docs/architecture.md"]} />
        </div>
        {result && <p className="mt-3 rounded border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-100">{result.message}</p>}
      </aside>
    </section>
  );
}

