import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Zap,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import Loader from "../../components/common/Loader";

export default function PracticeRoomPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins (600s)
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("activePracticeSession");
    if (!raw) {
      navigate("/student/weak-areas");
      return;
    }
    try {
      const data = JSON.parse(raw);
      setSession(data);
      setTimeLeft((data.timeLimitMinutes || 10) * 60);
    } catch {
      navigate("/student/weak-areas");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Countdown timer (non-proctored, friendly)
  useEffect(() => {
    if (result || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, result]);

  const handleSelectOption = (qIdx, optIdx) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (!session?.sessionId || submitting || result) return;
    try {
      setSubmitting(true);
      const res = await axiosClient.post("/api/v2/practice/submit", {
        sessionId: session.sessionId,
        answers,
        timeSpentSeconds: (session.timeLimitMinutes || 10) * 60 - timeLeft,
      });

      if (res.data?.success) {
        setResult(res.data.data);
        sessionStorage.removeItem("activePracticeSession");
      }
    } catch (err) {
      console.error("Practice submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const questions = session?.questions || [];
  const currentQ = questions[currentIdx];

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // RESULT SCREEN
  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-surface border border-soft rounded-3xl p-8 text-center space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Diagnostic Drill Complete
            </span>
            <h1 className="text-3xl font-black text-main mt-1">Accuracy: {result.score}%</h1>
            <p className="text-sm text-muted mt-1">
              You answered {result.correctCount} out of {result.totalQuestions} questions correctly and earned +{result.xpEarned} Practice XP!
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-main">
            <span>Level: {result.practiceLevel}</span>
            <span>•</span>
            <span>Total XP: {result.newTotalXp}</span>
            <span>•</span>
            <span>Streak: {result.currentStreak} Days 🔥</span>
          </div>

          <div className="pt-4">
            <button
              onClick={() => navigate("/student/weak-areas")}
              className="px-6 py-3 bg-accent text-white font-bold rounded-xl text-sm shadow-md hover:opacity-95 cursor-pointer"
            >
              Back to Practice Hub
            </button>
          </div>
        </div>

        {/* Detailed Review with Remedial Explanations */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-main">Concept Review & Explanations</h2>
          {result.feedback?.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all ${
                item.isCorrect
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {item.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-semibold text-main">
                    Q{idx + 1}. {item.questionText}
                  </p>
                  <div className="p-3 bg-surface/80 rounded-xl border border-soft text-xs text-muted">
                    <strong className="text-main">Explanation: </strong>
                    {item.explanation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header & Countdown Timer */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-soft shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            {session?.mode === "random_mind_game" ? "Random Mind-Game" : "Custom Targeted Drill"}
          </span>
          <span className="text-xs font-semibold text-muted">
            Q {currentIdx + 1} of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-sm font-bold text-main px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-surface rounded-3xl border border-soft p-6 md:p-8 space-y-6 shadow-card">
          <div className="space-y-2">
            <span className="text-2xs font-bold text-muted uppercase tracking-wider">
              Topic: {currentQ.topicTag || "Diagnostic"}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-main leading-snug">
              {currentQ.questionText}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options?.map((opt, oIdx) => {
              const isSelected = answers[currentIdx] === oIdx;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(currentIdx, oIdx)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-accent/10 border-accent text-accent font-bold ring-2 ring-accent/30"
                      : "bg-surface hover:bg-elevated border-soft text-main"
                  }`}
                >
                  <span>{opt.optionText}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-accent bg-accent text-white" : "border-soft"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-soft">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-soft text-muted hover:text-main disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:opacity-90 cursor-pointer"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                {submitting ? "Grading..." : "Finish Drill"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

