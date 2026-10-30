import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Award,
  Lock,
  Unlock,
  CheckCircle,
  ChevronRight,
  Star,
  Play,
  BookOpen,
  ArrowLeft,
  Clock,
  Target,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import QuizInstructionsCard from "../../features/student/quiz/QuizInstructionsCard";

export default function SkillTrackPage() {
  const { interestId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackData, setTrackData] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const fetchTrack = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get(`/api/v2/student/tracks/${interestId}`);
      if (res.data?.success) {
        setTrackData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load skill track curriculum");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interestId) {
      fetchTrack();
    }
  }, [interestId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading Track Curriculum...</p>
      </div>
    );
  }

  if (error || !trackData) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl">
          <p className="text-rose-600 dark:text-rose-400 font-semibold mb-4">{error || "Track not found"}</p>
          <button
            onClick={() => navigate("/student/quizzes")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const { interest, stats, chapters } = trackData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <button
              onClick={() => navigate("/student/quizzes")}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> All Learning Tracks
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{interest.name} Track</h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {interest.description || `Master ${interest.name} through progressive chapter-based challenges and earn domain stars.`}
            </p>
          </div>

          {/* Gamified Star Status */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex flex-col items-center justify-center min-w-50">
            <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider mb-1">Domain Rating</span>
            <div className="flex items-center gap-1.5 my-1">
              {[1, 2, 3, 4, 5].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-6 h-6 ${
                    starIdx <= (stats.stars || 0)
                      ? "text-amber-400 fill-amber-400 drop-shadow"
                      : "text-slate-600"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
              <span>Elo: <strong className="text-white">{stats.currentElo}</strong></span>
              <span>•</span>
              <span>Passed: <strong className="text-white">{stats.passedQuizzes}/{stats.totalQuizzes}</strong></span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span>Curriculum Progress</span>
            <span>{stats.completionPercentage}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapters & Quizzes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Chapter Navigation Accordions */}
        <div className="lg:col-span-8 space-y-6">
          {chapters.map((chapter, cIdx) => (
            <div
              key={chapter._id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                chapter.isUnlocked
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                  : "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 opacity-75"
              }`}
            >
              {/* Chapter Header */}
              <div
                onClick={() => chapter.isUnlocked && setActiveChapterIndex(cIdx)}
                className={`p-6 flex items-center justify-between select-none ${
                  chapter.isUnlocked ? "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer" : "cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      chapter.isCompleted
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : chapter.isUnlocked
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                    }`}
                  >
                    {chapter.isCompleted ? <CheckCircle className="w-5 h-5" /> : `0${chapter.orderIndex}`}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{chapter.title}</h2>
                      {!chapter.isUnlocked && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{chapter.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400">
                    {chapter.quizzes.filter((q) => q.isCompleted).length}/{chapter.quizzes.length} Solved
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      activeChapterIndex === cIdx ? "rotate-90 text-indigo-600 dark:text-indigo-400" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Quizzes List (Expanded View) */}
              {activeChapterIndex === cIdx && chapter.isUnlocked && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/30 dark:bg-slate-900/40">
                  {chapter.quizzes.map((quiz) => (
                    <div
                      key={quiz._id}
                      className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        selectedQuiz?._id === quiz._id
                          ? "bg-indigo-50/50 dark:bg-indigo-950/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="mt-1">
                          {quiz.isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : quiz.isUnlocked ? (
                            <Unlock className="w-5 h-5 text-indigo-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Challenge {quiz.trackOrder}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {quiz.level}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                            {quiz.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {quiz.timeLimit} mins
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3.5 h-3.5" /> Min {quiz.passingScore}%
                            </span>
                            {quiz.isCompleted && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                Best: {quiz.bestScore}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="sm:self-center">
                        {quiz.isUnlocked ? (
                          <button
                            onClick={() => setSelectedQuiz(quiz)}
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                              quiz.isCompleted
                                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                            }`}
                          >
                            <Play className="w-3.5 h-3.5" />
                            {quiz.isCompleted ? "Retake Challenge" : "Solve Challenge"}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800/60 cursor-not-allowed">
                            <Lock className="w-3.5 h-3.5" /> Locked
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Side: Quiz Instructions Card / Inspector */}
        <div className="lg:col-span-4 sticky top-6">
          {selectedQuiz ? (
            <QuizInstructionsCard quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Select a Challenge</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose any unlocked challenge on the left to review instructions, rules, and launch the proctored attempt.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
