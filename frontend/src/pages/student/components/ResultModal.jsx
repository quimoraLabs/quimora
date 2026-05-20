// import React from 'react'
import { XCircle, Clock, Calendar, X, BarChart3, Award } from "lucide-react";
import { formatDate } from "../../../utils/formatDate";
// import { useNavigate } from "react-router-dom";
function ResultModal({ selectedAttempt, closeModal }) {
  return (
    <div>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Shadow overlay */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          {/* Modal Content Box */}
          <div className="bg-[#1e293b] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#151f32]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Performance Report</h3>
              </div>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-white bg-slate-800/50 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                {/* <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  {selectedAttempt.category}
                </span> */}
                <h4 className="text-xl font-bold text-white mt-0.5">
                  {selectedAttempt.quizId.title}
                </h4>
              </div>

              {/* Status & Score Banner */}
              <div className={`p-4 rounded-xl flex items-center justify-between ${
                selectedAttempt.score >= 50 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'
              }`}>
                <div className="flex items-center gap-2.5">
                  {selectedAttempt.score >= 50 ? (
                    <Award className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400" />
                  )}
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Result Status</p>
                    <p className={`text-sm font-bold ${selectedAttempt.score >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedAttempt.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Final Score</p>
                  <p className="text-2xl font-black text-white">{selectedAttempt.score}%</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#151f32] p-3.5 rounded-xl border border-slate-800/60">
                  <p className="text-xs text-slate-400">Correct Answers</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">
                    {selectedAttempt.correctAnswersCount} <span className="text-xs text-slate-500 font-normal">/ {selectedAttempt.totalQuestions}</span>
                  </p>
                </div>
                <div className="bg-[#151f32] p-3.5 rounded-xl border border-slate-800/60">
                  <p className="text-xs text-slate-400">Incorrect Answers</p>
                  <p className="text-lg font-bold text-rose-400 mt-1">
                    {selectedAttempt.totalQuestions - selectedAttempt.correctAnswersCount} <span className="text-xs text-slate-500 font-normal">/ {selectedAttempt.totalQuestions}</span>
                  </p>
                </div>
                <div className="bg-[#151f32] p-3.5 rounded-xl border border-slate-800/60">
                  <p className="text-xs text-slate-400">Time Consumed</p>
                  <p className="text-base font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {selectedAttempt.timeTaken} mins
                  </p>
                </div>
                <div className="bg-[#151f32] p-3.5 rounded-xl border border-slate-800/60">
                  <p className="text-xs text-slate-400">Exam Date</p>
                  <p className="text-base font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(selectedAttempt.completedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#151f32] border-t border-slate-800 flex justify-center">
              <button 
                onClick={closeModal}
                className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl transition-colors"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      {/* )} */}
    {/* </div> */}
    </div>
  )
}

export default ResultModal