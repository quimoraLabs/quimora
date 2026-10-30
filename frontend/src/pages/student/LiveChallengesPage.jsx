import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Clock,
  Zap,
  Play,
  CheckCircle,
  Calendar,
  Shield,
  Users,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

export default function LiveChallengesPage() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get("/api/v2/student/challenges");
      if (res.data?.success) {
        setChallenges(res.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load live challenges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleEnterChallenge = (challenge) => {
    if (!challenge.quiz?._id) return;
    navigate("/student/quiz/rules", {
      state: {
        quizId: challenge.quiz._id,
        title: challenge.title,
        timeLimit: challenge.quiz.timeLimit || 20,
        totalQuestions: challenge.quiz.questions?.length || 15,
        isContest: true,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-8 md:p-10 shadow-xl border border-white/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/20">
            <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" /> Live Contests & Cups
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Competitive Arenas</h1>
          <p className="text-sm text-amber-100 leading-relaxed">
            Participate in timed Weekly Sprints and Monthly Cups. Test your skills against students across the platform and rank on the global leaderboard.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading Contests...</p>
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Live Contests Right Now</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The next Weekly Sprint is being calibrated by the academic team. Check back soon or continue your domain tracks!
          </p>
          <button
            onClick={() => navigate("/student/quizzes")}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Explore Skill Tracks
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c) => {
            const isActive = c.status === "active";
            const isWeekly = c.type === "weekly_sprint";

            return (
              <div
                key={c._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-2xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        isWeekly
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                      }`}
                    >
                      {isWeekly ? "Weekly Sprint" : "Monthly Cup"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 animate-pulse"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {isActive ? "● Live Now" : "Upcoming"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{c.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {c.description || "Proctored live skill examination with live ranking and honors."}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> Duration:
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">{c.quiz?.timeLimit || 30} mins</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" /> Ends At:
                      </span>
                      <span>{new Date(c.endTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleEnterChallenge(c)}
                    disabled={!isActive}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                      isActive
                        ? "bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-amber-600/20"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isActive ? "Enter Contest" : "Contest Starts Soon"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
