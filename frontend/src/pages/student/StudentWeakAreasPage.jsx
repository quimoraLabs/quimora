import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Clock,
  Compass,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

export default function StudentWeakAreasPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [practiceData, setPracticeData] = useState(null);
  const [settingTarget, setSettingTarget] = useState(false);
  const [startingMode, setStartingMode] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/practice/status");
      if (res.data?.success) {
        setPracticeData(res.data.data);
      }
    } catch (err) {
      console.error("Error loading practice status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSetTarget = async (targetVal) => {
    try {
      setSettingTarget(true);
      const res = await axiosClient.post("/practice/custom-target", {
        target: targetVal,
      });
      if (res.data?.success) {
        toast.success(`Today's target set to ${targetVal} practice drills!`);
        fetchStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set target");
    } finally {
      setSettingTarget(false);
    }
  };

  // Trigger Mode 1 (Random Mind-Game)
  const handleStartMode1 = async () => {
    try {
      setStartingMode("mode1");
      const res = await axiosClient.post("/practice/mode1/start");
      if (res.data?.success) {
        sessionStorage.setItem("activePracticeSession", JSON.stringify(res.data.data));
        navigate("/student/practice/room");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start Mind-Game");
    } finally {
      setStartingMode(null);
    }
  };

  // Trigger Mode 2 (Custom Targeted Drill)
  const handleStartMode2 = async (topicTag) => {
    if (!practiceData?.mode2_customPractice?.targetSetToday) {
      toast.error("Please commit to today's practice target (1 to 4 drills) first!");
      return;
    }
    if (practiceData.mode2_customPractice.attemptsRemaining <= 0) {
      toast.error("Today's target achieved! Resets at midnight.");
      return;
    }

    try {
      setStartingMode(topicTag);
      const res = await axiosClient.post("/practice/mode2/start", {
        scopeType: "topic",
        targetName: topicTag,
      });
      if (res.data?.success) {
        sessionStorage.setItem("activePracticeSession", JSON.stringify(res.data.data));
        navigate("/student/practice/room");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start custom drill");
    } finally {
      setStartingMode(null);
    }
  };

  if (loading) return <Loader />;

  const { profile, mode1_randomMindGame, mode2_customPractice, topicMastery, readiness } =
    practiceData || {};

  return (
    <div className="p-4 md:p-8 text-main min-h-screen space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-soft pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/20">
            <Target className="w-3.5 h-3.5" />
            Remedial Practice Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Weak Areas & Practice</h1>
          <p className="text-sm text-muted mt-1">
            Separate diagnostic drills to master concepts without burning your 3/3 Main Certification attempts.
          </p>
        </div>

        {/* Readiness Badge */}
        <div className="p-4 bg-surface border border-soft rounded-2xl flex items-center gap-3 shadow-xs max-w-md">
          <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
          <p className="text-xs font-medium text-main leading-relaxed">
            {readiness?.message || "Diagnostic practice recommended on critical topics before attempting Main Exam."}
          </p>
        </div>
      </div>

      {/* Practice Scoreboard Widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-soft rounded-2xl p-5 shadow-xs">
          <span className="text-2xs font-bold text-muted uppercase tracking-wider">Practice Level</span>
          <div className="text-2xl font-black text-main mt-1">Level {profile?.practiceLevel || 1}</div>
          <div className="mt-3">
            <div className="flex justify-between text-2xs font-semibold text-muted mb-1">
              <span>XP: {profile?.practiceXp || 0}</span>
              <span>{profile?.levelProgressPercent || 0}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${profile?.levelProgressPercent || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-soft rounded-2xl p-5 shadow-xs">
          <span className="text-2xs font-bold text-muted uppercase tracking-wider">Practice Streak</span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-2">
            <span>{profile?.currentStreak || 0} Days</span>
            <span className="text-lg">🔥</span>
          </div>
          <p className="text-xs text-muted mt-2">Active practice daily streak</p>
        </div>

        <div className="bg-surface border border-soft rounded-2xl p-5 shadow-xs md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold text-muted uppercase tracking-wider">
                Mode 2: Daily Target (IST Midnight Reset)
              </span>
              <span className="text-2xs font-semibold text-muted">Date: {mode2_customPractice?.dateIST}</span>
            </div>

            {mode2_customPractice?.targetSetToday ? (
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <div className="text-xl font-black text-main">
                    {mode2_customPractice?.attemptsDoneToday} / {mode2_customPractice?.dailyTarget} Drills Done
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {mode2_customPractice?.attemptsRemaining} remaining for today
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    10 Mins / Drill
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-xs font-semibold text-rose-500">
                  Target not set today! Select your commitment:
                </p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleSetTarget(t)}
                      disabled={settingTarget}
                      className="flex-1 py-1.5 px-3 rounded-xl border border-soft hover:border-accent font-bold text-xs hover:bg-accent hover:text-white transition-all cursor-pointer"
                    >
                      {t} {t === 1 ? "Drill" : "Drills"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode 1: Random Mind-Game Banner */}
      <div className="bg-linear-to-r from-amber-600 via-orange-600 to-rose-600 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-current" /> Mode 1: Auto Surprise
          </div>
          <h2 className="text-2xl font-black">Daily Random Mind-Game</h2>
          <p className="text-xs text-amber-100 leading-relaxed">
            Fresh diagnostic questions generated across your enrolled courses. 10 to 15 quick mystery questions once every calendar day!
          </p>

          {/* Show Last Result if Completed Today */}
          {mode1_randomMindGame?.completedToday && mode1_randomMindGame.lastResult && (
            <div className="mt-3 p-3 bg-black/20 rounded-xl backdrop-blur-xs flex items-center gap-4 text-xs">
              <span>Today's Score: <strong className="text-amber-200">{mode1_randomMindGame.lastResult.score}%</strong></span>
              <span>•</span>
              <span>Correct: <strong>{mode1_randomMindGame.lastResult.correctCount}/{mode1_randomMindGame.lastResult.totalQuestions}</strong></span>
              <span>•</span>
              <span className="text-emerald-200 font-semibold">Done for today!</span>
            </div>
          )}
        </div>

        <div>
          {mode1_randomMindGame?.available ? (
            <button
              onClick={handleStartMode1}
              disabled={startingMode === "mode1"}
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{startingMode === "mode1" ? "Generating..." : "Play Today's Mind-Game"}</span>
            </button>
          ) : (
            <div className="px-5 py-3 bg-white/20 backdrop-blur-md rounded-2xl text-xs font-bold text-white text-center">
              ✓ Completed Today! Returns tomorrow
            </div>
          )}
        </div>
      </div>

      {/* Mode 2: Targeted Topics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-main">Mode 2: Targeted Weak Areas</h2>
            <p className="text-xs text-muted">
              Auto-detected topics where your exam score dropped below 60%. Run a 10-minute diagnostic drill to master them.
            </p>
          </div>
        </div>

        {(() => {
          const criticalWeakAreas = topicMastery?.filter(
            (t) => t.status === "critical" || (t.accuracy !== undefined && t.accuracy < 60)
          ) || [];

          return criticalWeakAreas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {criticalWeakAreas.map((tm, idx) => (
                <div
                  key={idx}
                  className="bg-surface border border-rose-500/20 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-main">{tm.topicTag}</span>
                      <span className="text-2xs font-extrabold px-2 py-0.5 rounded-md uppercase border bg-rose-500/10 text-rose-600 border-rose-500/20">
                        {tm.accuracy < 60 ? "Critical (<60%)" : tm.status}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-muted">Exam Accuracy</span>
                        <span className="text-main font-bold">{tm.accuracy}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all bg-rose-500"
                          style={{ width: `${tm.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartMode2(tm.topicTag)}
                    disabled={startingMode === tm.topicTag}
                    className="w-full py-2.5 px-4 bg-accent hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{startingMode === tm.topicTag ? "Starting..." : "Practice 10-Min Remedial Drill"}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-surface border border-soft rounded-3xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-main">No Critical Weak Areas Recorded</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Your concept accuracy across certification quizzes is healthy (≥ 60%)! Weak areas only appear when exam accuracy falls below 60%. You can still launch voluntary diagnostic drills below.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {["React Components", "Async & Promises", "CSS Grid & Flexbox", "State Architecture"].map(
                  (topic) => (
                    <button
                      key={topic}
                      onClick={() => handleStartMode2(topic)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-main text-xs font-semibold hover:bg-accent hover:text-white transition-all cursor-pointer"
                    >
                      Drill: {topic}
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
