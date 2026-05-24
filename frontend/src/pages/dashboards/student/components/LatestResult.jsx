// import React from 'react'
import { motion } from "motion/react";
const LatestResult = ({ latestResult, dashboardStats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 bg-bg-surface border border-border-main rounded-3xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-text-main">Latest Result</h2>
          <p className="text-sm text-text-secondary">
            Your most recent completed quiz.
          </p>
        </div>
        <div className="rounded-3xl bg-bg-main px-3 py-2 text-xs uppercase tracking-[0.3em] text-sky-400">
          Rank {dashboardStats?.currentRank ?? "N/A"}
        </div>
      </div>

      {latestResult ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Quiz</p>
            <p className="text-lg font-semibold text-text-main">
              {latestResult.quizTitle}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-bg-surface p-4 border border-border-main">
              <p className="text-[10px] uppercase tracking-[0.26em] text-text-secondary">
                Score
              </p>
              <p className="mt-2 text-3xl font-bold text-text-main">
                {latestResult.score}%
              </p>
            </div>
            <div className="rounded-3xl bg-bg-surface p-4 border border-border-main">
              <p className="text-[10px] uppercase tracking-[0.26em] text-text-secondary">
                Correct
              </p>
              <p className="mt-2 text-3xl font-bold text-text-main">
                {latestResult.correctAnswersCount}/{latestResult.totalQuestions}
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-bg-surface p-4 border border-border-main">
            <p className="text-[10px] uppercase tracking-[0.26em] text-text-secondary">
              Completed
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              {new Date(latestResult.completedAt).toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-border-main bg-bg-surface p-8 text-center text-text-secondary">
          No completed quiz result yet.
        </div>
      )}
    </motion.div>
  );
};

export default LatestResult;
