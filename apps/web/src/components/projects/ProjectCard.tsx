import { FolderCode } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProjectRecord } from "../../types/api";
import StackBadge from "./StackBadge";

type Props = {
  project: ProjectRecord;
};

export default function ProjectCard({ project }: Props) {
  return (
    <Link to={`/project/${project.id}`} className="panel block rounded p-4 transition hover:border-cyan-300/45 hover:bg-white/[0.06]">
      <div className="mb-3 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-violet-400/12 text-sentinel-violet">
          <FolderCode size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{project.name}</h3>
          <p className="truncate text-xs text-slate-400">{project.path}</p>
        </div>
      </div>
      <p className="line-clamp-2 min-h-10 text-sm text-slate-300">{project.summary || project.idea || "Project metadata available."}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.slice(0, 5).map((item) => (
          <StackBadge key={item} label={item} />
        ))}
      </div>
    </Link>
  );
}

