type Props = {
  role: "user" | "assistant";
  content: string;
};

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[94%] overflow-hidden rounded p-3 text-sm leading-6 sm:max-w-[86%] ${
          isUser ? "bg-sentinel-blue/30 text-blue-50" : "border border-sentinel-border bg-white/5 text-slate-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{content}</p>
      </div>
    </div>
  );
}
