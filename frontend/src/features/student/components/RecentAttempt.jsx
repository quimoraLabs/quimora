import React from 'react'
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import ResultModal from "./ResultModal";
const RecentAttempt = ({ dashboardLoading, recentAttempts }) => {
    const [isMOdalOpen, setIsModalOpen] = React.useState(false);
    const [selectedAttempt, setSelectedAttempt] = React.useState(null);

    console.log("Recent Attempts:", selectedAttempt);

    const openReport = (attempt) => {
      setSelectedAttempt(attempt);
      setIsModalOpen(true);
    };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-bg-surface border border-border-main rounded-3xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-text-main tracking-tight">
            Recent Attempts
          </h2>
          <p className="text-sm text-text-secondary">
            Your latest completed tests, sorted by date.
          </p>
        </div>
        <Link to="/student/my-attempts" className="px-3 py-1 bg-bg-main border border-border-main rounded-lg text-[10px] uppercase tracking-widest font-bold text-text-secondary hover:text-text-main transition-colors">
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {dashboardLoading ? (
          <div className="rounded-3xl border border-border-main bg-bg-surface p-8 text-center text-text-secondary">
            Loading dashboard data...
          </div>
        ) : recentAttempts.length > 0 ? (
          recentAttempts.map((attempt, index) => (
            <div
              key={attempt.id ?? index}
              className="grid grid-cols-12 items-center gap-4 p-4 rounded-3xl bg-bg-surface border border-border-main"
            >
              <div className="col-span-5">
                <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
                  {attempt.quizTitle}
                </p>
                <p className="mt-1 text-sm font-semibold text-text-main">
                  {attempt.score}%
                </p>
              </div>
              <div className="col-span-3 text-sm text-text-secondary">
                {new Date(attempt.completedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="col-span-2 text-sm text-text-secondary">
                {attempt.status}
              </div>
              <div className="col-span-2 text-right">
                <button
                  onClick={() => openReport(attempt)}
                  className="text-xs uppercase tracking-[0.24em] text-sky-400 hover:text-sky-300"
                >
                  Details
                </button>
              </div>
              {
                isMOdalOpen && <ResultModal selectedAttempt={selectedAttempt} closeModal={() => setIsModalOpen(false)} />
              }
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-border-main bg-bg-surface p-8 text-center text-text-secondary">
            No recent attempts available.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentAttempt;
