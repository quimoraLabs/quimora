import React from "react";
import { XCircle, Clock, Calendar, X, BarChart3, Award } from "lucide-react";
import { formatDate } from "../../../utils/formatDate";

function ResultModal({ selectedAttempt, closeModal }) {
  if (!selectedAttempt) return null;

  // JSON Data Mapping
  const {
    quizTitle = "Quiz Result",
    quizId,
    totalQuestions = 0,
    correctAnswersCount = 0,
    incorrectAnswersCount = 0,
    unattemptedCount = 0,
    marksObtained = 0,
    totalMarks = 0,
    score = 0,
    passed = false,
    status = "completed",
    completedAt,
    timeTakenInSeconds = 0,
  } = selectedAttempt;

  const title = quizId?.title || quizTitle;

  // Time Formatter Logic
  const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />

      {/* Modal Box */}
      <div className="bg-surface border border-main w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-main flex items-center justify-between bg-opacity-50">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-start" />
            <h3 className="text-lg font-bold text-brand-start">
              Performance Report
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="text-text-muted hover:text-text-main bg-main/20 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xl font-bold text-text-main capitalize">
              {title}
            </h4>
          </div>

          {/* Status & Marks Banner */}
          <div
            className={`p-4 rounded-xl flex items-center justify-between border ${
              passed
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-rose-500/10 border-rose-500/20"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {passed ? (
                <Award className="w-6 h-6 text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400" />
              )}
              <div>
                <p className="text-xs text-text-muted font-medium">
                  Result Status
                </p>
                <p
                  className={`text-sm font-bold uppercase ${
                    passed ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {passed ? "PASSED" : "NEEDS IMPROVEMENT"}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-text-muted font-medium">
                Marks Obtained
              </p>
              <p className="text-xl font-black text-text-main">
                {marksObtained} <span className="text-xs text-text-muted font-normal">/ {totalMarks}</span>
              </p>
              <p className="text-xs font-semibold text-text-muted">
                ({score}%)
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-surface/50 p-3.5 rounded-xl border border-main">
              <p className="text-xs text-text-muted">Correct</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">
                {correctAnswersCount}{" "}
                <span className="text-xs text-text-muted font-normal">
                  / {totalQuestions}
                </span>
              </p>
            </div>

            <div className="bg-surface/50 p-3.5 rounded-xl border border-main">
              <p className="text-xs text-text-muted">Incorrect</p>
              <p className="text-lg font-bold text-rose-400 mt-1">
                {incorrectAnswersCount}{" "}
                <span className="text-xs text-text-muted font-normal">
                  / {totalQuestions}
                </span>
              </p>
            </div>

            <div className="bg-surface/50 p-3.5 rounded-xl border border-main">
              <p className="text-xs text-text-muted">Unattempted</p>
              <p className="text-lg font-bold text-amber-400 mt-1">
                {unattemptedCount}{" "}
                <span className="text-xs text-text-muted font-normal">
                  / {totalQuestions}
                </span>
              </p>
            </div>

            <div className="bg-surface/50 p-3.5 rounded-xl border border-main">
              <p className="text-xs text-text-muted">Time Taken</p>
              <p className="text-base font-semibold text-text-main mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-text-muted" />
                {formatTime(timeTakenInSeconds)}
              </p>
            </div>

            <div className="bg-surface/50 p-3.5 rounded-xl border border-main col-span-2">
              <p className="text-xs text-text-muted">Exam Date</p>
              <p className="text-base font-semibold text-text-main mt-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-text-muted" />
                {completedAt ? formatDate(completedAt) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface/50 border-t border-main flex justify-center">
          <button
            onClick={closeModal}
            className="w-full sm:w-auto px-6 py-2 bg-main hover:bg-main/80 text-text-main font-medium text-sm rounded-xl transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultModal;