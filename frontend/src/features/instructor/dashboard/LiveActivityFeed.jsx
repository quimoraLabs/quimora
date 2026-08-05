import { motion } from "framer-motion";
import { Clock, CheckCircle2 } from "lucide-react";
import { formatRelativeTime } from "./hook/formatRelativeTime";

const LiveActivityFeed = ({ liveActivities = [] }) => {
  return (
    <div className="bg-surface backdrop-blur-xl border border-main rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-colors duration-300">
      {/* Glow effect */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-main/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <h3 className="font-display text-lg font-bold text-main tracking-tight">
            Live Student Activity
          </h3>
        </div>
        <span className="text-[10px] text-muted bg-elevated px-2 py-0.5 rounded-full border border-main font-medium">
          Realtime
        </span>
      </div>

      <div className="space-y-3 relative z-10">
        {liveActivities.length === 0 ? (
          <p className="text-xs text-muted text-center py-6">
            No active students at the moment.
          </p>
        ) : (
          liveActivities.map((act, i) => (
            <motion.div
              key={act.id || i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.015, x: 2 }}
              className="group flex items-start gap-3.5 p-3.5 rounded-xl bg-elevated/40 hover:bg-elevated border border-main hover:border-soft transition-all duration-200 shadow-sm"
            >
              {/* Avatar Initial */}
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md group-hover:scale-105 transition-transform">
                {act.studentName?.charAt(0).toUpperCase() || "S"}
              </div>

              <div className="flex-1 text-xs">
                <p className="text-main leading-relaxed truncate">
                  <span className="font-semibold text-main transition-colors">
                    {act.studentName || "Anonymous Student"}
                  </span>{" "}
                  <span className="text-muted">{act.status}</span>{" "}
                  <span className="text-accent font-medium">
                    {act.quizTitle.slice(0, 20)+"..."}
                  </span>
                </p>
              <div className="flex items-center justify-between">

                {act.score !== null && act.score !== undefined && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-400">Score:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                      {act.score}%
                    </span>
                  </div>
                )}

                <div className="text-[10px] text-muted flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3 text-text-muted" />
                  <span>{formatRelativeTime(act.timestamp) || "Recent"}</span>
                </div>
              </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveActivityFeed;
