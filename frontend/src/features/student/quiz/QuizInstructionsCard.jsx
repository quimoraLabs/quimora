import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  AlertCircle,
  Play,
  X,
  Clock,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import useStudentQuizStore from "../exam/store/useStudentQuizStore";
import { enterFullScreen, exitFullScreen } from "../exam/hooks/enterFullScreen";
import axiosClient from "../../../api/axiosClient";

export const QuizInstructionsCard = () => {
  const [assignedInstructor, setAssignedInstructor] = useState(null);
  const [selectedQuestionLimit, setSelectedQuestionLimit] = useState(null);
  const rules = [
    "Do not switch tabs or windows during the test. Doing so will be flagged.",
    "Multiple tab switches will result in automatic submission.",
    "Keyboard shortcuts (Ctrl+C, Ctrl+V, etc.) are strictly disabled.",
    "The test is timed. Ensure you submit before the countdown ends.",
    "Questions are presented one by one. You can skip and return later.",
  ];

  const navigate = useNavigate();
  const location = useLocation();

  const { startAttempt, loading } = useStudentQuizStore();

  const quizId = location.state?.quizId;
  const quizTitle = location.state?.title || "Assessment";
  const quizDuration = location.state?.timeLimit || 10;
  const totalQuestions = location.state?.totalQuestions || 0;

  // Determine available options for session question limit
  const questionOptions = useMemo(() => {
    if (!totalQuestions || totalQuestions <= 5) return [];
    const opts = [];
    if (totalQuestions >= 10) opts.push(10);
    if (totalQuestions >= 15) opts.push(15);
    if (totalQuestions >= 20) opts.push(20);
    if (!opts.includes(totalQuestions)) {
      opts.push(totalQuestions);
    }
    return opts;
  }, [totalQuestions]);

  const effectiveQuestionsCount = selectedQuestionLimit || totalQuestions;
  const effectiveTimeLimit = selectedQuestionLimit
    ? Math.max(5, Math.ceil(selectedQuestionLimit * 1))
    : quizDuration;

  useEffect(() => {
    if (!quizId) return;
    const fetchInstructor = async () => {
      try {
        const res = await axiosClient.get(`/quizzes/${quizId}/assigned-instructor`);
        if (res.data?.success && res.data?.data) {
          setAssignedInstructor(res.data.data);
        }
      } catch (err) {
        console.error("Could not fetch assigned instructor:", err);
      }
    };
    fetchInstructor();
  }, [quizId]);

  const handleGoBack = () => {
    exitFullScreen();
    navigate("/student/quizzes");
  };

  const handleStartQuizClick = async () => {
    if (!quizId) {
      toast.error("Quiz metadata is missing!");
      return;
    }
    try {
      enterFullScreen();
      await startAttempt(quizId, navigate, {
        questionLimit: selectedQuestionLimit || undefined,
      });
    } catch (error) {
      console.error("Initialization Failed: ", error);
      exitFullScreen();
      toast.error(
        "Security validation failed. Please check browser permissions.",
      );
    }
  };

  return (
    // FIX: Outer screen background use bg-main instead of bg-surface for nice depth
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-surface rounded-2xl shadow-xl border border-main p-8 md:p-12"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-brand-mid/10 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-brand-mid" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-main leading-tight">
              {quizTitle}
            </h1>
            <p className="text-muted font-medium">
              Secure Assessment System v2.0
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          {/* FIX 1: Amber Alert box handled for both light & dark modes nicely */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300 italic">
              By clicking 'Enter Examination Hall', you consent to full-screen
              monitoring and proctoring protocols.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-main flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-mid" /> Examination Rules
            </h2>
            <ul className="space-y-3">
              {rules.map((rule, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-start gap-3"
                >
                  {/* FIX 2: List Number circle colors adapted to theme tokens */}
                  <span className="shrink-0 w-6 h-6 rounded-full bg-main text-muted text-xs flex items-center justify-center font-bold border border-main">
                    {idx + 1}
                  </span>
                  <span className="text-muted">{rule}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Question Limiter / Session Length Selector */}
          {questionOptions.length > 1 && (
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-main">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Choose Session Length</span>
                </div>
                <span className="text-xs font-semibold text-muted">
                  Bank: {totalQuestions} Questions
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {questionOptions.map((opt) => {
                  const isSelected =
                    selectedQuestionLimit === opt ||
                    (!selectedQuestionLimit && opt === totalQuestions);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedQuestionLimit(opt === totalQuestions ? null : opt)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
                          : "bg-surface border border-main text-muted hover:border-indigo-400"
                      }`}
                    >
                      {opt === totalQuestions ? `All Questions (${totalQuestions})` : `${opt} Questions`}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted">
                Select how many questions you want to solve in this attempt. Duration adapts proportionally (~1 min/question).
              </p>
            </div>
          )}

          {/* Central Stats Box with live calibrated counts */}
          <div className="flex items-center gap-6 mt-4 p-4 bg-main rounded-xl shadow shadow-bg-main/20">
            <div className="flex flex-col items-center gap-1 flex-1">
              <Clock className="w-5 h-5 text-muted" />
              <span className="text-xs text-muted uppercase tracking-wider font-bold">
                Duration
              </span>
              <span className="text-lg font-semibold text-main">
                {effectiveTimeLimit} Minutes
              </span>
            </div>
            {/* Divider border token adapted */}
            <div className="w-px h-10 bg-border-main shadow-inner" />
            <div className="flex flex-col items-center gap-1 flex-1">
              <FileText className="w-5 h-5 text-muted" />
              <span className="text-xs text-muted uppercase tracking-wider font-bold">
                Questions
              </span>
              <span className="text-lg font-semibold text-main">
                {effectiveQuestionsCount} Items
              </span>
            </div>
          </div>

          {/* Verified Instructor Badge */}
          {assignedInstructor && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {assignedInstructor.name ? assignedInstructor.name.charAt(0).toUpperCase() : "Q"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-main">{assignedInstructor.name}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified Instructor
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    Assessment Evaluator &bull; {assignedInstructor.department || "Engineering"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-main text-muted border border-main hidden sm:inline-block">
                Verified Quiz
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleStartQuizClick}
            className="flex-1 bg-brand-mid hover:bg-brand-primary text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-mid/10 cursor-pointer"
          >
            <Play className="w-5 h-5 animate-pulse" />{" "}
            {loading ? "Initializing..." : "Enter Examination Hall"}
          </button>
          <button
            onClick={handleGoBack}
            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 font-semibold py-4 px-6 rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <X className="w-5 h-5" /> Cancel Attempt
          </button>
        </div>
      </motion.div>
    </div>
  );
};
