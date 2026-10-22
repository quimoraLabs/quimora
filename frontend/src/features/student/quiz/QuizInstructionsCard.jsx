import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Play,
  X,
  Clock,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  Award,
  Sparkles,
  Target,
  Zap,
  Flame,
  Layers,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import useStudentQuizStore from "../exam/store/useStudentQuizStore";
import { enterFullScreen, exitFullScreen } from "../exam/hooks/enterFullScreen";
import axiosClient from "../../../api/axiosClient";

const ALLOWED_OPTIONS = [10, 20, 25, 30, 40, 50];

const DIFFICULTY_LEVELS = [
  {
    id: "beginner",
    label: "Beginner",
    tag: "Foundations",
    icon: Sparkles,
    color: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    activeClass: "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    tag: "Application",
    icon: Target,
    color: "from-blue-500 to-indigo-600",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    activeClass: "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-500",
  },
  {
    id: "hard",
    label: "Hard",
    tag: "Advanced",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    activeClass: "bg-amber-600 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-500",
  },
  {
    id: "expert",
    label: "Expert",
    tag: "Mastery",
    icon: Flame,
    color: "from-rose-500 to-red-600",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    activeClass: "bg-rose-600 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-500",
  },
  {
    id: "mixed",
    label: "Mixed",
    tag: "All Levels",
    icon: Layers,
    color: "from-purple-500 to-fuchsia-600",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    activeClass: "bg-purple-600 text-white shadow-md shadow-purple-500/30 ring-2 ring-purple-500",
  },
];

