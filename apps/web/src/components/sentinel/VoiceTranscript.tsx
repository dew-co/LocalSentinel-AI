import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { VoiceRuntimeStatus, VoiceTranscriptEntry } from "../../lib/voiceService";

type Props = {
  entries: VoiceTranscriptEntry[];
  status: VoiceRuntimeStatus;
};

export default function VoiceTranscript({ entries, status }: Props) {
  const [open, setOpen] = useState(false);
  const latest = entries.length > 0 ? entries[entries.length - 1] : undefined;

  return (
    <div className="rounded border border-sentinel-border bg-white/5 text-sm text-slate-300">
      <button className="focus-ring flex w-full items-center justify-between gap-3 px-3 py-2 text-left" type="button" onClick={() => setOpen((value) => !value)}>
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-[0.18em] text-cyan-200/50">Voice Transcript</span>
          {!open && (
            <span className="mt-1 block max-w-full truncate text-xs text-slate-500">
              {latest ? `${latest.role === "user" ? "You" : latest.role === "assistant" ? "Sentinel" : "System"}: ${latest.text}` : "Hidden until needed"}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-100">{status}</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {open && (
        <div className="scrollbar-thin max-h-32 space-y-2 overflow-y-auto border-t border-sentinel-border/70 px-3 py-2">
          {entries.length === 0 ? (
            <p className="min-h-6">No voice input captured.</p>
          ) : (
            entries.map((entry) => (
              <p key={entry.id} className="leading-5">
                <span className={entry.role === "user" ? "text-sentinel-green" : entry.role === "assistant" ? "text-sentinel-cyan" : "text-sentinel-amber"}>
                  {entry.role === "user" ? "You" : entry.role === "assistant" ? "Sentinel" : "System"}:
                </span>{" "}
                {entry.text}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}
