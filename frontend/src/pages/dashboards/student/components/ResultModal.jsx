// import React from 'react'
import { XCircle, Clock, Calendar, X, BarChart3, Award } from "lucide-react";
import { formatDate } from "../../../../utils/formatDate";
// import { useNavigate } from "react-router-dom";
function ResultModal({ selectedAttempt, closeModal }) {
  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Shadow overlay */}
        <div
          className="absolute inset-0  backdrop-blur-sm"
          onClick={closeModal}
        ></div>

        {/* Modal Content Box */}
        <div className="bg-surface border border-main w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Modal Header */}
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

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-xl font-bold text-text-main">
                {selectedAttempt?.quizId?.title || selectedAttempt.quizTitle}
              </h4>
            </div>

            {/* Status & Score Banner */}
            <div
              className={`p-4 rounded-xl flex items-center justify-between border ${
                selectedAttempt.score >= 50
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-rose-500/10 border-rose-500/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {selectedAttempt.score >= 50 ? (
                  <Award className="w-6 h-6 text-emerald-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400" />
                )}
                <div>
                  <p className="text-xs text-text-muted font-medium">
                    Result Status
                  </p>
                  <p
                    className={`text-sm font-bold ${selectedAttempt.score >= 50 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {selectedAttempt.status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted font-medium">
                  Final Score
                </p>
                <p className="text-2xl font-black text-text-main">
                  {selectedAttempt.score}%
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface/50 p-3.5 rounded-xl border border-main">
                <p className="text-xs text-text-muted">Correct Answers</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  {selectedAttempt.correctAnswersCount}{" "}
                  <span className="text-xs text-text-muted font-normal">
                    / {selectedAttempt.totalQuestions}
                  </span>
                </p>
              </div>
              <div className="bg-surface/50 p-3.5 rounded-xl border border-main">
                <p className="text-xs text-text-muted">Incorrect Answers</p>
                <p className="text-lg font-bold text-rose-400 mt-1">
                  {selectedAttempt.totalQuestions -
                    selectedAttempt.correctAnswersCount}{" "}
                  <span className="text-xs text-text-muted font-normal">
                    / {selectedAttempt.totalQuestions}
                  </span>
                </p>
              </div>
              <div className="bg-surface/50 p-3.5 rounded-xl border border-main">
                <p className="text-xs text-text-muted">Time Consumed</p>
                <p className="text-base font-semibold text-text-main mt-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-text-muted" />
                  {selectedAttempt?.timeTaken ? `${selectedAttempt.timeTaken} mins` : `${selectedAttempt?.timeTakenInSeconds} secs`}
                </p>
              </div>
              <div className="bg-surface/50 p-3.5 rounded-xl border border-main">
                <p className="text-xs text-text-muted">Exam Date</p>
                <p className="text-base font-semibold text-text-main mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  {formatDate(selectedAttempt.completedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-surface/50 border-t border-main flex justify-center">
            <button
              onClick={closeModal}
              className="w-full sm:w-auto px-5 py-2 bg-main hover:bg-main/80 text-text-main font-medium text-sm rounded-xl transition-colors"
            >
              Close Report
            </button>
          </div>
        </div>
      </div>
      {/* )} */}
      {/* </div> */}
    </div>
  );
}

export default ResultModal;
