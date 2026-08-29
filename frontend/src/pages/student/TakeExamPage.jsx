import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  LayoutGrid, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  X,
  AlertTriangle
} from "lucide-react";

// Store & Utils
import useStudentQuizStore from "../../features/student/exam/store/useStudentQuizStore";
import { exitFullScreen } from "../../features/student/exam/hooks/enterFullScreen";

// Exam Feature Hooks & Components
import { useExamProctoring } from "../../features/student/exam/hooks/useExamProctoring";
import { ExamTimer } from "../../features/student/exam/components/ExamTimer";
import { FullscreenLockOverlay } from "../../features/student/exam/components/FullscreenLockOverlay";
import { Watermark } from "../../features/student/exam/components/Watermark";

export default function TakeExamPage() {
  const navigate = useNavigate();
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Active Exam Store
  const {
    attemptQuiz,
    attemptId,
    currentIndex,
    timer,
    answers,
    loading,
    isFinished,
    incrementWarning,
    selectOption,
    goToNextQuestion,
    goToPreviousQuestion,
    submitAttempt,
    tickTimer,
    startAttempt,
  } = useStudentQuizStore();

  // Auto-restore session on page refresh/reload if activeExamSession exists in localStorage
  useEffect(() => {
    if (!attemptQuiz && !isFinished && !loading) {
      const activeSessionStr = localStorage.getItem("activeExamSession");
      if (activeSessionStr) {
        try {
          const activeSession = JSON.parse(activeSessionStr);
          if (activeSession?.quizId) {
            startAttempt(activeSession.quizId, navigate);
          }
        } catch (e) {
          console.error("Failed to parse activeExamSession:", e);
        }
      }
    }
  }, [attemptQuiz, isFinished, loading, startAttempt, navigate]);

  // Live Timer Countdown Interval Engine
  useEffect(() => {
    if (!attemptQuiz || !attemptId || isFinished) return;

    const timerInterval = setInterval(() => {
      tickTimer(navigate);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [attemptQuiz, attemptId, isFinished, tickTimer, navigate]);

  // BeforeUnload Warning Guard (Alerts student on accidental refresh/close)
  useEffect(() => {
    if (!attemptQuiz || !attemptId || isFinished) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "You have an active exam session in progress. Are you sure you want to leave or refresh?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [attemptQuiz, attemptId, isFinished]);

  // Proctoring Hook
  const {
    isFullscreenLocked,
    hasExitedOnce,
    triggerFullscreenLock,
    isSubmittingRef,
  } = useExamProctoring({
    isFinished,
    attemptQuiz,
    incrementWarning,
    navigate,
  });

  // Guard: Redirect or fallback if no active attempt
  if (!attemptQuiz || !attemptId) {
    return (
      <div className="p-6 bg-main min-h-screen flex flex-col items-center justify-center">
        <div className="p-4 rounded-2xl bg-surface border border-main text-center shadow-card max-w-md w-full">
          <HelpCircle className="w-12 h-12 text-brand-mid mx-auto mb-3 animate-pulse" />
          <h3 className="text-xl font-bold text-main mb-1">No Active Quiz Found</h3>
          <p className="mb-5 text-muted text-sm">
            Please return to your quiz catalog to start or resume an attempt.
          </p>
          <button
            onClick={() => navigate("/student/quizzes")}
            className="w-full py-2.5 bg-brand-mid hover:bg-brand-primary text-white rounded-xl font-semibold shadow-md transition-all"
          >
            Return to Quiz Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-main min-h-screen flex items-center justify-center text-main font-medium">
        <div className="flex items-center gap-3 bg-surface p-6 rounded-2xl border border-main shadow-xl">
          <div className="w-6 h-6 border-3 border-brand-mid border-t-transparent rounded-full animate-spin" />
          <span>Processing secure exam transaction...</span>
        </div>
      </div>
    );
  }

  const currentQuestion = attemptQuiz.questions[currentIndex];
  const totalQuestions = attemptQuiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectOptionIndex = (optionIndex) => {
    selectOption(currentQuestion._id, [optionIndex]);
  };

  const handleFinalSubmit = async () => {
    try {
      setShowSubmitModal(false);
      isSubmittingRef.current = true;
      const submitted = await submitAttempt(navigate);
      if (submitted) {
        exitFullScreen();
        return;
      }
      isSubmittingRef.current = false;
    } catch (err) {
      isSubmittingRef.current = false;
      console.error(err);
    }
  };

  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="relative min-h-screen bg-main text-main select-none flex flex-col font-sans">
      {/* Background Security Watermark */}
      <Watermark />

      {/* Proctoring / Screen Lock Overlay */}
      <FullscreenLockOverlay
        isFullscreenLocked={isFullscreenLocked}
        hasExitedOnce={hasExitedOnce}
        onReenter={triggerFullscreenLock}
      />

      {/* ===== TOP NAVBAR HEADER ===== */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-main px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Quiz Title & Security Pill */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base md:text-lg font-bold text-main tracking-tight line-clamp-1">
                {attemptQuiz.title || "Examination Session"}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  PROCTORED LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Floating Timer */}
          <ExamTimer timer={timer} />

          {/* Actions & Grid Toggle */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex text-xs font-semibold text-muted bg-elevated px-3 py-1.5 rounded-xl border border-main">
              {answeredCount}/{totalQuestions} Answered
            </span>

            <button
              onClick={() => setShowQuestionGrid(!showQuestionGrid)}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-main rounded-xl text-xs font-semibold text-main hover:bg-elevated transition-all shadow-sm"
              title="Question Navigator"
            >
              <LayoutGrid className="w-4 h-4 text-brand-mid" />
              <span className="hidden md:inline">Navigator</span>
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-elevated h-1.5 mt-3 rounded-full overflow-hidden border-t border-main/20">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-mid via-indigo-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* ===== MAIN EXAM AREA ===== */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full bg-surface border border-main rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-main pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-brand-mid/10 text-brand-mid font-mono font-bold text-xs border border-brand-mid/20">
                  QUESTION {String(currentIndex + 1).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
                </span>
                {currentQuestion.marks && (
                  <span className="text-xs text-muted font-medium bg-elevated px-2.5 py-1 rounded-xl border border-main">
                    +{currentQuestion.marks} Mark{currentQuestion.marks > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <span className="text-xs font-semibold text-muted">
                {answers[currentQuestion._id] ? "Saved" : "Not Answered"}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl md:text-2xl font-bold text-main leading-relaxed mb-8">
              {currentQuestion.questionText}
            </h2>

            {/* Options List with KBC-Style Selection Animation */}
            <div className="space-y-3.5">
              {currentQuestion.options?.map((option, idx) => {
                const storedSelections = answers[currentQuestion._id];
                const isSelected =
                  storedSelections !== undefined &&
                  typeof storedSelections === "string" &&
                  storedSelections.split(",").includes(option._id);

                return (
                  <motion.div
                    key={option._id || idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectOptionIndex(idx)}
                    className={`relative p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between border-2 ${
                      isSelected
                        ? "border-brand-mid bg-gradient-to-r from-brand-mid/15 via-surface to-brand-mid/5 shadow-[0_0_25px_rgba(99,102,241,0.25)] text-main"
                        : "border-main bg-surface hover:bg-elevated hover:border-brand-mid/40 text-muted"
                    }`}
                  >
                    {/* Pulsing Lock-In Glow Ring for Selected State */}
                    {isSelected && (
                      <span className="absolute inset-0 rounded-2xl border-2 border-brand-mid/60 animate-pulse pointer-events-none" />
                    )}

                    <div className="flex items-center gap-4 relative z-10">
                      {/* Letter Badge (A, B, C, D) */}
                      <div
                        className={`relative w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                          isSelected
                            ? "bg-brand-mid text-white shadow-md"
                            : "bg-elevated border border-main text-muted"
                        }`}
                      >
                        {optionLetters[idx] || idx + 1}
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-surface animate-ping" />
                        )}
                      </div>

                      {/* Option Text */}
                      <span className={`text-sm md:text-base font-medium ${isSelected ? "font-semibold text-main" : ""}`}>
                        {option.optionText}
                      </span>
                    </div>

                    {/* Selected Checkmark Indicator */}
                    {isSelected && (
                      <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-brand-mid bg-brand-mid/10 px-3 py-1 rounded-full border border-brand-mid/20">
                        <CheckCircle2 className="w-4 h-4 text-brand-mid" />
                        <span className="hidden sm:inline">SELECTED</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-main">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-main text-sm font-semibold text-main hover:bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-3">
                {currentIndex === totalQuestions - 1 ? (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all"
                  >
                    <span>Final Submit</span>
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={goToNextQuestion}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-mid hover:bg-brand-primary text-white rounded-xl text-sm font-bold shadow-md transition-all"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ===== QUESTION NAVIGATOR DRAWER / MODAL ===== */}
      <AnimatePresence>
        {showQuestionGrid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuestionGrid(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-surface border border-main rounded-3xl p-6 shadow-2xl z-10 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-main pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-main">Question Palette Navigator</h3>
                  <p className="text-xs text-muted">Jump directly to any question</p>
                </div>
                <button
                  onClick={() => setShowQuestionGrid(false)}
                  className="p-2 text-muted hover:text-main rounded-full hover:bg-elevated transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid Items */}
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5 overflow-y-auto p-1 max-h-96">
                {attemptQuiz.questions.map((q, idx) => {
                  const isAnswered = Boolean(answers[q._id]);
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q._id || idx}
                      onClick={() => {
                        useStudentQuizStore.setState({ currentIndex: idx });
                        setShowQuestionGrid(false);
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? "ring-2 ring-brand-mid ring-offset-2 ring-offset-surface bg-brand-mid text-white shadow-md"
                          : isAnswered
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-elevated text-muted border border-main hover:border-brand-mid/50"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 border-t border-main pt-4 mt-6 text-xs text-muted font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-lg bg-elevated border border-main" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-lg bg-brand-mid text-white ring-2 ring-brand-mid" />
                  <span>Current</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== SUBMIT CONFIRMATION MODAL ===== */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubmitModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-surface border border-main rounded-3xl p-6 shadow-2xl text-center z-10"
            >
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-main mb-2">Submit Examination?</h3>
              <p className="text-sm text-muted mb-6">
                Are you sure you want to finish your test now?
              </p>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-elevated border border-main mb-6">
                <div>
                  <span className="text-xs text-muted block">Answered</span>
                  <span className="text-xl font-extrabold text-emerald-400">{answeredCount}</span>
                </div>
                <div>
                  <span className="text-xs text-muted block">Unanswered</span>
                  <span className="text-xl font-extrabold text-amber-400">{totalQuestions - answeredCount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-main text-muted font-semibold hover:bg-elevated transition-colors text-sm"
                >
                  Return to Test
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md transition-all text-sm"
                >
                  Final Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
