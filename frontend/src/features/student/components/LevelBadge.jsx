import React from "react";
import { Sparkles, Award, Target, Zap, Crown, Flame } from "lucide-react";

const TIER_STYLES = {
  Beginner: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-300 dark:border-slate-700",
    icon: Sparkles,
    color: "from-slate-400 to-slate-600",
  },
  Learner: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-300 dark:border-sky-800",
    icon: Award,
    color: "from-sky-400 to-blue-600",
  },
  Intermediate: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-800",
    icon: Target,
    color: "from-emerald-400 to-teal-600",
  },
  Advanced: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-300 dark:border-indigo-800",
    icon: Zap,
    color: "from-indigo-500 to-purple-600",
  },
  Master: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-800",
    icon: Crown,
    color: "from-amber-400 to-orange-600",
  },
  Expert: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-300 dark:border-rose-800",
    icon: Flame,
    color: "from-rose-500 to-red-600",
  },
};

export function getTierFromElo(elo) {
  if (elo >= 1800) return "Expert";
  if (elo >= 1600) return "Master";
  if (elo >= 1400) return "Advanced";
  if (elo >= 1200) return "Intermediate";
  if (elo >= 1000) return "Learner";
  return "Beginner";
}

export default function LevelBadge({ levelName, elo = null, showTooltip = true }) {
  const resolvedTier = levelName || (elo !== null ? getTierFromElo(elo) : "Beginner");
  const config = TIER_STYLES[resolvedTier] || TIER_STYLES.Beginner;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-all shadow-2xs select-none ${config.bg} ${config.text} ${config.border}`}
      title={showTooltip ? `${resolvedTier} Tier • Skill Rating Level` : undefined}
    >
      <div className={`p-1 rounded-md bg-linear-to-br ${config.color} text-white shadow-xs`}>
        <Icon className="w-3 h-3" />
      </div>
      <span>{resolvedTier}</span>
      {elo !== null && (
        <span className="opacity-80 text-2xs font-mono ml-0.5">({elo})</span>
      )}
    </div>
  );
}
