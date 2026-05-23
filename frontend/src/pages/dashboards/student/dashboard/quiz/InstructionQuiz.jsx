/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// import React from 'react';
// import { useRef } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  AlertCircle,
  Play,
  X,
  Clock,
  FileText,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import useAttemptQuizStore from "../../../../../store/useAttemptQuizStore";
import { enterFullScreen, exitFullScreen } from "../../components/enterFullScreen";

export const QuizLanding = () => {
  //   const quizContainerRef = useRef(null);
  const rules = [
    "Do not switch tabs or windows during the test. Doing so will be flagged.",
    "Multiple tab switches will result in automatic submission.",
    "Keyboard shortcuts (Ctrl+C, Ctrl+V, etc.) are strictly disabled.",
    "The test is timed. Ensure you submit before the countdown ends.",
    "Questions are presented one by one. You can skip and return later.",
  ];

  const navigate = useNavigate();
  const location = useLocation();

  const { startAttempt, loading } = useAttemptQuizStore();

  const quizId = location.state?.quizId;
  const quizTitle = location.state?.title || "Assessment";
  const quizDuration = location.state?.timeLimit || 10; // 
  const totalQuestions = location.state?.totalQuestions || 0;
  console.log("Extracted Quiz ID from Route State:", quizId);

const handleGoBack = () => {
    exitFullScreen();
    navigate("/student/quizzes");
  };

  // COMBINED & FIXED FLOW: Properly handles async state initialization
  const handleStartQuiz = async () => {
    if (!quizId) {
      toast.error("Quiz metadata is missing!");
      return;
    }

    try {
      // 1. Enter fullscreen mode securely inside user click gesture phase
      enterFullScreen();

      // 2. Await the server session instantiation. 
      // Note: useAttemptQuizStore automatically routes to "/student/start-quiz" 
      // inside its internal logic when 'response.data.success' evaluates to true.
      await startAttempt(quizId, navigate);
    } catch (error) {
      console.error("Initialization Failed: ", error);
      exitFullScreen();
      toast.error(
        "Security validation failed. Please check browser permissions.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-50 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
              {quizTitle}
            </h1>
            <p className="text-slate-500 font-medium">
              Secure Assessment System v2.0
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 italic">
              By clicking 'Enter Examination Hall', you consent to full-screen
              monitoring and proctoring protocols.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Examination Rules
            </h2>
            <ul className="space-y-3">
              {rules.map((rule, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex items-start gap-3 text-slate-600"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{rule}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-6 mt-8 p-4 bg-slate-50 rounded-xl">
            <div className="flex flex-col items-center gap-1 flex-1">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                Duration
              </span>
              <span className="text-lg font-semibold text-slate-800">
                {quizDuration} Minutes
              </span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="flex flex-col items-center gap-1 flex-1">
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                Questions
              </span>
              <span className="text-lg font-semibold text-slate-800">
                {totalQuestions} Items
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleStartQuiz}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <Play className="w-5 h-5" /> {loading ? "Initializing Secure Session..." : "Enter Examination Hall"}
          </button>
          <button
            onClick={handleGoBack}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-600 font-semibold py-4 px-6 rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" /> Cancel Attempt
          </button>
        </div>
      </motion.div>
    </div>
  );
};
