import { useEffect } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  RefreshCcw,
  Home,
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useStudentQuizStore from "../exam/store/useStudentQuizStore";
import Loader from "../../components/common/Loader";
import { exitFullScreen } from "../exam/hooks/enterFullScreen";

export const SingleAttemptResultCard = () => {
  const navigate = useNavigate();
  const {
    loadPersistedQuizResult,
    clearQuizSession,
    quizResults,
    warningCount,
    loading,
  } = useStudentQuizStore();

  console.log("Quiz Results Data:", quizResults);

  useEffect(() => {
    exitFullScreen();

    if (!quizResults) {
      loadPersistedQuizResult();
    }
  }, [loadPersistedQuizResult, quizResults]);

  // 1. If the store is still processing the network transaction, show a clean loader
  if (loading) {
    return <Loader />;
  }

  // 2. CRITICAL DEEP GUARD: Fallback checks matching your exact API response structure
  if (!quizResults) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-main text-main p-6">
        <p className="mb-4 font-semibold text-lg">
          No assessment records found for this view session.
        </p>
        <button
          onClick={() => navigate("/student/quizzes")}
          className="px-6 py-3 bg-accent text-white rounded-xl font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // 3. Exact Key Matching with your API JSON structure:
  // your backend returns: totalQuestions, correctAnswersCount, score, timeTakenInSeconds, status
  const score =
    quizResults.correctAnswersCount !== undefined
      ? quizResults.correctAnswersCount
      : 0;
  const totalQuestions = quizResults.totalQuestions || 0;
  const percentage =
    quizResults.score !== undefined ? Math.round(quizResults.score) : 0;

  const getFeedback = () => {
    if (percentage >= 80)
      return {
        message: "Exceptional Performance",
        icon: Award,
        tone: "high",
      };
    if (percentage >= 50)
      return {
        message: "Successfully Passed",
        icon: Trophy,
        tone: "mid",
      };
    return {
      message: "Needs Improvement",
      icon: Award,
      tone: "low",
    };
  };

  const feedback = getFeedback();
  const Icon = feedback.icon;

  // 4. RESET ONLY ON DEPARTURE: Clean up state right when clicking the action buttons
  const handleCleanExit = (targetRoute) => {
    clearQuizSession();
    navigate(targetRoute);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-main text-main">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-surface rounded-3xl shadow-card border border-soft overflow-hidden"
      >
        <div
          className={`p-10 text-center bg-elevated`}
          style={{ borderBottom: "1px solid var(--color-border-soft)" }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <Icon
              className="w-20 h-20 text-accent"
              style={{ color: "var(--color-brand-mid)" }}
            />
          </motion.div>
          <h1
            className={`text-3xl font-black uppercase tracking-tight mb-2 text-main`}
          >
            {feedback.message}
          </h1>
          <p className="text-muted font-medium">
            Official Examination Results Portfolio
          </p>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border border-soft bg-surface flex flex-col items-center">
              <span className="text-3xl font-black text-main">
                {score}/{totalQuestions}
              </span>
              <span className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
                Total Score
              </span>
            </div>
            <div className="p-6 rounded-2xl border border-soft bg-surface flex flex-col items-center">
              <span className="text-3xl font-black text-main">
                {percentage}%
              </span>
              <span className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
                Percentage
              </span>
            </div>
          </div>

          {/* Experience Points & Student Rank Calibration Card */}
          {quizResults?.eloChange && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                quizResults.eloChange.isDemoted
                  ? "border-red-500/40 bg-red-500/10 dark:bg-red-950/20"
                  : quizResults.eloChange.delta >= 0
                  ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : "border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {quizResults.eloChange.delta >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="text-xs font-bold text-main">
                    Experience Points & Student Rank
                  </span>
                </div>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    quizResults.eloChange.delta >= 0
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-red-500/20 text-red-700 dark:text-red-300"
                  }`}
                >
                  {quizResults.eloChange.delta >= 0
                    ? `+${quizResults.eloChange.delta}`
                    : quizResults.eloChange.delta}{" "}
                  Elo Points
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted">
                  Elo Rating:{" "}
                  <strong className="text-main">
                    {quizResults.eloChange.studentEloBefore}
                  </strong>{" "}
                  &rarr;{" "}
                  <strong className="text-main">
                    {quizResults.eloChange.studentEloAfter}
                  </strong>
                </span>
                <span className="font-extrabold text-main">
                  Tier:{" "}
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {quizResults.eloChange.newTier}
                  </span>
                </span>
              </div>

              {quizResults.eloChange.isDemoted && (
                <div className="mt-2.5 p-2 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-xs text-red-700 dark:text-red-300 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>
                    Rank Demoted from {quizResults.eloChange.oldTier} to{" "}
                    {quizResults.eloChange.newTier} due to poor performance on
                    this challenge.
                  </span>
                </div>
              )}

              {quizResults.eloChange.isPromoted && (
                <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Congratulations! You leveled up to{" "}
                    {quizResults.eloChange.newTier} rank!
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted uppercase tracking-widest px-1">
              Session Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="w-4 h-4 text-accent"
                    style={{ color: "var(--color-brand-mid)" }}
                  />
                  <span className="text-muted font-semibold">
                    Correct Answers
                  </span>
                </div>
                <span className="text-main font-bold">{score}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                <div className="flex items-center gap-2">
                  <XCircle
                    className="w-4 h-4 text-accent"
                    style={{ color: "var(--color-brand-mid)" }}
                  />
                  <span className="text-muted font-semibold">
                    Incorrect / Skipped
                  </span>
                </div>
                <span className="text-main font-bold">
                  {totalQuestions - score}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                <div className="flex items-center gap-2">
                  <Award
                    className="w-4 h-4 text-accent"
                    style={{ color: "var(--color-brand-mid)" }}
                  />
                  <span className="text-muted font-semibold">
                    Security Infractions
                  </span>
                </div>
                <span
                  className={`font-bold ${warningCount > 0 ? "text-accent" : "text-accent"}`}
                >
                  {warningCount || 0} Flags
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => handleCleanExit("/student/quizzes")}
              className="flex-1 bg-accent hover:opacity-95 text-white py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold group"
            >
              <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />{" "}
              Retake Another Exam
            </button>
            <button
              onClick={() => handleCleanExit("/student/quizzes")}
              className="flex-1 bg-surface hover:bg-elevated text-main py-4 px-6 rounded-2xl border border-soft flex items-center justify-center gap-2 transition-all font-bold"
            >
              <Home className="w-5 h-5" /> Exit to Desk
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
