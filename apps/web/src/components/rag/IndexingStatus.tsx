import { DatabaseZap } from "lucide-react";

type Props = {
  totalChunks?: number;
  projects?: { projectId: string; root: string; chunks: number }[];
};

export default function IndexingStatus({ totalChunks = 0, projects = [] }: Props) {
  return (
    <section className="panel rounded p-4">
      <div className="mb-3 flex items-center gap-2">
        <DatabaseZap size={18} className="text-sentinel-cyan" />
        <h3 className="font-semibold">Indexing Status</h3>
      </div>
      <p className="text-sm text-slate-300">{totalChunks} chunks indexed</p>
      <div className="mt-3 space-y-2 text-xs text-slate-400">
        {projects.map((project) => (
          <p key={project.projectId} className="truncate">
            {project.projectId}: {project.chunks} chunks
          </p>
        ))}
      </div>
    </section>
  );
}

