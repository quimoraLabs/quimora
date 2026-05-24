// import React from 'react'

const Leaderboard = ({ entry }) => {
  return (
    <div
    //   key={entry.rank}
      className={`flex items-center justify-between gap-3 rounded-3xl border border-border-main bg-bg-surface p-4 ${entry.isMe ? "border-sky-500 bg-sky-500/10" : ""}`}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">
          #{entry.rank}
        </p>
        <p className="mt-1 text-sm font-semibold text-text-main">
          {entry.name}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-text-main">
          {entry.averageScore}%
        </p>
        <p className="text-[11px] text-text-secondary">
          {entry.totalTests} tests
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
