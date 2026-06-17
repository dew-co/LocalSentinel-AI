type Props = {
  command: string;
  safe?: boolean;
  reason?: string;
};

export default function SafeCommandPreview({ command, safe, reason }: Props) {
  return (
    <div className="rounded border border-sentinel-border bg-sentinel-bg/70 p-3">
      <code className="block text-sm text-cyan-100">{command}</code>
      <p className={safe ? "mt-1 text-xs text-sentinel-green" : "mt-1 text-xs text-sentinel-amber"}>{reason ?? "Pending safety check"}</p>
    </div>
  );
}

