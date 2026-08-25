import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

/**
 * 🌟 Quimora Unified Premium StatCard Component
 * Single Source of Truth for all statistical KPI cards across Instructor, Student, and Admin dashboards.
 * 
 * Supports flexible prop signatures:
 * Option A: <StatCard title="TOTAL QUIZZES" value={4} icon={BookOpen} change="+3 this week" gradient="from-cyan-500 to-blue-600" />
 * Option B: <StatCard stat={statObject} idx={0} />
 */
export default function StatCard({
  // Direct props
  title,
  label,
  value,
  icon: DirectIcon,
  change,
  subtext,
  changeType = "positive", // "positive" | "negative" | "neutral"
  gradient,
  iconColor,
  bgColorClass,
  index = 0,
  idx = 0,
  onClick,
  className = "",
  // Object prop support (for backward compatibility)
  stat,
}) {
  // Normalize incoming props
  const cardTitle = title || label || stat?.title || stat?.label || "";
  const cardValue = value !== undefined ? value : stat?.value ?? 0;
  const Icon = DirectIcon || stat?.icon || stat?.Icon;
  const cardChange = change || subtext || stat?.change || stat?.subtext;
  const cardGradient =
    gradient || stat?.gradient || "from-brand-start to-brand-end";
  const itemIndex = index || idx || 0;

  // Resolve Change / Trend Colors & Icons
  let trendTextColor = "text-emerald-500";
  let TrendIcon = TrendingUp;

  if (changeType === "negative" || (typeof cardChange === "string" && cardChange.startsWith("-"))) {
    trendTextColor = "text-red-500";
    TrendIcon = TrendingDown;
  } else if (changeType === "neutral") {
    trendTextColor = "text-muted";
    TrendIcon = Info;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: itemIndex * 0.05, duration: 0.25 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={`group relative overflow-hidden bg-surface border border-main rounded-2xl p-5 shadow-card transition-all duration-300 flex flex-col justify-between ${
        onClick ? "cursor-pointer hover:border-accent/40" : ""
      } ${className}`}
    >
      {/* Subtle Background Glow on Hover */}
      <div
        className={`pointer-events-none absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-linear-to-tr ${cardGradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}
      />

      {/* Header: Title & Icon */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-muted text-xs font-semibold uppercase tracking-wider line-clamp-1">
          {cardTitle}
        </span>

        {Icon && (
          <div
            className={`p-2.5 rounded-xl border border-main/40 bg-elevated text-main shadow-xs transform group-hover:scale-105 transition-all duration-300 ${
              bgColorClass || ""
            }`}
          >
            <Icon className={`w-4 h-4 ${iconColor || "text-accent"}`} />
          </div>
        )}
      </div>

      {/* Body: Value */}
      <div className="text-2xl sm:text-3xl font-extrabold text-main font-display tracking-tight transition-all duration-300 group-hover:text-accent">
        {cardValue}
      </div>

      {/* Footer: Trend / Change Subtext */}
      {cardChange && (
        <div
          className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${trendTextColor}`}
        >
          {changeType !== "neutral" && <TrendIcon className="w-3.5 h-3.5 shrink-0" />}
          <span className="line-clamp-1">{cardChange}</span>
        </div>
      )}
    </motion.div>
  );
}
