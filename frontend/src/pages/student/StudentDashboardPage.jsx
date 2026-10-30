import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Target,
  BarChart3,
  Users,
  BookOpen,
  Star,
  Sparkles,
  Coins,
} from "lucide-react";
import useStudentQuizStore from "../../features/student/exam/store/useStudentQuizStore";
import PerformanceTrend from "../../features/student/dashboard/PerformanceTrendCard";
import SkillRadarCard from "../../features/student/dashboard/SkillRadarCard";
import RecentAttempt from "../../features/student/dashboard/RecentAttemptsCard";
import DailyPracticeHeatmapCard from "../../features/student/dashboard/DailyPracticeHeatmapCard";
import LatestResult from "../../features/student/dashboard/LatestResultCard";
import LeaderboardCard from "../../features/student/dashboard/LeaderboardCard";
import WeakestArea from "../../features/student/dashboard/WeakestAreasCard";
import StatCard from "../../components/common/StatCard";
import InterestOnboardingModal from "../../features/student/components/InterestOnboardingModal";
import LevelBadge from "../../features/student/components/LevelBadge";
import axiosClient from "../../api/axiosClient";

/**
 * @desc    Student Dashboard Page
 * @route   /student/dashboard
 * @access  Private (Student only)
 * Displays student performance statistics, recent attempts, and leaderboard
 */
