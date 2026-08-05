// src/features/quiz/hooks/useExamProctoring.js
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export function useExamProctoring({
  isFinished,
  attemptQuiz,
  incrementWarning,
  navigate,
}) {
  const [isFullscreenLocked, setIsFullscreenLocked] = useState(true);
  const [hasExitedOnce, setHasExitedOnce] = useState(false);
  const isSubmittingRef = useRef(false);
  const lastWarningAtRef = useRef(0);

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
        .then(() => setIsFullscreenLocked(true))
        .catch(() => setIsFullscreenLocked(false));
    }
  };

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
        setHasExitedOnce(true);
        addSecurityWarning(
          "Security Alert: Exiting full-screen mode is strictly prohibited!",
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

    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.error("Right-clicking is disabled during this exam.");
    };

    const handleKeyDown = (e) => {
      const key = e.key?.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "u", "s"].includes(key)) {
        e.preventDefault();
        addSecurityWarning(
          `Security Alert: Blocked shortcut (Ctrl/Cmd + ${key.toUpperCase()}).`,
        );
      }
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        addSecurityWarning(
          "Security Alert: Developer Tools inspection (F12) blocked.",
        );
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFinished, attemptQuiz, incrementWarning, navigate]);

  return {
    isFullscreenLocked,
    hasExitedOnce,
    triggerFullscreenLock,
    isSubmittingRef,
  };
}
