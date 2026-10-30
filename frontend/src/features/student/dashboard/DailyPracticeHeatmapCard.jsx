import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Flame, Sparkles } from "lucide-react";

/**
 * 🟩 Authentic GitHub & LeetCode Style Annual Practice Contribution Graph
 * 7 rows (Days of week) x 53 columns (Weeks of the year)
 * Horizontal compact timeline with authentic contribution squares, month headers, and tooltips.
 */
export default function DailyPracticeHeatmapCard({
  dailyActivity,
  recentAttempts = [],
}) {
  // 1. Build activity map: { "YYYY-MM-DD": count }
  const activityMap = useMemo(() => {
    const map = { ...(dailyActivity?.activityMap || {}) };

    if (Object.keys(map).length === 0 && recentAttempts.length > 0) {
      recentAttempts.forEach((attempt) => {
        if (attempt.completedAt) {
          const dateStr = new Date(attempt.completedAt)
            .toISOString()
            .split("T")[0];
          map[dateStr] = (map[dateStr] || 0) + 1;
        }
      });
    }
    return map;
  }, [dailyActivity, recentAttempts]);

  // 2. Generate 52-53 weeks timeline matching GitHub
  const { weeks, monthLabels, totalSubmissionsYear } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

    // Start date: 52 weeks ago, aligned to previous Sunday
    const start = new Date(today);
    start.setDate(today.getDate() - (52 * 7 + todayDayOfWeek));

    const weeksList = [];
    const months = [];
    let currentWeek = [];
    let prevMonth = -1;
    let totalCount = 0;

    const cursor = new Date(start);
    while (cursor <= today || currentWeek.length > 0) {
      const dayOfWeek = cursor.getDay();
      const dateStr = cursor.toISOString().split("T")[0];
      const isFuture = cursor > today;
      const count = isFuture ? 0 : activityMap[dateStr] || 0;
      totalCount += count;

      const currentMonth = cursor.getMonth();
      const isNewMonth = currentMonth !== prevMonth && cursor.getDate() <= 7;

      currentWeek.push({
        dateStr,
        dayOfMonth: cursor.getDate(),
        month: cursor.toLocaleString("en-US", { month: "short" }),
        fullDate: cursor.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        dayOfWeek,
        count,
        isFuture,
      });

      if (dayOfWeek === 6 || cursor > today) {
        // Track month label position
        if (isNewMonth && !isFuture) {
          months.push({
            label: cursor.toLocaleString("en-US", { month: "short" }),
            colIndex: weeksList.length,
          });
          prevMonth = currentMonth;
        }

        weeksList.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
      if (cursor > today && dayOfWeek === 6) break;
    }

    return {
      weeks: weeksList,
      monthLabels: months,
      totalSubmissionsYear: totalCount,
    };
  }, [activityMap]);

  // Streak stats
  const currentStreak = dailyActivity?.currentStreak ?? (totalSubmissionsYear > 0 ? 1 : 0);

  // GitHub authentic color intensity scale
  const getCellColor = (count, isFuture) => {
    if (isFuture) return "bg-transparent border-transparent opacity-0 pointer-events-none";
    if (count === 0) return "bg-[#161b22] border-[#21262d]/50 hover:border-slate-500";
    if (count === 1) return "bg-[#0e4429] border-[#006d32]/40 hover:border-[#26a641]";
    if (count === 2) return "bg-[#006d32] border-[#26a641]/50 hover:border-[#39d353]";
    if (count === 3) return "bg-[#26a641] border-[#39d353]/60 hover:border-emerald-300";
    return "bg-[#39d353] border-emerald-300 text-slate-950 font-bold shadow-xs shadow-emerald-400/50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 bg-surface border border-main rounded-3xl shadow-card relative overflow-hidden"
    >
      {/* Top Header Row with Total Practice & Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-main tracking-tight">
              {totalSubmissionsYear} {totalSubmissionsYear === 1 ? "quiz" : "quizzes"} completed in the last year
            </h2>
            <p className="text-xs text-muted">
              Annual daily practice contribution activity
            </p>
          </div>
        </div>

        {currentStreak > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold self-start sm:self-auto">
            <Flame className="w-3.5 h-3.5" />
            <span>{currentStreak} Day Streak</span>
          </div>
        )}
      </div>

      {/* GitHub Calendar Container */}
      <div className="overflow-x-auto pb-1 -mx-1 sm:mx-0">
        <div className="inline-block min-w-full">
          {/* Month Labels along the top */}
          <div className="flex pl-8 mb-1.5 text-2xs font-semibold text-muted tracking-tight select-none">
            {monthLabels.map((m, idx) => (
              <div
                key={`${m.label}-${idx}`}
                className="w-11 shrink-0 text-left"
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Grid: Left Day Labels + 53 Week Columns */}
          <div className="flex items-start gap-1">
            {/* Day of Week Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between h-21 text-3xs font-semibold text-muted pr-1.5 select-none shrink-0 w-7">
              <span className="leading-none pt-0.5">Mon</span>
              <span className="leading-none">Wed</span>
              <span className="leading-none pb-0.5">Fri</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const cellColor = getCellColor(day.count, day.isFuture);
                    return (
                      <div
                        key={day.dateStr}
                        className="group relative"
                      >
                        <div
                          className={`w-2.5 h-2.5 sm:w-2.75 sm:h-2.75 rounded-xs border transition-all duration-150 cursor-pointer ${cellColor}`}
                        />

                        {/* Interactive Tooltip on Hover */}
                        {!day.isFuture && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-30 whitespace-nowrap">
                            <div className="bg-[#1b2230] border border-white/10 text-white text-2xs font-semibold py-1 px-2.5 rounded-lg shadow-xl backdrop-blur-md">
                              <span>
                                {day.count === 0 ? "No" : day.count}{" "}
                                {day.count === 1 ? "quiz" : "quizzes"} completed on {day.fullDate}
                              </span>
                            </div>
                            <div className="w-1.5 h-1.5 bg-[#1b2230] rotate-45 -mt-0.75 border-r border-b border-white/10" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Authentic Footer: Learn More & Less/More Swatches */}
      <div className="mt-3 pt-2.5 border-t border-main/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted">
        <span className="text-2xs text-muted/70 hover:text-muted cursor-pointer transition-colors">
          Learn how we count practice contributions
        </span>

        {/* Legend Swatches */}
        <div className="flex items-center gap-1.5 text-2xs text-muted self-end sm:self-auto select-none">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-[#161b22] border border-[#21262d]/50" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#0e4429] border border-[#006d32]/40" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#006d32] border border-[#26a641]/50" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#26a641] border border-[#39d353]/60" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#39d353] border border-emerald-300" />
          <span>More</span>
        </div>
      </div>
    </motion.div>
  );
}
