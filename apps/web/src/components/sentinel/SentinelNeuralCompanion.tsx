import { useEffect, useState } from "react";
import type { SentinelCoreStatus } from "./SentinelCore";

type Props = {
  status: SentinelCoreStatus;
  mode?: string;
  memoryReadiness?: string;
};

export default function SentinelNeuralCompanion({ status, mode = "Think Mode", memoryReadiness = "Indexed" }: Props) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (status === "Listening" || status === "Speaking") {
      const interval = setInterval(() => setPulse(p => !p), 800);
      return () => clearInterval(interval);
    } else {
      setPulse(false);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case "Speaking": return "text-sentinel-green drop-shadow-[0_0_15px_rgba(67,240,164,0.8)]";
      case "Listening": return "text-cyan-400 drop-shadow-[0_0_15px_rgba(53,231,255,0.8)]";
      case "Thinking": return "text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-pulse";
      case "Needs Approval": return "text-sentinel-rose drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]";
      default: return "text-cyan-500/50 drop-shadow-[0_0_8px_rgba(53,231,255,0.3)]";
    }
  };

  const getRingColor = () => {
    switch (status) {
      case "Speaking": return "border-sentinel-green/40 shadow-[0_0_30px_rgba(67,240,164,0.2)]";
      case "Listening": return "border-cyan-400/40 shadow-[0_0_30px_rgba(53,231,255,0.2)]";
      case "Thinking": return "border-indigo-400/40 shadow-[0_0_30px_rgba(129,140,248,0.2)]";
      case "Needs Approval": return "border-sentinel-rose/40 shadow-[0_0_30px_rgba(244,63,94,0.2)]";
      default: return "border-cyan-500/20";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full">
      {/* Holographic Container */}
      <div className="relative flex items-center justify-center h-64 w-64 mb-8">
        
        {/* Abstract Head / Silhouette */}
        <div className={`absolute inset-0 rounded-full border-2 border-dashed ${getRingColor()} animate-[spin_20s_linear_infinite]`}></div>
        <div className={`absolute inset-4 rounded-full border border-dotted ${getRingColor()} animate-[spin_15s_linear_infinite_reverse]`}></div>
        
        {/* Core Neural Center */}
        <div className={`relative flex items-center justify-center h-32 w-32 rounded-[40%] bg-black/40 backdrop-blur-md border border-white/10 ${pulse ? 'scale-110' : 'scale-100'} transition-transform duration-500`}>
          <svg viewBox="0 0 100 100" className={`w-20 h-20 ${getStatusColor()}`}>
            <path d="M50 10 Q20 30 20 60 Q50 90 80 60 Q80 30 50 10 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"/>
            <circle cx="50" cy="50" r="10" fill="currentColor" className="animate-pulse" />
            {/* Neural Lines */}
            <path d="M50 50 L30 40 M50 50 L70 40 M50 50 L50 70 M50 50 L25 60 M50 50 L75 60" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
          </svg>
        </div>

        {/* Floating Particles/Fragments */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`absolute w-1 h-1 rounded-full bg-cyan-400/60 animate-pulse`} 
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`
              }}></div>
          ))}
        </div>
        
        {/* Scan line effect */}
        <div className="absolute top-0 w-full h-[1px] bg-cyan-400/50 shadow-[0_0_10px_rgba(53,231,255,0.8)] animate-[sentinel-scan-sweep_4s_ease-in-out_infinite]"></div>
      </div>

      {/* Mode / Status Panel */}
      <div className="w-full space-y-3">
        <div className="flex justify-between items-center bg-black/30 border border-white/5 rounded p-3 text-sm">
          <span className="text-slate-400">Companion State</span>
          <span className={`font-semibold tracking-wider uppercase text-xs ${status === "Ready" ? "text-slate-300" : "text-cyan-400"}`}>{status}</span>
        </div>
        <div className="flex justify-between items-center bg-black/30 border border-white/5 rounded p-3 text-sm">
          <span className="text-slate-400">Current Mode</span>
          <span className="font-semibold text-indigo-300">{mode}</span>
        </div>
        <div className="flex justify-between items-center bg-black/30 border border-white/5 rounded p-3 text-sm">
          <span className="text-slate-400">Memory</span>
          <span className="font-semibold text-sentinel-green">{memoryReadiness}</span>
        </div>
      </div>
    </div>
  );
}
