type Props = {
  status: "Listening" | "Thinking" | "Speaking" | "Planning" | "Ready" | "Executing" | "Needs Approval";
};

const color: Record<Props["status"], string> = {
  Listening: "text-sentinel-green",
  Thinking: "text-sentinel-cyan",
  Speaking: "text-sentinel-green",
  Planning: "text-sentinel-violet",
  Ready: "text-slate-200",
  Executing: "text-sentinel-amber",
  "Needs Approval": "text-sentinel-rose"
};

export default function SentinelStatus({ status }: Props) {
  return <span className={`text-sm font-medium ${color[status]}`}>{status}</span>;
}
