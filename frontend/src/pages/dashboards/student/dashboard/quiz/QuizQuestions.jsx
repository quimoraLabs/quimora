import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import useAttemptQuizStore from "../../../../../store/useAttemptQuizStore";
import { exitFullScreen } from "../../components/enterFullScreen";

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
      requestMethod.call(element)
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

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isNowFullscreen && !isFinished) {
        // 🔥 Set cheating state to TRUE since user actively left fullscreen during exam
        setHasExitedOnce(true); 
        
        incrementWarning(
          "Security Alert: Exiting full-screen mode is strictly prohibited! Warning added.",
          navigate
        );
        
        setIsFullscreenLocked(false); 
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        incrementWarning("Security Alert: Tab switching detected. Warning added.", navigate);
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

      incrementWarning("Security Alert: Focus lost from examination window. Warning added.", navigate);
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.error("Right-clicking is disabled during this exam.");
    };

    const handleKeyDown = (e) => {
      const key = e.key?.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && (key === 'c' || key === 'v' || key === 'u' || key === 's')) {
        e.preventDefault();
        incrementWarning(`Security Alert: Blocked shortcut combination (Ctrl/Cmd + ${key.toUpperCase()}).`, navigate);
        return;
      }

      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        incrementWarning("Security Alert: Developer Tools inspection (F12) blocked.", navigate);
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
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFinished, attemptQuiz, incrementWarning, navigate]);

  useEffect(() => {
    return () => {
      exitFullScreen();
    };
  }, []);

  if (!attemptQuiz || !attemptId) {
    return (
      <div className="p-6 text-white bg-neutral-900 min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4 text-amber-500">No active quiz session initialization found.</p>
        <button onClick={() => navigate("/student/quizzes")} className="px-4 py-2 bg-blue-600 rounded">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-white p-6 bg-neutral-900 min-h-screen flex items-center justify-center">
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
      exitFullScreen();
      await submitAttempt(navigate);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-900 text-white select-none">
      
      {/* 🔥 THE INTUATIVE SMART DUAL-MODE OVERLAY LOCK */}
      {!isFullscreenLocked && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 text-center backdrop-blur-md">
          {hasExitedOnce ? (
            /* CASE 1: REAL VIOLATION SCREEN (Agar test ke beech me Esc kiya) */
            <div className="max-w-md bg-neutral-800 p-8 border border-red-500/30 rounded-2xl shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
              <h2 className="text-2xl font-black text-red-500 uppercase tracking-wide">
                Security Protocol Violation
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Aapne full-screen mode exit kiya hai. Exam rules ke mutabik choti screen par test dena allowed nahi hai. Warning count badha di gayi hai.
              </p>
              <button
                onClick={triggerFullscreenLock}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-red-900/40"
              >
                Re-Enter Fullscreen Hall
              </button>
            </div>
          ) : (
            /* CASE 2: CLEAN START / ENTRY HALL SCREEN (Pehli baar test shuru hone par) */
            <div className="max-w-md bg-neutral-800 p-8 border border-neutral-700 rounded-2xl shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
              <h2 className="text-2xl font-black text-blue-400 uppercase tracking-wide">
                Examination Hall Entry
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Aapka quiz environment taiyar hai. Secure proctoring environment setup karne aur test shuru karne ke liye niche click karein.
              </p>
              <button
                onClick={triggerFullscreenLock}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-blue-900/40"
              >
                Start & Initialize Exam
              </button>
            </div>
          )}
        </div>
      )}

      {/* MAIN EXAM CONTENT CONTAINER */}
      <div className="p-6 min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl font-mono mb-4 text-amber-400">
          Time Remaining: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>

        <div className="w-full max-w-2xl p-6 border border-neutral-700 rounded-lg bg-neutral-800 shadow-xl">
          <p className="text-neutral-400 mb-2 font-medium">
            Question {currentIndex + 1} of {attemptQuiz.questions.length}
          </p>

          <h2 className="text-2xl font-semibold mb-6">{currentQuestion.questionText}</h2>

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
                      ? "border-blue-500 bg-blue-600/20 text-white"
                      : "border-neutral-700 bg-neutral-800/50 hover:bg-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-500" : "border-neutral-500"}`}>
                      {isSelected && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
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
              className="px-5 py-2 bg-neutral-700 rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-600 transition font-medium"
            >
              Previous
            </button>

            {currentIndex === attemptQuiz.questions.length - 1 ? (
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2 bg-green-600 rounded-md hover:bg-green-700 transition font-bold tracking-wide shadow-lg shadow-green-900/30"
              >
                Submit Examination
              </button>
            ) : (
              <button onClick={goToNextQuestion} className="px-5 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition font-medium">
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