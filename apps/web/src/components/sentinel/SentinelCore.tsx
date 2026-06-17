import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
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

/* ── Status-based color themes ── */
const statusThemes: Record<SentinelCoreStatus, { primary: string; glow: string; rgb: string }> = {
  Ready: { primary: "rgba(53, 231, 255, 0.5)", glow: "rgba(53, 231, 255, 0.3)", rgb: "53, 231, 255" },
  Listening: { primary: "rgba(67, 240, 164, 0.6)", glow: "rgba(67, 240, 164, 0.35)", rgb: "67, 240, 164" },
  Thinking: { primary: "rgba(77, 141, 255, 0.6)", glow: "rgba(77, 141, 255, 0.35)", rgb: "77, 141, 255" },
  Speaking: { primary: "rgba(67, 240, 164, 0.7)", glow: "rgba(67, 240, 164, 0.4)", rgb: "67, 240, 164" },
  Planning: { primary: "rgba(155, 92, 255, 0.6)", glow: "rgba(155, 92, 255, 0.35)", rgb: "155, 92, 255" },
  Executing: { primary: "rgba(248, 193, 79, 0.6)", glow: "rgba(248, 193, 79, 0.35)", rgb: "248, 193, 79" },
  "Needs Approval": { primary: "rgba(255, 71, 126, 0.6)", glow: "rgba(255, 71, 126, 0.35)", rgb: "255, 71, 126" },
};

