import { motion } from "framer-motion";
import SentinelStatus from "./SentinelStatus";

export type SentinelCoreStatus = "Listening" | "Thinking" | "Speaking" | "Planning" | "Ready" | "Executing" | "Needs Approval";

type Props = {
  status?: SentinelCoreStatus;
  voiceActive?: boolean;
  responding?: boolean;
  modelOnline?: boolean;
  activeModel?: string | null;
  memoryOnline?: boolean;
  safeMode?: boolean;
};

export default function SentinelCore({
  status = "Ready",
  voiceActive = false,
  responding = false,
  modelOnline = false,
  activeModel,
  memoryOnline = true,
  safeMode = true
}: Props) {
  const pulse = responding || status === "Thinking" || status === "Speaking" || status === "Executing";
  const signal = modelOnline ? "Online" : "Offline";

  return (
    <section className="panel relative grid min-h-[320px] overflow-hidden rounded p-4 sm:min-h-[386px] sm:p-6" aria-label={`Sentinel Core status ${status}`}>
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-300/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-violet-300/10" />
      </div>
      <div className="relative flex flex-col items-center justify-center">
        <div className="absolute left-0 top-0 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
          <span className={`rounded border px-2 py-1 ${modelOnline ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-rose-300/30 bg-rose-300/10 text-rose-100"}`}>
            Model {signal}
          </span>
          <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-cyan-100">
            {safeMode ? "Safe Mode" : "Unsafe"}
          </span>
        </div>
        <div className="relative grid h-56 w-56 place-items-center sm:h-72 sm:w-72">
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border"
              style={{
                inset: `${ring * 26}px`,
                borderColor: ring === 1 ? "rgba(155, 92, 255, 0.55)" : "rgba(53, 231, 255, 0.5)"
              }}
              animate={{ rotate: ring % 2 ? -360 : 360, scale: pulse ? [1, 1.04, 1] : 1 }}
              transition={{ rotate: { repeat: Infinity, duration: 16 + ring * 6, ease: "linear" }, scale: { repeat: Infinity, duration: 1.8 } }}
            />
          ))}
          {voiceActive && (
            <motion.div
              className="absolute inset-6 rounded-full border-2 border-sentinel-green/70"
              animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.4, 0.95, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
          )}
          <motion.div
            className="absolute h-24 w-24 rounded-full bg-cyan-300/20 blur-xl sm:h-28 sm:w-28"
            animate={{ scale: pulse ? [1, 1.35, 1] : [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: pulse ? 1.1 : 2.8 }}
          />
          <motion.div
            className="relative grid h-20 w-20 place-items-center rounded-full border border-cyan-200/80 bg-cyan-300/20 shadow-core sm:h-24 sm:w-24"
            animate={{ boxShadow: pulse ? "0 0 70px rgba(53,231,255,0.55)" : "0 0 38px rgba(53,231,255,0.28)" }}
            transition={{ duration: 0.35 }}
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sentinel-cyan via-sentinel-blue to-sentinel-violet sm:h-11 sm:w-11" />
          </motion.div>
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-cyan-200/80"
              style={{
                left: `${50 + Math.cos((i / 14) * Math.PI * 2) * 43}%`,
                top: `${50 + Math.sin((i / 14) * Math.PI * 2) * 43}%`,
                transform: "translate(-50%, -50%)"
              }}
              animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.4, 0.8] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.08 }}
            />
          ))}
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">Sentinel Core</p>
          <SentinelStatus status={status} />
          <p className="mx-auto mt-2 max-w-56 truncate text-xs text-slate-400 sm:max-w-64">
            {activeModel ? activeModel : "No active model selected"} · Memory {memoryOnline ? "ready" : "idle"}
          </p>
        </div>
      </div>
    </section>
  );
}
