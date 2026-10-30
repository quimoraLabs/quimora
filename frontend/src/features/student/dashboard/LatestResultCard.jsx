import React from "react";
import { motion } from "motion/react";
import { Trophy, CheckCircle2, Clock, Calendar, Sparkles } from "lucide-react";

/**
 * 🏆 Latest Result Highlight Card
 */
const LatestResultCard = ({ latestResult, dashboardStats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-surface border border-main rounded-3xl shadow-card"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-main flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Latest Result
          </h2>
          <p className="text-xs text-muted">
            Your most recently completed quiz
          </p>
        </div>
        <div className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-400">
          Rank #{dashboardStats?.currentRank ?? 1}
        </div>
      </div>

      {latestResult ? (
        <div className="space-y-4">
          <div className="p-3.5 bg-elevated/60 border border-main rounded-2xl">
            <p className="text-2xs font-bold uppercase tracking-wider text-muted">
              Quiz Title
            </p>
            <p className="text-sm font-bold text-main mt-1 line-clamp-2">
              {latestResult.quizTitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-elevated/60 p-3.5 border border-main">
              <p className="text-2xs font-bold uppercase tracking-wider text-muted">
                Score
              </p>
              <p className="mt-1 text-2xl font-extrabold text-cyan-400">
                {latestResult.score}%
              </p>
            </div>
            <div className="rounded-2xl bg-elevated/60 p-3.5 border border-main">
              <p className="text-2xs font-bold uppercase tracking-wider text-muted">
                Correct
              </p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400">
                {latestResult.correctAnswersCount}/{latestResult.totalQuestions}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted px-1 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(latestResult.completedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-2xs font-bold">
              {latestResult.status?.toUpperCase() || "COMPLETED"}
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-main bg-elevated/40 p-6 text-center text-muted">
          <p className="text-xs">No completed quiz result yet.</p>
        </div>
      )}
    </motion.div>
  );
};

export default LatestResultCard;