/* ── Frequency Visualizer — always visible, alive when speaking ── */
function FrequencyVisualizer({ active, status }: { active: boolean; status: SentinelCoreStatus }) {
  const barCount = 48;
  const theme = statusThemes[status];

  /* Pre-compute per-bar random seeds so idle pattern is stable */
  const barSeeds = useMemo(() => Array.from({ length: barCount }, (_, i) => ({
    id: i,
    idleHeight: 2 + Math.sin(i * 0.45) * 3 + Math.random() * 3,
    idleSpeed: 2.5 + Math.random() * 2,
    activeSpeed: 0.25 + Math.random() * 0.35,
    /* Create a natural "frequency curve" — taller in the centre, shorter at edges */
    freqMultiplier: Math.sin((i / (barCount - 1)) * Math.PI) * 0.7 + 0.3,
  })), []);

  /* Live amplitude values for speaking mode, updated rapidly */
  const [amplitudes, setAmplitudes] = useState<number[]>(() => Array(barCount).fill(0));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setAmplitudes(Array(barCount).fill(0));
      return;
    }
    let running = true;
    const tick = () => {
      if (!running) return;
      setAmplitudes(prev =>
        prev.map((_, i) => {
          const seed = barSeeds[i];
          /* Simulate frequency spectrum: bass (left) is smoother, treble (right) is more erratic */
          const bassWeight = 1 - (i / barCount);
          const trebleWeight = i / barCount;
          const base = seed.freqMultiplier * (0.3 + Math.random() * 0.7);
          const smoothed = base * (bassWeight * 0.8 + trebleWeight * 1.2);
          return Math.min(1, smoothed);
        })
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, barSeeds]);

  return (
    <div className="sentinel-freq-visualizer" aria-hidden="true">
      {/* ── Label ── */}
      <motion.span
        className="sentinel-freq-label"
        animate={{ opacity: active ? 1 : 0.4 }}
        transition={{ duration: 0.4 }}
      >
        {active ? "◉ TRANSMITTING" : "◎ SIGNAL IDLE"}
      </motion.span>

      {/* ── Mirrored frequency bars ── */}
      <div className="sentinel-freq-bars">
        {barSeeds.map((seed, i) => {
          const amp = amplitudes[i];
          /* Active: use live amplitude. Idle: gentle sine wave movement */
          const activeH = 3 + amp * seed.freqMultiplier * 32;
          const idleH = seed.idleHeight;
          const barH = active ? activeH : idleH;

          return (
            <div key={seed.id} className="sentinel-freq-bar-col">
              {/* Top bar (mirrored) */}
              <motion.div
                className="sentinel-freq-bar sentinel-freq-bar-top"
                animate={{
                  height: active ? `${barH}px` : [`${idleH}px`, `${idleH + 4 + Math.random() * 3}px`, `${idleH}px`],
                }}
                transition={active ? { duration: 0.06, ease: "linear" } : {
                  repeat: Infinity,
                  duration: seed.idleSpeed,
                  delay: i * 0.06,
                  ease: "easeInOut",
                }}
                style={{
                  background: active
                    ? `linear-gradient(to top, rgba(${theme.rgb}, 0.9), rgba(${theme.rgb}, 0.3))`
                    : `linear-gradient(to top, rgba(${theme.rgb}, 0.4), rgba(${theme.rgb}, 0.1))`,
                  boxShadow: active && amp > 0.5
                    ? `0 0 ${4 + amp * 8}px rgba(${theme.rgb}, ${0.3 + amp * 0.4})`
                    : "none",
                }}
              />
              {/* Bottom bar (mirror reflection) */}
              <motion.div
                className="sentinel-freq-bar sentinel-freq-bar-bottom"
                animate={{
                  height: active ? `${barH * 0.6}px` : [`${idleH * 0.5}px`, `${(idleH + 3) * 0.5}px`, `${idleH * 0.5}px`],
                }}
                transition={active ? { duration: 0.06, ease: "linear" } : {
                  repeat: Infinity,
                  duration: seed.idleSpeed,
                  delay: i * 0.06,
                  ease: "easeInOut",
                }}
                style={{
                  background: active
                    ? `linear-gradient(to bottom, rgba(${theme.rgb}, 0.5), rgba(${theme.rgb}, 0.05))`
                    : `linear-gradient(to bottom, rgba(${theme.rgb}, 0.2), rgba(${theme.rgb}, 0.02))`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Glow line at the center seam ── */}
      <motion.div
        className="sentinel-freq-center-line"
        style={{ background: `rgba(${theme.rgb}, 0.4)` }}
        animate={{
          opacity: active ? [0.6, 1, 0.6] : [0.15, 0.3, 0.15],
          boxShadow: active
            ? [`0 0 8px rgba(${theme.rgb}, 0.4)`, `0 0 16px rgba(${theme.rgb}, 0.7)`, `0 0 8px rgba(${theme.rgb}, 0.4)`]
            : `0 0 4px rgba(${theme.rgb}, 0.15)`,
        }}
        transition={{ repeat: Infinity, duration: active ? 0.5 : 2.5 }}
      />
    </div>
  );
}

/* ── Energy arc / neural pulse ── */
function EnergyArc({ index, total, status }: { index: number; total: number; status: SentinelCoreStatus }) {
  const theme = statusThemes[status];
  const angle = (index / total) * 360;
  const isActive = status !== "Ready";

  return (
    <motion.div
      className="sentinel-energy-arc"
      style={{
        transform: `rotate(${angle}deg)`,
        background: `linear-gradient(to top, transparent, ${theme.primary})`,
      }}
      animate={{
        opacity: isActive ? [0, 0.8, 0] : [0, 0.3, 0],
        scaleY: isActive ? [0.3, 1, 0.3] : [0.5, 0.7, 0.5],
      }}
      transition={{
        repeat: Infinity,
        duration: isActive ? 1.5 + index * 0.15 : 3 + index * 0.3,
        delay: index * 0.2,
        ease: "easeInOut",
      }}
    />
  );
}

/* ── Data stream particles flowing around orbits ── */
function DataParticle({ index, ring, status }: { index: number; ring: number; status: SentinelCoreStatus }) {
  const theme = statusThemes[status];
  const isActive = status !== "Ready";
  const radius = 70 + ring * 28;
  const startAngle = (index / 6) * 360 + ring * 30;

  return (
    <motion.div
      className="sentinel-data-particle"
      style={{
        width: isActive ? "4px" : "3px",
        height: isActive ? "4px" : "3px",
        background: `rgba(${theme.rgb}, 0.9)`,
        boxShadow: `0 0 ${isActive ? "8px" : "4px"} rgba(${theme.rgb}, 0.6)`,
        offsetPath: `circle(${radius}px)`,
        offsetRotate: "0deg",
        position: "absolute" as const,
        borderRadius: "50%",
        left: "50%",
        top: "50%",
        marginLeft: "-2px",
        marginTop: "-2px",
      }}
      animate={{
        offsetDistance: ["0%", "100%"],
        opacity: [0.3, 1, 0.3],
      }}
      transition={{
        offsetDistance: {
          repeat: Infinity,
          duration: isActive ? 3 + ring * 1.5 : 8 + ring * 3,
          delay: index * 0.5 + ring * 0.3,
          ease: "linear",
        },
        opacity: {
          repeat: Infinity,
          duration: 2,
          delay: index * 0.3,
        },
      }}
    />
  );
}

export default function SentinelCore({
  status = "Ready",
  voiceActive = false,
  responding = false,
  modelOnline = false,
  activeModel,
  memoryOnline = true,
  safeMode = true,
}: Props) {
  const pulse = responding || status === "Thinking" || status === "Speaking" || status === "Executing";
  const isSpeaking = status === "Speaking";
  const signal = modelOnline ? "Online" : "Offline";
  const theme = statusThemes[status];

  /* Simulated voice amplitude for speaking effect */
  const [voiceAmplitude, setVoiceAmplitude] = useState(0);
  const voiceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSpeaking) {
      const tick = () => {
        setVoiceAmplitude(0.3 + Math.random() * 0.7);
        voiceTimerRef.current = window.setTimeout(tick, 80 + Math.random() * 120);
      };
      tick();
    } else {
      setVoiceAmplitude(0);
      if (voiceTimerRef.current) {
        clearTimeout(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
    }
    return () => {
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
    };
  }, [isSpeaking]);

  /* Idle heartbeat pulse counter for ambient life */
  const [heartbeat, setHeartbeat] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setHeartbeat((n) => n + 1), 2800);
    return () => clearInterval(timer);
  }, []);

  const ringCount = 3;
  const particlesPerRing = 5;

  return (
    <section
      className="panel sentinel-core-section relative grid min-h-[320px] overflow-hidden rounded p-4 sm:min-h-[386px] sm:p-6"
      aria-label={`Sentinel Core status ${status}`}
    >
      {/* ── Ambient background grid ── */}
      <div className="sentinel-grid-bg" aria-hidden="true" />

      {/* ── Scanline sweep ── */}
      <div className="sentinel-scanline" aria-hidden="true" />

      {/* ── Background cross-hairs ── */}
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-300/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-violet-300/10" />
      </div>

      {/* ── Ambient background glow reacting to status ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse at 50% 45%, rgba(${theme.rgb}, ${pulse ? 0.12 : 0.05}) 0%, transparent 65%)`,
        }}
        transition={{ duration: 0.8 }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center justify-center">
        {/* ── Status badges ── */}
        <div className="absolute left-0 top-0 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
          <span
            className={`rounded border px-2 py-1 ${
              modelOnline
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                : "border-rose-300/30 bg-rose-300/10 text-rose-100"
            }`}
          >
            Model {signal}
          </span>
          <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-cyan-100">
            {safeMode ? "Safe Mode" : "Unsafe"}
          </span>
        </div>

        {/* ── Main core visualization ── */}
        <div className="relative grid h-56 w-56 place-items-center sm:h-72 sm:w-72">

          {/* Energy arcs radiating from core */}
          {Array.from({ length: 8 }).map((_, i) => (
            <EnergyArc key={`arc-${i}`} index={i} total={8} status={status} />
          ))}

          {/* Orbital rings */}
          {Array.from({ length: ringCount }).map((_, ring) => (
            <motion.div
              key={`ring-${ring}`}
              className="absolute rounded-full border sentinel-orbit-ring"
              style={{
                inset: `${ring * 26}px`,
                borderColor:
                  isSpeaking
                    ? `rgba(${theme.rgb}, ${0.4 + ring * 0.1})`
                    : ring === 1
                    ? "rgba(155, 92, 255, 0.55)"
                    : "rgba(53, 231, 255, 0.5)",
                boxShadow: isSpeaking
                  ? `0 0 ${12 + voiceAmplitude * 20}px rgba(${theme.rgb}, ${0.15 + voiceAmplitude * 0.2}), inset 0 0 ${8 + voiceAmplitude * 12}px rgba(${theme.rgb}, 0.05)`
                  : pulse
                  ? `0 0 12px rgba(${theme.rgb}, 0.12)`
                  : "none",
              }}
              animate={{
                rotate: ring % 2 ? -360 : 360,
                scale: isSpeaking
                  ? [1, 1 + voiceAmplitude * 0.08, 1]
                  : pulse
                  ? [1, 1.04, 1]
                  : [1, 1.01, 1],
              }}
              transition={{
                rotate: {
                  repeat: Infinity,
                  duration: pulse ? 10 + ring * 4 : 16 + ring * 6,
                  ease: "linear",
                },
                scale: {
                  repeat: Infinity,
                  duration: isSpeaking ? 0.3 : 1.8,
                },
              }}
            />
          ))}

          {/* Data stream particles orbiting the rings */}
          {Array.from({ length: ringCount }).map((_, ring) =>
            Array.from({ length: particlesPerRing }).map((_, pi) => (
              <DataParticle
                key={`dp-${ring}-${pi}`}
                index={pi}
                ring={ring}
                status={status}
              />
            ))
          )}

          {/* Voice-active ring (green pulse) */}
          {voiceActive && (
            <motion.div
              className="absolute inset-6 rounded-full border-2 border-sentinel-green/70"
              animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.4, 0.95, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
          )}

          {/* Outer plasma glow field */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: "-16px",
              background: `radial-gradient(circle, rgba(${theme.rgb}, 0.06) 30%, transparent 70%)`,
              filter: "blur(20px)",
            }}
            animate={{
              scale: isSpeaking ? [1, 1 + voiceAmplitude * 0.15, 1] : pulse ? [1, 1.08, 1] : [1, 1.03, 1],
              opacity: isSpeaking ? [0.5, 0.5 + voiceAmplitude * 0.5, 0.5] : pulse ? [0.4, 0.7, 0.4] : [0.2, 0.35, 0.2],
            }}
            transition={{
              repeat: Infinity,
              duration: isSpeaking ? 0.15 : pulse ? 1.5 : 3,
            }}
            aria-hidden="true"
          />

          {/* Inner glow / aura */}
          <motion.div
            className="absolute h-24 w-24 rounded-full sm:h-28 sm:w-28"
            style={{
              background: `radial-gradient(circle, rgba(${theme.rgb}, 0.3), transparent 70%)`,
              filter: "blur(16px)",
            }}
            animate={{
              scale: isSpeaking
                ? [1, 1 + voiceAmplitude * 0.4, 1]
                : pulse
                ? [1, 1.35, 1]
                : [1, 1.08, 1],
              opacity: isSpeaking ? [0.6, 0.6 + voiceAmplitude * 0.4, 0.6] : [0.5, 0.8, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: isSpeaking ? 0.12 : pulse ? 1.1 : 2.8,
            }}
          />

          {/* ── Core sphere ── */}
          <motion.div
            className="sentinel-core-orb relative grid h-20 w-20 place-items-center rounded-full sm:h-24 sm:w-24"
            style={{
              border: `1px solid rgba(${theme.rgb}, 0.8)`,
              background: `rgba(${theme.rgb}, 0.12)`,
            }}
            animate={{
              boxShadow: isSpeaking
                ? `0 0 ${50 + voiceAmplitude * 60}px rgba(${theme.rgb}, ${0.35 + voiceAmplitude * 0.3}), inset 0 0 ${20 + voiceAmplitude * 30}px rgba(${theme.rgb}, 0.15)`
                : pulse
                ? `0 0 70px rgba(${theme.rgb}, 0.55), inset 0 0 25px rgba(${theme.rgb}, 0.1)`
                : `0 0 38px rgba(${theme.rgb}, 0.28)`,
              scale: isSpeaking ? [1, 1 + voiceAmplitude * 0.06, 1] : 1,
            }}
            transition={{ duration: isSpeaking ? 0.1 : 0.35 }}
          >
            {/* Inner gradient sphere */}
            <motion.div
              className="h-10 w-10 rounded-full sm:h-11 sm:w-11"
              style={{
                background: `radial-gradient(circle at 35% 35%, rgba(${theme.rgb}, 0.9), rgba(${theme.rgb}, 0.4) 50%, rgba(${theme.rgb}, 0.15))`,
              }}
              animate={{
                scale: isSpeaking
                  ? [1, 1 + voiceAmplitude * 0.12, 1]
                  : [1, 1.05, 1],
                filter: isSpeaking
                  ? `brightness(${1 + voiceAmplitude * 0.5})`
                  : "brightness(1)",
              }}
              transition={{
                repeat: Infinity,
                duration: isSpeaking ? 0.1 : 2.5,
                ease: "easeInOut",
              }}
            />

            {/* Speaking voice ripple rings */}
            <AnimatePresence>
              {isSpeaking && (
                <>
                  {[0, 1, 2].map((ripple) => (
                    <motion.div
                      key={`ripple-${ripple}`}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        border: `1px solid rgba(${theme.rgb}, 0.4)`,
                        inset: "-4px",
                      }}
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: [1, 2.2 + ripple * 0.4], opacity: [0.5, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        delay: ripple * 0.5,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Orbital node particles */}
          {Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            const radius = 43;
            return (
              <motion.span
                key={`node-${i}`}
                className="absolute rounded-full"
                style={{
                  left: `${50 + Math.cos(angle) * radius}%`,
                  top: `${50 + Math.sin(angle) * radius}%`,
                  transform: "translate(-50%, -50%)",
                  width: "6px",
                  height: "6px",
                  background: `rgba(${theme.rgb}, 0.8)`,
                  boxShadow: `0 0 6px rgba(${theme.rgb}, 0.5)`,
                }}
                animate={{
                  opacity: isSpeaking
                    ? [0.3, 0.3 + voiceAmplitude * 0.7, 0.3]
                    : [0.25, 1, 0.25],
                  scale: isSpeaking
                    ? [0.8, 0.8 + voiceAmplitude * 1.2, 0.8]
                    : [0.8, 1.4, 0.8],
                }}
                transition={{
                  repeat: Infinity,
                  duration: isSpeaking ? 0.15 : 2.2,
                  delay: isSpeaking ? i * 0.02 : i * 0.08,
                }}
              />
            );
          })}

          {/* ── Neural connection lines between random node pairs ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            {[
              [0, 7], [2, 9], [4, 11], [1, 8], [5, 12], [3, 10],
            ].map(([from, to], idx) => {
              const fromAngle = (from / 14) * Math.PI * 2;
              const toAngle = (to / 14) * Math.PI * 2;
              const r = 43;
              return (
                <motion.line
                  key={`neural-${idx}`}
                  x1={50 + Math.cos(fromAngle) * r}
                  y1={50 + Math.sin(fromAngle) * r}
                  x2={50 + Math.cos(toAngle) * r}
                  y2={50 + Math.sin(toAngle) * r}
                  stroke={`rgba(${theme.rgb}, 0.2)`}
                  strokeWidth={0.3}
                  animate={{
                    opacity: pulse ? [0.1, 0.5, 0.1] : [0.05, 0.2, 0.05],
                    strokeWidth: isSpeaking ? [0.2, 0.2 + voiceAmplitude * 0.5, 0.2] : [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: isSpeaking ? 0.3 : 2 + idx * 0.3,
                    delay: idx * 0.15,
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* ── Frequency Visualizer ── */}
        <FrequencyVisualizer active={isSpeaking} status={status} />

        {/* ── Status text ── */}
        <div className="mt-2 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">Sentinel Core</p>
          <SentinelStatus status={status} />
          <p className="mx-auto mt-2 max-w-56 truncate text-xs text-slate-400 sm:max-w-64">
            {activeModel ? activeModel : "No active model selected"} · Memory{" "}
            {memoryOnline ? "ready" : "idle"}
          </p>
        </div>
      </div>
    </section>
  );
}
