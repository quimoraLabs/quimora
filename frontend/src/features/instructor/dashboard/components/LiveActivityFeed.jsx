import { motion } from "motion/react";
import { Clock, CheckCircle2 } from "lucide-react";
import { formatRelativeTime } from "../utils/formatRelativeTime";

const LiveActivityFeed = ({ liveActivities = [] }) => {
  return (
    <div className="bg-surface backdrop-blur-xl border border-main rounded-2xl p-4 sm:p-6 shadow-card relative overflow-hidden transition-colors duration-300 w-full">
      {/* Ambient background glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 className="font-display text-base sm:text-lg font-bold text-main tracking-tight">
            Live Student Activity
          </h3>
        </div>
        <span className="text-[10px] text-muted bg-elevated px-2.5 py-0.5 rounded-full border border-main font-medium">
          Realtime
        </span>
      </div>

      {/* Activity List Container */}
      <div className="space-y-3 relative z-10 max-h-105 overflow-y-auto pr-1 custom-scrollbar">
        {liveActivities.length === 0 ? (
          <p className="text-xs text-muted text-center py-8">
            No active students at the moment.
          </p>
        ) : (
          liveActivities.map((act, i) => {
            const studentName = act.studentName || "Anonymous Student";
            const quizTitle = act.quizTitle || "Untitled Quiz";
            const initial = studentName.charAt(0).toUpperCase();

            return (
              <motion.div
                key={act.id || act._id || i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="group flex items-center gap-3 p-3 rounded-xl bg-elevated/50 hover:bg-elevated border border-main hover:border-soft transition-all duration-200 shadow-sm min-w-0"
              >
                {/* Avatar Badge */}
                <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  {initial}
                </div>

                {/* Main Details Wrapper */}
                <div className="flex-1 min-w-0 text-xs">
                  {/* Activity Message with CSS Ellipsis */}
                  <div className="text-main leading-tight font-sans line-clamp-1">
                    <span className="font-semibold text-main">
                      {studentName}
                    </span>{" "}
                    <span className="text-muted">
                      {act.status || "activity in"}
                    </span>{" "}
                    <span className="text-accent font-medium">{quizTitle}</span>
                  </div>

                  {/* Metadata Bar (Score & Timestamp) */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-0.5 min-w-0">
                    {act.score !== null && act.score !== undefined ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-muted text-[11px]">Score:</span>
                        <span className="text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                          {act.score}%
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className="text-[10px] text-muted flex items-center gap-1 shrink-0 ml-auto">
                      <Clock className="w-3 h-3 text-muted" />
                      <span>
                        {formatRelativeTime(act.timestamp) || "Recent"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LiveActivityFeed;
