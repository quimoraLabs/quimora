import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Info, Minus } from "lucide-react";

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
  let trendBgColor = "bg-emerald-50 dark:bg-emerald-900/20";

  if (changeType === "negative" || (typeof cardChange === "string" && cardChange.startsWith("-"))) {
    trendTextColor = "text-red-500";
    TrendIcon = TrendingDown;
    trendBgColor = "bg-red-50 dark:bg-red-900/20";
  } else if (changeType === "neutral") {
    trendTextColor = "text-gray-400 dark:text-gray-500";
    TrendIcon = Minus;
    trendBgColor = "bg-gray-50 dark:bg-gray-800/20";
  }

  // Format value if it's a number with decimals
  const formattedValue = typeof cardValue === 'number' 
    ? (Number.isInteger(cardValue) ? cardValue : cardValue.toFixed(1))
    : cardValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: itemIndex * 0.06, duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
        onClick ? "cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700" : ""
      } ${className}`}
    >
      {/* Gradient Accent Bar - Top */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cardGradient} rounded-t-2xl transition-all duration-300 group-hover:h-1.5`} />

      {/* Subtle Background Glow on Hover */}
      <div
        className={`pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-gradient-to-tr ${cardGradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}
      />

      {/* Header: Title & Icon */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider line-clamp-1">
          {cardTitle}
        </span>

        {Icon && (
          <div
            className={`p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${
              bgColorClass || ""
            }`}
          >
            <Icon className={`w-4 h-4 ${iconColor || "text-indigo-600 dark:text-indigo-400"}`} />
          </div>
        )}
      </div>

      {/* Body: Value with Animation */}
      <div className="flex items-end gap-2">
        <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {formattedValue}
        </span>
        {cardChange && (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">
            {cardChange.includes('%') ? '' : ''}
          </span>
        )}
      </div>

      {/* Footer: Trend / Change Subtext with Badge */}
      {cardChange && (
        <div className="mt-4 flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${trendBgColor} ${trendTextColor}`}>
            <TrendIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{cardChange}</span>
          </div>
        </div>
      )}

      {/* Optional: Progress Bar for certain stats */}
      {stat?.progress !== undefined && (
        <div className="mt-3 w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stat.progress}%` }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`h-full bg-gradient-to-r ${cardGradient} rounded-full`}
          />
        </div>
      )}
    </motion.div>
  );
}