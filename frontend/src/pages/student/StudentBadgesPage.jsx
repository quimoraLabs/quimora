import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  Target,
  Crown,
  Shield,
  Star,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import Loader from "../../components/common/Loader";

export default function StudentBadgesPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [profRes, dashRes] = await Promise.all([
          axiosClient.get("/auth/me").catch(() => ({ data: {} })),
          axiosClient.get("/student/dashboard").catch(() => ({ data: { data: {} } })),
        ]);

        if (profRes.data) {
          setProfile(profRes.data.profile || profRes.data);
        }
        if (dashRes.data?.data) {
          setStats(dashRes.data.data);
        }
      } catch (err) {
        console.error("Error loading badges:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <Loader />;

  const totalTests = stats?.totalTestsTaken || profile?.totalAttempts || 0;
  const maxScore = stats?.maxScore || 0;
  const elo = stats?.overallElo || profile?.overallElo || 1000;

  // Define Badge Milestones
  const badges = [
    {
      id: "first_blood",
      title: "First Step",
      description: "Completed your first test in Quimora.",
      icon: Target,
      unlocked: totalTests >= 1,
      tier: "Bronze",
      color: "from-amber-600 to-amber-700",
      progress: Math.min(100, (totalTests / 1) * 100),
    },
    {
      id: "five_attempts",
      title: "Consistent Explorer",
      description: "Attempted 5 quizzes in your career.",
      icon: Flame,
      unlocked: totalTests >= 5,
      tier: "Silver",
      color: "from-slate-400 to-slate-600",
      progress: Math.min(100, (totalTests / 5) * 100),
    },
    {
      id: "ten_attempts",
      title: "Veteran Candidate",
      description: "Attempted 10+ quizzes across all categories.",
      icon: Trophy,
      unlocked: totalTests >= 10,
      tier: "Gold",
      color: "from-amber-400 to-yellow-500",
      progress: Math.min(100, (totalTests / 10) * 100),
    },
    {
      id: "high_accuracy",
      title: "Sharpshooter",
      description: "Achieved 80% or higher score in an examination.",
      icon: Zap,
      unlocked: maxScore >= 80,
      tier: "Gold",
      color: "from-yellow-400 to-amber-500",
      progress: Math.min(100, (maxScore / 80) * 100),
    },
    {
      id: "perfect_century",
      title: "Flawless Mastery",
      description: "Scored a perfect 100% in any proctored assessment.",
      icon: Crown,
      unlocked: maxScore >= 100,
      tier: "Platinum",
      color: "from-cyan-400 to-blue-500",
      progress: Math.min(100, maxScore),
    },
    {
      id: "intermediate_tier",
      title: "Calibrated Achiever",
      description: "Elevated your rating to 1100+ Elo.",
      icon: Shield,
      unlocked: elo >= 1100,
      tier: "Diamond",
      color: "from-indigo-500 to-purple-600",
      progress: Math.min(100, ((elo - 1000) / 100) * 100),
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="p-4 md:p-8 text-main min-h-screen space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-main pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            Milestones & Honors
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Badges & Achievements</h1>
          <p className="text-sm text-muted mt-1">
            Unlock distinguished badges as you test topics, maintain consistency, and elevate your Elo rating.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-main shadow-card w-fit">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-main">{unlockedCount} / {badges.length} Badges Unlocked</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => {
          const Icon = badge.icon;

          return (
            <div
              key={badge.id}
              className={`bg-surface rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                badge.unlocked
                  ? "border-indigo-500/30 shadow-card hover:border-indigo-500/50"
                  : "border-main opacity-75 grayscale hover:grayscale-0"
              }`}
            >
              {badge.unlocked && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              )}

              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md bg-linear-to-tr ${badge.color}`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${
                      badge.unlocked
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-main text-muted border border-main"
                    }`}
                  >
                    {badge.unlocked ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        UNLOCKED
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        LOCKED
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-main">{badge.title}</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">{badge.description}</p>
              </div>

              {/* Progress bar towards unlock */}
              <div className="mt-5 space-y-1.5 pt-3 border-t border-main">
                <div className="flex items-center justify-between text-2xs font-semibold text-muted">
                  <span>Requirement Progress</span>
                  <span className={badge.unlocked ? "text-emerald-500 font-bold" : "text-muted"}>
                    {Math.round(badge.progress)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-main overflow-hidden border border-main">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.unlocked ? "bg-emerald-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
