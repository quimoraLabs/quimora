import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import useAttemptQuizStore from "../../../../../store/useAttemptQuizStore";
import { exitFullScreen } from "../../components/enterFullScreen";
import { Watermark } from "../../components/Watermark";

function StudentQuizQuestions() {
  const navigate = useNavigate();
  const {
    attemptQuiz,
    attemptId,
    currentIndex,
    timer,
    answers,
    loading,
    isFinished,
    tickTimer,
    incrementWarning,
    selectOption,
    goToNextQuestion,
    goToPreviousQuestion,
    submitAttempt,
  } = useAttemptQuizStore();

  // Local states to handle overlay locks
  const [isFullscreenLocked, setIsFullscreenLocked] = useState(true);
  // timer position state: 'left' | 'center' | 'right'
  const [timerPosition, setTimerPosition] = useState("center");
  const isSubmittingRef = useRef(false);
  const lastWarningAtRef = useRef(0);
  const [hasExitedOnce, setHasExitedOnce] = useState(false); // 🔥 TRACKS REAL CHEATING

  // Helper function to handle full screen lock activation
  const triggerFullscreenLock = () => {
    const element = document.documentElement;
    const requestMethod =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen;

    if (requestMethod) {
      requestMethod
        .call(element)
        .then(() => {
          setIsFullscreenLocked(true);
        })
        .catch((err) => {
          console.log("Fullscreen restriction caught.", err);
          setIsFullscreenLocked(false);
        });
    }
  };

  // ✅ INITIAL LAYOUT GUARD: Safe Asynchronous Fullscreen Check on Mount
  useEffect(() => {
    if (isFinished || !attemptQuiz || !attemptId) return;

    // Check current fullscreen state after the browser completes its initial layout paint loop
    const checkInitialFullscreen = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      // Wrap state update in a 0ms timeout so it runs AFTER the current render cycle completely finishes
      if (!isNowFullscreen) {
        setTimeout(() => {
          setIsFullscreenLocked(false);
        }, 0);
      }
    };

    checkInitialFullscreen();
  }, [attemptQuiz, attemptId, isFinished]);

  // ⏱️ ENGINE 1: Clock Sync Loop
  useEffect(() => {
    if (isFinished || !attemptQuiz) return;

    const intervalId = setInterval(() => {
      tickTimer(navigate);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isFinished, attemptQuiz, tickTimer, navigate]);

  // ⚠️ ENGINE 2: Proctoring Engine
  useEffect(() => {
    if (isFinished || !attemptQuiz) return;

    const addSecurityWarning = (message) => {
      if (isSubmittingRef.current) return;

      const now = Date.now();
      if (now - lastWarningAtRef.current < 1500) return;

      lastWarningAtRef.current = now;
      incrementWarning(message, navigate);
    };

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isNowFullscreen && !isFinished && !isSubmittingRef.current) {
        // 🔥 Set cheating state to TRUE since user actively left fullscreen during exam
        setHasExitedOnce(true);

        addSecurityWarning(
          "Security Alert: Exiting full-screen mode is strictly prohibited! Warning added.",
        );

        setIsFullscreenLocked(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setHasExitedOnce(true);
        setIsFullscreenLocked(false);
        addSecurityWarning(
          "Security Alert: Tab switching detected. Warning added.",
        );
      }
    };

    const handleWindowBlur = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isCurrentlyFullscreen) return;

      addSecurityWarning(
        "Security Alert: Focus lost from examination window. Warning added.",
      );
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.error("Right-clicking is disabled during this exam.");
    };

    const handleKeyDown = (e) => {
      const key = e.key?.toLowerCase();

      if (
        (e.ctrlKey || e.metaKey) &&
        (key === "c" || key === "v" || key === "u" || key === "s")
      ) {
        e.preventDefault();
        addSecurityWarning(
          `Security Alert: Blocked shortcut combination (Ctrl/Cmd + ${key.toUpperCase()}).`,
        );
        return;
      }

      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        addSecurityWarning(
          "Security Alert: Developer Tools inspection (F12) blocked.",
        );
        return;
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFinished, attemptQuiz, incrementWarning, navigate]);

  if (!attemptQuiz || !attemptId) {
    return (
      <div className="p-6 bg-main min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4 text-muted font-semibold">
          No active quiz session initialization found.
        </p>
        <button
          onClick={() => navigate("/student/quizzes")}
          className="px-4 py-2 bg-accent rounded text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-main min-h-screen flex items-center justify-center text-main">
        Processing secure transaction submission...
      </div>
    );
  }

  const currentQuestion = attemptQuiz.questions[currentIndex];
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  const handleSelectOptionIndex = (optionIndex) => {
    selectOption(currentQuestion._id, [optionIndex]);
  };

  const handleFinalSubmit = async () => {
    try {
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



  return (
    <div className="relative min-h-screen bg-main text-main select-none">
      <Watermark />

      {/* 🔥 THE INTUATIVE SMART DUAL-MODE OVERLAY LOCK */}
      {!isFullscreenLocked && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 text-center backdrop-blur-md">
          {hasExitedOnce ? (
            /* CASE 1: REAL VIOLATION SCREEN (When the user presses Esc during the test) */
            <div className="max-w-md bg-elevated p-8 border border-accent/20 rounded-2xl shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
              <h2 className="text-2xl font-black text-accent uppercase tracking-wide">
                Security Protocol Violation
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                You exited full-screen mode. According to exam rules, taking the
                test on a smaller screen is not allowed. Your warning count has
                been increased.
              </p>
              <button
                onClick={triggerFullscreenLock}
                className="w-full py-4 bg-accent hover:opacity-95 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg"
              >
                Re-Enter Fullscreen Hall
              </button>
            </div>
          ) : (
            /* CASE 2: CLEAN START / ENTRY HALL SCREEN (Before the test begins for the first time) */
            <div className="max-w-md bg-elevated p-8 border border-soft rounded-2xl shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
              <h2 className="text-2xl font-black text-accent uppercase tracking-wide">
                Examination Hall Entry
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                Your quiz environment is ready. Click below to set up the secure
                proctoring environment and begin the test.
              </p>
              <button
                onClick={triggerFullscreenLock}
                className="w-full py-4 bg-accent hover:opacity-95 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg"
              >
                Start & Initialize Exam
              </button>
            </div>
          )}
        </div>
      )}

      {/* MAIN EXAM CONTENT CONTAINER */}
      <div className="p-6 min-h-screen flex flex-col items-center justify-center">
        {/* Floating Timer (position selectable) */}
        <div className={`absolute top-6 left-0 right-0 px-4`}>
          <div className={`flex ${timerPosition === 'left' ? 'justify-start' : timerPosition === 'right' ? 'justify-end' : 'justify-center'}`}> 
            <div className="flex items-center gap-3 px-5 py-3 bg-surface/80 backdrop-blur-sm border border-soft rounded-full shadow-card">
              <div className="font-mono text-3xl md:text-4xl font-extrabold tabular-nums text-accent">
                {minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-muted uppercase tracking-widest font-semibold">Time</div>
            </div>

            {/* small control to switch timer position */}
            <div className="ml-4 flex items-center gap-1">
              <button onClick={() => setTimerPosition('left')} className={`w-6 h-6 rounded-full border border-soft ${timerPosition==='left' ? 'bg-accent' : 'bg-surface'}`}></button>
              <button onClick={() => setTimerPosition('center')} className={`w-6 h-6 rounded-full border border-soft ${timerPosition==='center' ? 'bg-accent' : 'bg-surface'}`}></button>
              <button onClick={() => setTimerPosition('right')} className={`w-6 h-6 rounded-full border border-soft ${timerPosition==='right' ? 'bg-accent' : 'bg-surface'}`}></button>
            </div>
          </div>
        </div>

        <div className="w-full mx-4 max-w-3xl p-6 md:p-8 border border-soft rounded-2xl bg-surface shadow-card transition-all">
          <p className="text-muted mb-2 font-medium">
            Question {currentIndex + 1} of {attemptQuiz.questions.length}
          </p>

          <h2 className="text-2xl font-semibold mb-6">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options?.map((option, idx) => {
              const storedSelections = answers[currentQuestion._id];
              const isSelected =
                storedSelections !== undefined &&
                typeof storedSelections === "string" &&
                storedSelections.split(",").includes(idx.toString());

              return (
                <div
                  key={option._id || idx}
                  onClick={() => handleSelectOptionIndex(idx)}
                  className={`p-4 border rounded-md cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-main bg-elevated text-main"
                      : "border-main bg-surface hover:bg-elevated text-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border flex items-center justify-center" style={{ borderColor: isSelected ? 'var(--color-brand-mid)' : 'var(--color-border-main)'}}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-brand-mid)'}} />
                      )}
                    </div>
                    <span>{option.optionText}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentIndex === 0}
              className="px-5 py-2 bg-surface border border-soft rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-elevated transition font-medium"
            >
              Previous
            </button>

            {currentIndex === attemptQuiz.questions.length - 1 ? (
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2 bg-accent rounded-md hover:opacity-95 transition font-bold tracking-wide shadow-lg text-white"
              >
                Submit Examination
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                className="px-5 py-2 bg-accent rounded-md hover:opacity-95 transition font-medium text-white"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentQuizQuestions;
