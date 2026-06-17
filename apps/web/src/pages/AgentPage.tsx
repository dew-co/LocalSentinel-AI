import { FormEvent, useState } from "react";
import AgentPlanCard from "../components/agent/AgentPlanCard";
import ApprovalPanel from "../components/agent/ApprovalPanel";
import SentinelCore from "../components/sentinel/SentinelCore";
import { api } from "../lib/api";
import type { AgentPlan } from "../types/api";

export default function AgentPage() {
  const [goal, setGoal] = useState("Add login page with Firebase authentication.");
  const [projectId, setProjectId] = useState("");
  const [projectPath, setProjectPath] = useState("");
  const [plan, setPlan] = useState<AgentPlan | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPlan(await api.plan(goal, projectId || undefined));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-4">
        <SentinelCore status={plan ? "Needs Approval" : "Planning"} />
        <form onSubmit={submit} className="panel space-y-3 rounded p-4">
          <h2 className="text-xl font-semibold">Agent Mode</h2>
          <textarea className="focus-ring min-h-28 w-full rounded border border-sentinel-border bg-sentinel-bg/70 p-3 text-sm" value={goal} onChange={(event) => setGoal(event.target.value)} />
          <input className="focus-ring w-full rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2 text-sm" value={projectId} onChange={(event) => setProjectId(event.target.value)} placeholder="Project ID" />
          <input className="focus-ring w-full rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2 text-sm" value={projectPath} onChange={(event) => setProjectPath(event.target.value)} placeholder="Project path for command cwd" />
          <button className="focus-ring rounded bg-sentinel-cyan px-4 py-2 font-medium text-sentinel-bg">Generate Plan</button>
        </form>
      </div>
      <div className="space-y-4">
        <AgentPlanCard plan={plan} />
        <ApprovalPanel projectPath={projectPath || undefined} commands={plan?.commandsNeeded ?? []} />
      </div>
    </div>
  );
}

