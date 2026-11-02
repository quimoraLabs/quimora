import React from "react";
import { Target, ArrowRight, Sparkles, X } from "lucide-react";

/**
 * Optional First-Time Demo Quiz Modal (HackerRank style)
 * Triggered on fresh quiz attempt before entering rules/start.
 * Tutorial Mode: 2-3 questions to learn exam UI (timer, next button, submit).
 */
export default function FirstTimePracticeModal({
  isOpen,
  onClose,
  topicTitle = "this topic",
  onStartPractice,
  onSkipAndProceed,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-lg bg-surface border border-soft rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 overflow-hidden">
        {/* Glow Accent Backdrop */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Exam Onboarding Tutorial
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-main mt-1">
                Try a Demo Quiz to understand the exam format
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-muted hover:text-main hover:bg-elevated transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Message */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Would you like to try a quick 3-question demo mock quiz first to get familiar with the exam interface? This is{" "}
            <span className="font-bold text-main">completely optional</span> and does not consume your 3 certification exam attempts.
          </p>

          <div className="p-3.5 rounded-2xl bg-elevated/40 border border-soft text-2xs text-muted space-y-1.5">
            <div className="flex items-center gap-2 text-main font-semibold">
              <Target size={14} className="text-indigo-500" />
              <span>What will you learn in the Demo Quiz?</span>
            </div>
            <p>
              • How the live countdown timer and auto-submit behave.
              <br />
              • How to navigate between questions and mark choices.
              <br />
              • Instant preview of the scoring and diagnostic report.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {/* Button 1: Start Demo Quiz */}
          <button
            onClick={onStartPractice}
            disabled={loading}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Target size={15} />
            <span>🎯 Try Demo Quiz (Tutorial)</span>
          </button>

          {/* Button 2: Skip & Start Main Exam */}
          <button
            onClick={onSkipAndProceed}
            disabled={loading}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-surface border border-soft text-muted hover:text-main hover:bg-elevated transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>🚀 Skip & Start Main Exam</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