function StudentDashboardPage() {
  const { dashboardStats, dashboardLoading, fetchDashboardStats } = useStudentQuizStore();
  const [profileData, setProfileData] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get("/interests/student/profile");
      if (res.data?.success && res.data?.data) {
        setProfileData(res.data.data);
        if (!res.data.data.profile?.onboardingCompleted) {
          setShowOnboarding(true);
        }
      }
    } catch (err) {
      console.error("Failed to load student profile:", err);
    }
  };

  // Fetch dashboard stats & student profile on mount
  useEffect(() => {
    fetchDashboardStats();
    fetchProfile();
  }, [fetchDashboardStats]);

  // Re-fetch stats when window/tab regains focus
  useEffect(() => {
    const refresh = () => fetchDashboardStats();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refresh();
    });
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [fetchDashboardStats]);

  /**
   * Stats Card Configuration
   * 6 cards: Elo Rating, Coins Balance, Tests, Avg, Best, Lowest
   */
  const statsConfig = [
    {
      label: "Arena Elo Rating",
      value: `${dashboardStats?.overallElo ?? profileData?.profile?.overallElo ?? 1000} Elo`,
      change: `${dashboardStats?.levelName ?? profileData?.profile?.levelName ?? "Learner"} Tier`,
      icon: Zap,
      gradient: "from-indigo-600 to-violet-600",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgColorClass: "bg-indigo-50 dark:bg-indigo-900/20",
      changeType: "positive",
    },
    {
      label: "Quimora Coins",
      value: `${dashboardStats?.coinsBalance ?? profileData?.profile?.coinsBalance ?? 100}`,
      change: "Rewards & unlocks currency",
      icon: Coins,
      gradient: "from-amber-500 to-yellow-600",
      iconColor: "text-amber-500 dark:text-amber-400",
      bgColorClass: "bg-amber-50 dark:bg-amber-900/20",
      changeType: "positive",
    },
    {
      label: "Total Tests Taken",
      value: dashboardStats?.totalTestsTaken ?? 0,
      change: dashboardStats?.currentRank ? `Global Rank #${dashboardStats.currentRank}` : "Completed tests",
      icon: Trophy,
      gradient: "from-blue-500 to-indigo-600",
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColorClass: "bg-blue-50 dark:bg-blue-900/20",
      changeType: "positive",
    },
    {
      label: "Average Score",
      value: `${dashboardStats?.averageScore ?? 0}%`,
      change: "Overall test average",
      icon: CheckCircle2,
      gradient: "from-green-500 to-emerald-600",
      iconColor: "text-green-600 dark:text-green-400",
      bgColorClass: "bg-green-50 dark:bg-green-900/20",
      changeType: "positive",
    },
    {
      label: "Best Score",
      value: `${dashboardStats?.maxScore ?? 0}%`,
      change: "Highest score achieved",
      icon: TrendingUp,
      gradient: "from-purple-500 to-violet-600",
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColorClass: "bg-purple-50 dark:bg-purple-900/20",
      changeType: "positive",
    },
    {
      label: "Lowest Score",
      value: `${dashboardStats?.minScore ?? 0}%`,
      change: "Lowest score recorded",
      icon: Target,
      gradient: "from-orange-500 to-amber-600",
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColorClass: "bg-orange-50 dark:bg-orange-900/20",
      changeType: "neutral",
    },
  ];

  // Transform performance data for chart
  const performanceData =
    dashboardStats?.performanceTrend?.length > 0
      ? dashboardStats.performanceTrend.map((point) => ({
        name: point.label,
        score: point.score,
      }))
      : [{ name: "No Data", score: 0 }];

  const recentAttempts = dashboardStats?.recentHistory ?? [];
  const weakAreas = dashboardStats?.weakAreas ?? [];
  const leaderboard = dashboardStats?.leaderboard ?? [];
  const latestResult = dashboardStats?.latestResult;

  return (
    <div className="min-h-screen bg-main p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-main tracking-tight">
            👋 Welcome Back, Student!
          </h1>
          <p className="text-sm text-muted mt-1">
            Track your competitive quiz performance, Elo calibrations & domain tracks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted bg-surface px-3 py-1.5 rounded-full border border-main shadow-sm">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* ===== STATS GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsConfig.map((stat, index) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            gradient={stat.gradient}
            iconColor={stat.iconColor}
            bgColorClass={stat.bgColorClass}
            changeType={stat.changeType}
            index={index}
          />
        ))}
      </div>

      {/* ===== ADAPTIVE LEARNING & ELO SKILL TIERS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-surface/80 border border-main rounded-3xl backdrop-blur-md shadow-card relative overflow-hidden"
      >
        <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1.5 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Adaptive Elo Calibration
            </div>
            <h3 className="text-lg font-bold text-main">
              Your Active Learning Interests & Skill Tiers
            </h3>
            <p className="text-xs text-muted">
              Real-time Elo ratings (K=32) dynamically adapt difficulty based on your test performance.
            </p>
          </div>

          <button
            onClick={() => setShowOnboarding(true)}
            className="px-4 py-2 text-xs font-bold text-cyan-400 bg-elevated border border-cyan-500/30 rounded-xl hover:bg-cyan-500/10 transition-all shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            ⚙️ Edit Interests ({profileData?.profile?.interests?.length || 0}/10)
          </button>
        </div>

        {profileData?.profile?.interests?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {profileData.profile.interests.map((interest) => {
              // Find matching Elo rating for this interest
              const elo = profileData.eloRatings?.find(
                (r) => r.interestId?._id === interest._id || r.interestId === interest._id
              );
              const ratingValue = elo?.rating || 1000;

              return (
                <div
                  key={interest._id}
                  className="p-3.5 bg-elevated border border-main rounded-2xl shadow-xs flex items-center justify-between gap-3 hover:border-cyan-500/30 transition-all"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-main truncate">
                      {interest.name}
                    </p>
                    <p className="text-2xs text-muted truncate">
                      {interest.topicTags?.join(", ") || "General"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <LevelBadge elo={ratingValue} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs text-muted">
              No interests selected yet. Pick 5 to 6 interests to calibrate your personalized questions.
            </p>
          </div>
        )}
      </motion.div>

      {/* ===== INTEREST ONBOARDING MODAL ===== */}
      <InterestOnboardingModal
        isOpen={showOnboarding}
        initialSelectedIds={profileData?.profile?.interests?.map((i) => i._id || i.id) || []}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          fetchProfile();
        }}
      />

      {/* ===== DUAL ANALYTICS: ACCURACY PROGRESSION & SKILL RADAR MATRIX ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        {/* Performance Trend Area Chart */}
        <div className="xl:col-span-7">
          <PerformanceTrend
            performanceData={performanceData}
            dashboardStats={dashboardStats}
            dashboardLoading={dashboardLoading}
          />
        </div>

        {/* Multi-Skill Radar / Spider Web Chart */}
        <div className="xl:col-span-5">
          <SkillRadarCard
            profileData={profileData}
            weakAreas={weakAreas}
          />
        </div>
      </div>

      {/* ===== MAIN CONTENT GRID: RECENT ATTEMPTS & PERFORMANCE CARDS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* LEFT COLUMN (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          <RecentAttempt
            recentAttempts={recentAttempts}
            dashboardLoading={dashboardLoading}
          />

          <DailyPracticeHeatmapCard
            dailyActivity={dashboardStats?.dailyActivity}
            recentAttempts={recentAttempts}
          />
        </div>

        {/* RIGHT COLUMN (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Latest Result */}
          <LatestResult
            latestResult={latestResult}
            dashboardStats={dashboardStats}
          />

          {/* Weakest Areas */}
          <WeakestArea weakAreas={weakAreas} />

          {/* Leaderboard Card */}
          <LeaderboardCard
            leaderboard={leaderboard}
            dashboardLoading={dashboardLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default StudentDashboardPage;