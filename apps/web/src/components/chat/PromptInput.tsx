import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

type Props = {
  disabled?: boolean;
  onSend: (message: string) => void;
};

export default function PromptInput({ disabled, onSend }: Props) {
  const [message, setMessage] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = message.trim();
    if (!value || disabled) return;
    onSend(value);
    setMessage("");
  };

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <textarea
        className="focus-ring scrollbar-thin min-h-12 max-h-32 flex-1 resize-none overflow-y-auto rounded border border-sentinel-border bg-sentinel-bg/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
        placeholder="Ask Sentinel Core..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={disabled}
      />
      <button className="focus-ring grid h-12 w-12 shrink-0 place-items-center rounded bg-sentinel-cyan text-sentinel-bg disabled:opacity-50" type="submit" disabled={disabled}>
        <Send size={18} />
      </button>
    </form>
  );
}
