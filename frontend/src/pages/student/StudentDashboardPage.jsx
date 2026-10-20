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
} from "lucide-react";
import useStudentQuizStore from "../../features/student/exam/store/useStudentQuizStore";
import PerformanceTrend from "../../features/student/dashboard/PerformanceTrendCard";
import RecentAttempt from "../../features/student/dashboard/RecentAttemptsCard";
import LatestResult from "../../features/student/dashboard/LatestResultCard";
import Leaderboard from "../../features/student/dashboard/LeaderboardItem";
import WeakestArea from "../../features/student/dashboard/WeakestAreasCard";
import StatCard from "../../components/common/StatCard";
import InterestOnboardingModal from "../../features/student/components/InterestOnboardingModal";
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
   * Each stat has: label, value, icon, color, subtitle
   */
  const statsConfig = [
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            👋 Welcome Back, Student!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your quiz performance and progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* ===== STATS GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
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
        className="p-6 bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-transparent border border-indigo-200/60 dark:border-indigo-900/40 rounded-3xl backdrop-blur-md shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Adaptive Elo Calibration
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Your Active Learning Interests & Skill Tiers
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Real-time Elo ratings ($K=32$) dynamically adapt difficulty based on your test performance.
            </p>
          </div>

          <button
            onClick={() => setShowOnboarding(true)}
            className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
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
                  className="p-3.5 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {interest.name}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                      {interest.topicTags?.join(", ") || "General"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
                      {ratingValue} Elo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No interests selected yet. Pick 5 to 6 interests to calibrate your personalized questions.
            </p>
          </div>
        )}
      </motion.div>

      {/* ===== INTEREST ONBOARDING MODAL ===== */}
      <InterestOnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          fetchProfile();
        }}
      />

      {/* ===== MAIN CONTENT GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* LEFT COLUMN (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Performance Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PerformanceTrend
              performanceData={performanceData}
              dashboardStats={dashboardStats}
              dashboardLoading={dashboardLoading}
            />
          </motion.div>

          {/* Recent Attempts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RecentAttempt
              recentAttempts={recentAttempts}
              dashboardLoading={dashboardLoading}
            />
          </motion.div>
        </div>

        {/* RIGHT COLUMN (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Latest Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <LatestResult
              latestResult={latestResult}
              dashboardStats={dashboardStats}
            />
          </motion.div>

          {/* Weakest Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <WeakestArea weakAreas={weakAreas} />
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Leaderboard
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Top student performance in your class
                </p>
              </div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                Top 5
              </span>
            </div>

            <div className="space-y-2">
              {dashboardLoading ? (
                // Skeleton loading
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="w-16 h-3 mt-1 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ))
              ) : leaderboard.length > 0 ? (
                leaderboard.map((entry) => (
                  <Leaderboard key={entry.rank} entry={entry} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Star className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No leaderboard data yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Complete a quiz to get on the board!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboardPage;