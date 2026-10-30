import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Trophy, Hourglass, Star } from "lucide-react";

/**
 * 🏅 Ribbbon Medal Badge Component
 * Renders authentic Gold (1st), Silver (2nd), Bronze (3rd) medal with striped ribbon,
 * or clean rank badge for 4+.
 */
function RankMedal({ rank }) {
  if (rank === 1) {
    return (
      <div className="relative flex flex-col items-center justify-center shrink-0 w-8 h-8">
        {/* Striped Ribbon */}
        <div className="absolute -top-1 flex gap-0.5 z-0">
          <div className="w-1.5 h-3 bg-red-500 -rotate-12 rounded-xs" />
          <div className="w-1.5 h-3 bg-blue-500 rotate-12 rounded-xs" />
        </div>
        {/* Gold Medal */}
        <div className="relative z-10 w-6 h-6 rounded-full bg-linear-to-b from-amber-300 via-amber-400 to-yellow-500 border border-yellow-200/80 shadow-sm shadow-amber-500/50 flex items-center justify-center text-amber-950 font-black text-xs">
          1
        </div>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="relative flex flex-col items-center justify-center shrink-0 w-8 h-8">
        {/* Striped Ribbon */}
        <div className="absolute -top-1 flex gap-0.5 z-0">
          <div className="w-1.5 h-3 bg-red-500 -rotate-12 rounded-xs" />
          <div className="w-1.5 h-3 bg-blue-500 rotate-12 rounded-xs" />
        </div>
        {/* Silver Medal */}
        <div className="relative z-10 w-6 h-6 rounded-full bg-linear-to-b from-slate-200 via-slate-300 to-slate-400 border border-slate-100 shadow-sm shadow-slate-400/40 flex items-center justify-center text-slate-800 font-black text-xs">
          2
        </div>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="relative flex flex-col items-center justify-center shrink-0 w-8 h-8">
        {/* Striped Ribbon */}
        <div className="absolute -top-1 flex gap-0.5 z-0">
          <div className="w-1.5 h-3 bg-red-500 -rotate-12 rounded-xs" />
          <div className="w-1.5 h-3 bg-blue-500 rotate-12 rounded-xs" />
        </div>
        {/* Bronze Medal */}
        <div className="relative z-10 w-6 h-6 rounded-full bg-linear-to-b from-amber-600 via-amber-700 to-amber-800 border border-amber-500/80 shadow-sm shadow-amber-700/40 flex items-center justify-center text-amber-100 font-black text-xs">
          3
        </div>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 flex items-center justify-center text-muted font-bold text-xs shrink-0">
      #{rank}
    </div>
  );
}

/**
 * 🏆 Simple & Clean Obsidian Dark Leaderboard Card
 * Matches user's reference with clean row dividers, medals, avatars, scores, and monthly reset countdown.
 */
export default function LeaderboardCard({
  leaderboard = [],
  dashboardLoading = false,
}) {
  // Calculate dynamic countdown to end of current month
  const timeLeftInMonth = useMemo(() => {
    const now = new Date();
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );
    const diffMs = endOfMonth - now;

    if (diffMs <= 0) return "1d 0h";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  }, []);

  // Display top 5
  const topEntries = leaderboard.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 bg-surface border border-main rounded-3xl shadow-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-main/50">
        <h2 className="text-base font-bold text-main flex items-center gap-2">
          <Trophy className="w-5 h-5 text-main" />
          Leaderboard
        </h2>
        <span className="text-xs font-semibold text-muted bg-elevated px-2 py-0.5 rounded-full border border-main">
          Top {topEntries.length || 5}
        </span>
      </div>

      {/* Body List */}
      <div className="divide-y divide-main/40">
        {dashboardLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 px-1 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-elevated" />
                <div className="w-8 h-8 rounded-full bg-elevated" />
                <div className="w-24 h-4 rounded bg-elevated" />
              </div>
              <div className="w-8 h-4 rounded bg-elevated" />
            </div>
          ))
        ) : topEntries.length > 0 ? (
          topEntries.map((entry) => {
            const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
              entry.name
            )}`;

            return (
              <div
                key={entry.rank}
                className={`flex items-center justify-between py-2.5 px-2 rounded-xl transition-colors ${
                  entry.isMe
                    ? "bg-cyan-500/10 border-l-2 border-cyan-400 pl-2.5"
                    : "hover:bg-elevated/40"
                }`}
              >
                {/* Left: Medal + Avatar + Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <RankMedal rank={entry.rank} />

                  {/* Character Avatar */}
                  <div className="w-8 h-8 rounded-full bg-elevated border border-main overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={avatarUrl}
                      alt={entry.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>

                  {/* Student Name */}
                  <div className="min-w-0 truncate">
                    <span className="font-semibold text-xs sm:text-sm text-main truncate block">
                      {entry.name}
                      {entry.isMe && (
                        <span className="text-2xs text-cyan-400 font-bold ml-1.5">
                          (You)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Right: Score */}
                <div className="text-right shrink-0 pl-3">
                  <span className="font-bold text-sm sm:text-base text-main">
                    {Math.round(entry.averageScore)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-muted">
            <Star className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" />
            <p className="text-xs">No leaderboard entries yet</p>
          </div>
        )}
      </div>

      {/* Footer: Reset Monthly & Countdown */}
      <div className="mt-3 pt-2.5 border-t border-main/50 flex items-center justify-between text-xs text-muted select-none">
        <span className="text-muted/80 text-2xs">Resets monthly</span>
        <span className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
          <Hourglass className="w-3.5 h-3.5" />
          <span>{timeLeftInMonth}</span>
        </span>
      </div>
    </motion.div>
  );
}
