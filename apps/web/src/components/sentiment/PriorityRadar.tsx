import type { SentimentResult } from "../../types/api";

const priorityValue: Record<string, number> = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 96
};

export default function PriorityRadar({ result }: { result: SentimentResult | null }) {
  const value = result ? priorityValue[result.priority] ?? 20 : 0;
  const color = result?.priority === "critical" ? "bg-sentinel-rose" : result?.priority === "high" ? "bg-sentinel-amber" : "bg-sentinel-cyan";
  const showNeedle = value > 0;

  return (
    <section className="panel rounded p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/50">Development Priority Radar</p>
      <div className="mt-6 grid place-items-center">
        <div className="relative grid h-56 w-56 place-items-center rounded-full border border-cyan-300/30">
          <div className="absolute inset-8 rounded-full border border-violet-300/25" />
          <div className="absolute inset-16 rounded-full border border-cyan-300/20" />
          {showNeedle && (
            <div
              className={`absolute left-1/2 top-1/2 h-1.5 rounded-full opacity-80 ${color}`}
              style={{ width: "42%", transform: `rotate(${value * 2.7}deg)`, transformOrigin: "left center" }}
            />
          )}
          <div className="absolute z-10 rounded bg-sentinel-bg/70 px-4 py-2 text-center backdrop-blur">
            <p className="text-3xl font-semibold">{result?.priority ?? "idle"}</p>
            <p className="text-sm text-slate-400">{result ? `urgency ${result.urgency}` : "awaiting signal"}</p>
          </div>
        </div>
      </div>
      {result && <p className="mt-5 text-sm text-slate-300">{result.recommendedAction}</p>}
    </section>
  );
}
