import { Play, ScanLine } from "lucide-react";
import { useState } from "react";
import { api } from "../../lib/api";
import SafeCommandPreview from "./SafeCommandPreview";

type Props = {
  projectPath?: string;
  commands: string[];
};

export default function ApprovalPanel({ projectPath, commands }: Props) {
  const [approved, setApproved] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [result, setResult] = useState("");

  const payload = {
    projectPath,
    fileOperations: [],
    commands: commands.map((command) => ({ command, cwd: projectPath }))
  };

  const runPreview = async () => setPreview(await api.preview(payload));
  const execute = async () => setResult(JSON.stringify(await api.execute({ ...payload, approved }), null, 2));

  return (
    <section className="panel rounded p-5">
      <h3 className="mb-3 font-semibold">Safe Action Approval</h3>
      <div className="mb-3 flex flex-wrap gap-2">
        <button className="focus-ring inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-sm hover:bg-white/15" onClick={runPreview}>
          <ScanLine size={16} />
          Preview
        </button>
        <label className="flex items-center gap-2 rounded border border-sentinel-border bg-white/5 px-3 py-2 text-sm">
          <input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} />
          Approved
        </label>
        <button className="focus-ring inline-flex items-center gap-2 rounded bg-sentinel-cyan px-3 py-2 text-sm font-medium text-sentinel-bg" onClick={execute} disabled={!approved}>
          <Play size={16} />
          Execute
        </button>
      </div>
      <div className="space-y-2">
        {(preview?.commands ?? commands.map((command) => ({ command }))).map((item: any) => (
          <SafeCommandPreview key={item.command} command={item.command} safe={item.safe} reason={item.reason} />
        ))}
      </div>
      {preview?.warnings?.length > 0 && <p className="mt-3 rounded border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">{preview.warnings.join(" ")}</p>}
      {result && <pre className="mt-3 max-h-72 overflow-auto rounded border border-sentinel-border bg-sentinel-bg/70 p-3 text-xs text-slate-300">{result}</pre>}
    </section>
  );
}

