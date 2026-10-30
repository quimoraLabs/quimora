import { useState } from "react";
import { Clock } from "lucide-react";

export function ExamTimer({ timer }) {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const isLowTime = timer <= 180; // under 3 mins
  const isUrgentTime = timer <= 60; // under 1 min

  const getStatusClasses = () => {
    if (isUrgentTime) {
      return "border-red-500/50 bg-red-950/30 text-red-400 shadow-lg shadow-red-500/30 animate-pulse";
    }
    if (isLowTime) {
      return "border-amber-500/50 bg-amber-950/20 text-amber-400 shadow-md shadow-amber-500/20";
    }
    return "border-brand-mid/40 bg-surface/80 text-brand-mid shadow-card backdrop-blur-md";
  };

  return (
    <div className="flex items-center justify-center shrink-0">
      <div
        className={`flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl border transition-all duration-300 ${getStatusClasses()}`}
      >
        <Clock className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 shrink-0 ${isUrgentTime ? "animate-spin text-red-400" : isLowTime ? "text-amber-400" : "text-brand-mid"}`} />
        <div className="font-mono text-sm sm:text-xl md:text-2xl font-black tabular-nums tracking-tight">
          {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
        </div>
        <span className="hidden md:inline-block text-3xs uppercase tracking-wider font-bold text-muted bg-elevated px-1.5 py-0.5 rounded-full border border-main whitespace-nowrap">
          {isUrgentTime ? "URGENT" : isLowTime ? "LOW" : "LEFT"}
        </span>
      </div>
    </div>
  );
}
