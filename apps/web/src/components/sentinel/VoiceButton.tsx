import { Mic, MicOff } from "lucide-react";
import { useRef, useState } from "react";
import { voiceService, type VoiceRuntimeStatus } from "../../lib/voiceService";

type Props = {
  onTranscript: (text: string) => void;
  onStatus?: (status: VoiceRuntimeStatus) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export default function VoiceButton({ onTranscript, onStatus, onError, disabled = false }: Props) {
  const [listening, setListening] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const hasTranscriptRef = useRef(false);
  const supported = voiceService.isRecognitionSupported();

  const start = () => {
    if (!supported || disabled || listening) return;
    hasTranscriptRef.current = false;
    setListening(true);
    const controller = voiceService.startListening({
      onResult: (text) => {
        hasTranscriptRef.current = true;
        onTranscript(text);
      },
      onStatus: (status) => {
        if (status !== "Ready" || !hasTranscriptRef.current) onStatus?.(status);
        if (status !== "Listening") setListening(false);
      },
      onError: (message) => {
        onError?.(message);
        setListening(false);
      }
    });
    stopRef.current = controller.stop;
  };

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setListening(false);
    onStatus?.("Ready");
  };

  const toggleListening = () => {
    if (listening) {
      stop();
      return;
    }
    start();
  };

  if (!supported) {
    return (
      <span className="rounded border border-sentinel-border bg-white/5 px-3 py-2 text-xs text-slate-300">
        Voice recognition is not supported in this browser. Text chat is still available.
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`focus-ring inline-flex items-center gap-2 rounded px-3 py-2 text-sm transition ${
        listening ? "bg-sentinel-green text-sentinel-bg" : "border border-sentinel-border bg-white/5 text-cyan-100 hover:bg-white/10"
      }`}
      disabled={disabled}
      title={listening ? "Click to stop listening" : "Click to start talking with Sentinel Core"}
    >
      {listening ? <MicOff size={16} /> : <Mic size={16} />}
      {listening ? "Stop" : "Talk"}
    </button>
  );
}
