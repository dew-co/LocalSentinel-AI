import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

type Memory = { id: string; projectId: string; content: string; tags: string[]; createdAt: string };

export default function MemoryPanel({ projectId }: { projectId?: string }) {
  const [items, setItems] = useState<Memory[]>([]);
  const [content, setContent] = useState("");

  const refresh = () => api.listMemory(projectId).then(setItems).catch(() => setItems([]));
  useEffect(() => {
    refresh();
  }, [projectId]);

  const add = async () => {
    if (!projectId || !content.trim()) return;
    await api.addMemory(projectId, content, ["manual"]);
    setContent("");
    refresh();
  };

  return (
    <section className="panel rounded p-4">
      <h3 className="mb-3 font-semibold">Project Memory</h3>
      <div className="mb-3 flex gap-2">
        <input className="focus-ring flex-1 rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2 text-sm" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Add memory..." />
        <button className="focus-ring grid h-10 w-10 place-items-center rounded bg-sentinel-cyan text-sentinel-bg" onClick={add} disabled={!projectId}>
          <Plus size={17} />
        </button>
      </div>
      <div className="scrollbar-thin max-h-72 space-y-2 overflow-y-auto">
        {items.length === 0 ? <p className="text-sm text-slate-500">No memory entries.</p> : items.map((item) => <p key={item.id} className="rounded border border-sentinel-border bg-white/5 p-3 text-sm text-slate-300">{item.content}</p>)}
      </div>
    </section>
  );
}
