import { useState } from "react";
import { Clock } from "lucide-react";

export function ExamTimer({ timer }) {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const isLowTime = timer <= 180; // under 3 mins
  const isUrgentTime = timer <= 60; // under 1 min

  const getStatusClasses = () => {
    if (isUrgentTime) {
      return "border-red-500/50 bg-red-950/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse";
    }
    if (isLowTime) {
      return "border-amber-500/50 bg-amber-950/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
    }
    return "border-brand-mid/40 bg-surface/80 text-brand-mid shadow-card backdrop-blur-md";
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 ${getStatusClasses()}`}
      >
        <Clock className={`w-5 h-5 ${isUrgentTime ? "animate-spin text-red-400" : isLowTime ? "text-amber-400" : "text-brand-mid"}`} />
        <div className="font-mono text-2xl md:text-3xl font-black tabular-nums tracking-tight">
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-muted bg-elevated px-2 py-0.5 rounded-full border border-main">
          {isUrgentTime ? "URGENT" : isLowTime ? "TIME LOW" : "REMAINING"}
        </span>
      </div>
    </div>
  );
}
