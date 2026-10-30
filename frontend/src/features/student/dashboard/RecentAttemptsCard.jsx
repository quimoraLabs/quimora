import React, { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  History,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Eye,
  Award,
  Sparkles,
  BookOpen,
} from "lucide-react";
import ResultModal from "../quiz/ResultModal";

/**
 * 📊 Recent Attempts Table Card
 * Modern competitive platform table with complete headers, status indicators, and analysis drawer.
 */
const RecentAttemptsCard = ({ dashboardLoading, recentAttempts = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const openReport = (attempt) => {
    setSelectedAttempt(attempt);
    setIsModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-7 bg-surface border border-main rounded-3xl shadow-card relative overflow-hidden"
    >
      {/* Background Accent Glow */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-52 h-52 bg-cyan-500/5 rounded-full blur-3xl" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-2xs font-bold uppercase tracking-wider mb-1.5 border border-cyan-500/20">
            <History className="w-3 h-3" />
            Attempt History
          </div>
          <h2 className="text-xl font-bold text-main tracking-tight">
            Recent Quiz Attempts
          </h2>
          <p className="text-xs text-muted">
            Track performance, accuracy scores, and review detailed question breakdowns.
          </p>
        </div>

        <Link
          to="/student/my-attempts"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-elevated hover:bg-main border border-main hover:border-cyan-500/30 rounded-xl text-xs font-semibold text-muted hover:text-cyan-400 transition-all shadow-xs self-start sm:self-auto group"
        >
          <span>View All Attempts</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-155">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-main text-2xs font-bold text-muted uppercase tracking-wider bg-main/40">
              <th className="py-3 px-4 rounded-l-xl">Quiz & Domain</th>
              <th className="py-3 px-4">Date Completed</th>
              <th className="py-3 px-4">Score / Accuracy</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-main/40 text-xs">
            {dashboardLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-44 bg-slate-800 rounded mb-1.5" />
                    <div className="h-2.5 w-24 bg-slate-800/60 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-3.5 w-24 bg-slate-800 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-3.5 w-16 bg-slate-800 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-20 bg-slate-800 rounded-full" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-7 w-20 bg-slate-800 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))
            ) : recentAttempts.length > 0 ? (
              recentAttempts.map((attempt, index) => {
                const score = attempt.score ?? 0;
                const isPassed = score >= 50;

                return (
                  <tr
                    key={attempt.id ?? index}
                    className="group hover:bg-elevated/50 transition-colors"
                  >
                    {/* Quiz & Domain */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400 group-hover:scale-105 transition-transform">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-main group-hover:text-cyan-400 transition-colors truncate max-w-60">
                            {attempt.quizTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {attempt.tags && attempt.tags.length > 0 ? (
                              <span className="text-2xs text-muted truncate">
                                {attempt.tags.slice(0, 2).join(" • ")}
                              </span>
                            ) : (
                              <span className="text-2xs text-muted">
                                Practice Track
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date Completed */}
                    <td className="py-4 px-4 text-muted whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted/70" />
                        <span>
                          {new Date(attempt.completedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Score / Accuracy */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-sm ${
                            score >= 70
                              ? "text-emerald-400"
                              : score >= 50
                              ? "text-cyan-400"
                              : "text-amber-400"
                          }`}
                        >
                          {score}%
                        </span>
                        <div className="w-16 h-1.5 bg-main rounded-full overflow-hidden hidden sm:block border border-main">
                          <div
                            className={`h-full rounded-full ${
                              score >= 70
                                ? "bg-emerald-500"
                                : score >= 50
                                ? "bg-cyan-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, score)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold border ${
                          isPassed
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {attempt.status === "completed"
                          ? isPassed
                            ? "Passed"
                            : "Completed"
                          : attempt.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openReport(attempt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-elevated hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 border border-main hover:border-cyan-500/30 text-xs font-semibold transition-all shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-elevated border border-main flex items-center justify-center mx-auto text-muted">
                      <History className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-main">
                        No quiz attempts recorded yet
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Take your first topic quiz to begin generating accuracy logs & ratings!
                      </p>
                    </div>
                    <Link
                      to="/student/quizzes"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white font-semibold text-xs rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Browse Practice Quizzes</span>
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Result Modal */}
      {isModalOpen && selectedAttempt && (
        <ResultModal
          selectedAttempt={selectedAttempt}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default RecentAttemptsCard;
