import { useEffect } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  RefreshCcw,
  Home,
  CheckCircle2,
  XCircle,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAttemptQuizStore from "../../../../../store/useAttemptQuizStore";
import Loader from "../../../../../components/Loader";
import { exitFullScreen } from "../../components/enterFullScreen";

export const ResultCard = () => {
  const navigate = useNavigate();
  const { loadPersistedQuizResult, clearQuizSession, quizResults, warningCount, loading } = useAttemptQuizStore();

  console.log("Quiz Results Data:", quizResults);

  useEffect(() => {
    exitFullScreen();

    if (!quizResults) {
      loadPersistedQuizResult();
    }
  }, [loadPersistedQuizResult, quizResults]);

  // 1. If the store is still processing the network transaction, show a clean loader
  if (loading) {
    return (
     <Loader/>
    );
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
        <div className={`p-10 text-center bg-elevated`}
             style={{ borderBottom: '1px solid var(--color-border-soft)'}}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <Icon className="w-20 h-20 text-accent" style={{color:'var(--color-brand-mid)'}} />
          </motion.div>
          <h1 className={`text-3xl font-black uppercase tracking-tight mb-2 text-main`}>
            {feedback.message}
          </h1>
          <p className="text-muted font-medium">Official Examination Results Portfolio</p>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border border-soft bg-surface flex flex-col items-center">
              <span className="text-3xl font-black text-main">{score}/{totalQuestions}</span>
              <span className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Total Score</span>
            </div>
            <div className="p-6 rounded-2xl border border-soft bg-surface flex flex-col items-center">
              <span className="text-3xl font-black text-main">{percentage}%</span>
              <span className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Percentage</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-muted uppercase tracking-widest px-1">
              Session Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" style={{color:'var(--color-brand-mid)'}} />
                    <span className="text-muted font-semibold">Correct Answers</span>
                  </div>
                  <span className="text-main font-bold">{score}</span>
              </div>
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-accent" style={{color:'var(--color-brand-mid)'}} />
                    <span className="text-muted font-semibold">Incorrect / Skipped</span>
                  </div>
                  <span className="text-main font-bold">{totalQuestions - score}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent" style={{color:'var(--color-brand-mid)'}} />
                    <span className="text-muted font-semibold">Security Infractions</span>
                  </div>
                  <span className={`font-bold ${warningCount > 0 ? 'text-accent' : 'text-accent'}`}>{warningCount || 0} Flags</span>
                </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => handleCleanExit("/student/quizzes")}
              className="flex-1 bg-accent hover:opacity-95 text-white py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold group"
            >
              <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" /> Retake Another Exam
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