export const QuizInstructionsCard = () => {
  const [assignedInstructor, setAssignedInstructor] = useState(null);
  const [selectedQuestionLimit, setSelectedQuestionLimit] = useState(50);
  const [selectedDifficulty, setSelectedDifficulty] = useState("beginner");
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
  const quizDuration = location.state?.timeLimit || 50;
  const totalQuestions = location.state?.totalQuestions || 50;

  // Options restricted strictly to [10, 20, 25, 30, 40, 50]
  const questionOptions = useMemo(() => {
    if (!totalQuestions) return ALLOWED_OPTIONS;
    const opts = ALLOWED_OPTIONS.filter((n) => n <= totalQuestions);
    if (opts.length === 0) return [totalQuestions];
    return opts;
  }, [totalQuestions]);

  // Default to 50 if available, or closest available option
  useEffect(() => {
    if (totalQuestions >= 50) {
      setSelectedQuestionLimit(50);
    } else if (totalQuestions > 0) {
      const viable = ALLOWED_OPTIONS.filter((n) => n <= totalQuestions);
      setSelectedQuestionLimit(viable.length > 0 ? viable[viable.length - 1] : totalQuestions);
    }
  }, [totalQuestions]);

  const effectiveQuestionsCount = selectedQuestionLimit || 50;
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
        questionLimit: selectedQuestionLimit || 50,
        difficulty: selectedDifficulty || "beginner",
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex items-center justify-center p-3 sm:p-4 md:p-6 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-main p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6"
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-main">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-mid/10 text-brand-mid rounded-2xl border border-brand-mid/20 shrink-0">
              <ShieldCheck className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-main leading-tight">
                  {quizTitle}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Bank: {totalQuestions} Qs
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted font-medium mt-0.5">
                Secure Assessment &bull; Proctoring System v2.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Award className="w-3.5 h-3.5 text-emerald-500" /> Pass: 50%+
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Body: Zero-Scroll Widescreen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Rules, Alert, Instructor (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Amber Proctoring Notice */}
            <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                By entering the hall, you consent to automated full-screen monitoring. Switching tabs or window defocus will trigger auto-submission.
              </p>
            </div>

            {/* Rules */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-main/40 border border-main">
              <h2 className="text-sm font-bold text-main flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-mid" /> Examination Guidelines
              </h2>
              <ul className="space-y-2">
                {rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-muted leading-relaxed">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-main text-main text-[11px] flex items-center justify-center font-bold border border-main">
                      {idx + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verified Instructor Badge */}
            {assignedInstructor && (
              <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {assignedInstructor.name ? assignedInstructor.name.charAt(0).toUpperCase() : "Q"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-main">{assignedInstructor.name}</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-muted">
                      Evaluator &bull; {assignedInstructor.department || "Engineering"}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-main text-muted border border-main">
                  Academic Certified
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Difficulty Selector, Session Length, Stats & Warning (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Difficulty Level Selector (5 Options: Beginner, Intermediate, Hard, Expert, Mixed) */}
            <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-main">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Choose Difficulty Level</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 capitalize">
                  {selectedDifficulty}
                </span>
              </div>

              {/* 5 Difficulty Options: Beginner, Intermediate, Hard, Expert, Mixed */}
              <div className="grid grid-cols-5 gap-1.5">
                {DIFFICULTY_LEVELS.map((lvl) => {
                  const isSelected = selectedDifficulty === lvl.id;
                  const Icon = lvl.icon;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSelectedDifficulty(lvl.id)}
                      className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
                        isSelected
                          ? lvl.activeClass
                          : "bg-surface border border-main text-muted hover:border-indigo-400 hover:text-main"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-muted"}`} />
                      <span className="text-[11px] font-bold leading-none">{lvl.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted px-1">
                <span>Selected: <strong className="text-main capitalize">{selectedDifficulty}</strong></span>
                <span className="text-[10px]">
                  {selectedDifficulty === "beginner" && "🟢 Foundational • Safe XP"}
                  {selectedDifficulty === "intermediate" && "🟡 Applied • Moderate risk"}
                  {selectedDifficulty === "hard" && "🟠 Complex • Rank sensitive"}
                  {selectedDifficulty === "expert" && "🔴 Architecture & high risk"}
                  {selectedDifficulty === "mixed" && "🟣 Progressive (Easy → Hard)"}
                </span>
              </div>
            </div>

            {/* 2. Session Length Selector */}
            <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-main">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Choose Session Length</span>
                </div>
                <span className="text-[11px] font-semibold text-muted">
                  Bank: {totalQuestions} Qs
                </span>
              </div>

              {/* Strict Options: 10, 20, 25, 30, 40, 50 */}
              <div className="grid grid-cols-3 gap-2">
                {questionOptions.map((opt) => {
                  const isSelected = selectedQuestionLimit === opt;
                  const isDefault = opt === 50;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedQuestionLimit(opt)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-500"
                          : "bg-surface border border-main text-muted hover:border-indigo-400 hover:text-main"
                      }`}
                    >
                      <span>{opt} Qs</span>
                      {isDefault && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-extrabold mt-0.5 ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                          }`}
                        >
                          Default
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted text-center">
                Select questions to attempt. Duration scales ~1 min/question.
              </p>
            </div>

            {/* Central Stats Box */}
            <div className="flex items-center p-3.5 bg-main rounded-2xl border border-main shadow-inner">
              <div className="flex flex-col items-center flex-1">
                <Clock className="w-4 h-4 text-muted mb-0.5" />
                <span className="text-[10px] text-muted uppercase tracking-wider font-bold">
                  Duration
                </span>
                <span className="text-base font-bold text-main">
                  {effectiveTimeLimit} Mins
                </span>
              </div>
              <div className="w-px h-8 bg-border-main" />
              <div className="flex flex-col items-center flex-1">
                <FileText className="w-4 h-4 text-muted mb-0.5" />
                <span className="text-[10px] text-muted uppercase tracking-wider font-bold">
                  Questions
                </span>
                <span className="text-base font-bold text-main">
                  {effectiveQuestionsCount} Items
                </span>
              </div>
            </div>

            {/* 3. PROMINENT RED WARNING NOTE DIRECTLY ABOVE START BUTTON */}
            <div className="p-3.5 rounded-2xl border-2 border-red-500/40 bg-red-500/10 dark:bg-red-950/30 text-red-700 dark:text-red-300 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-bold text-xs text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-bounce" />
                <span>NOTE / RANK WARNING</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-800/90 dark:text-red-300/90">
                You may select any difficulty level (including <strong>Intermediate</strong>, <strong>Hard</strong>, or <strong>Expert</strong>). However, higher difficulty carries rank penalty risk: <strong>poor performance or failing (&lt; 50%) will deduct Experience Points (Elo) and degrade your grade/rank!</strong> Choose your tier carefully.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleStartQuizClick}
                disabled={loading}
                className="w-full bg-brand-mid hover:bg-brand-primary text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-mid/20 cursor-pointer text-sm"
              >
                <Play className="w-4 h-4 animate-pulse" />{" "}
                {loading ? "Initializing..." : "Enter Examination Hall"}
              </button>
              <button
                onClick={handleGoBack}
                type="button"
                className="w-full bg-transparent hover:bg-red-500/10 text-muted hover:text-red-500 font-semibold py-2 px-4 rounded-xl border border-transparent hover:border-red-500/20 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel Attempt
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
