type Props = {
  label: string;
};

export default function StackBadge({ label }: Props) {
  return <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">{label}</span>;
}

