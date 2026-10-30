import React from "react";

/**
 * 🏅 Single Leaderboard Row Item
 */
const LeaderboardItem = ({ entry }) => {
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
    entry.name
  )}`;

  return (
    <div
      className={`flex items-center justify-between py-2.5 px-2 rounded-xl transition-colors ${
        entry.isMe
          ? "bg-cyan-500/10 border-l-2 border-cyan-400 pl-2.5"
          : "hover:bg-elevated/40"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          {entry.rank === 1 ? (
            <div className="w-6 h-6 rounded-full bg-linear-to-b from-amber-300 to-yellow-500 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
              1
            </div>
          ) : entry.rank === 2 ? (
            <div className="w-6 h-6 rounded-full bg-linear-to-b from-slate-200 to-slate-400 text-slate-800 font-black text-xs flex items-center justify-center shadow-xs">
              2
            </div>
          ) : entry.rank === 3 ? (
            <div className="w-6 h-6 rounded-full bg-linear-to-b from-amber-600 to-amber-800 text-amber-100 font-black text-xs flex items-center justify-center shadow-xs">
              3
            </div>
          ) : (
            <span className="text-muted font-bold text-xs">#{entry.rank}</span>
          )}
        </div>

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

      <div className="text-right shrink-0 pl-3">
        <span className="font-bold text-sm sm:text-base text-main">
          {Math.round(entry.averageScore)}
        </span>
      </div>
    </div>
  );
};

export default LeaderboardItem;
