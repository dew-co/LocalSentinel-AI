import { ShieldCheck } from "lucide-react";
import type { AgentPlan } from "../../types/api";

type Props = {
  plan: AgentPlan | null;
};

export default function AgentPlanCard({ plan }: Props) {
  if (!plan) {
    return <section className="panel rounded p-5 text-sm text-slate-400">No task plan generated.</section>;
  }

  return (
    <section className="panel rounded p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck size={20} className="text-sentinel-cyan" />
        <h3 className="text-lg font-semibold">Task Plan</h3>
      </div>
      <p className="mb-3 text-sm text-slate-300">{plan.goal}</p>
      <span className="rounded border border-sentinel-border bg-white/5 px-2 py-1 text-xs uppercase tracking-[0.16em] text-cyan-100">Risk {plan.riskLevel}</span>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Steps</p>
          <ol className="space-y-2 text-sm text-slate-300">
            {plan.steps.map((step, index) => (
              <li key={step}>{index + 1}. {step}</li>
            ))}
          </ol>
        </div>
        <div className="space-y-3 text-sm text-slate-300">
          <List title="Read" items={plan.filesToRead} />
          <List title="Create" items={plan.filesToCreate} />
          <List title="Modify" items={plan.filesToModify} />
          <List title="Commands" items={plan.commandsNeeded} />
        </div>
      </div>
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/50">{title}</p>
      {items.length ? items.map((item) => <p key={item} className="font-mono text-xs">{item}</p>) : <p className="text-xs text-slate-500">None</p>}
    </div>
  );
}

