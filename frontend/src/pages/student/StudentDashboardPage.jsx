import { useEffect } from "react";
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
} from "lucide-react";
import useStudentQuizStore from "../../features/student/exam/store/useStudentQuizStore";
import PerformanceTrend from "../../features/student/dashboard/PerformanceTrendCard";
import RecentAttempt from "../../features/student/dashboard/RecentAttemptsCard";
import LatestResult from "../../features/student/dashboard/LatestResultCard";
import Leaderboard from "../../features/student/dashboard/LeaderboardItem";
import WeakestArea from "../../features/student/dashboard/WeakestAreasCard";
import StatCard from "../../components/common/StatCard";

/**
 * @desc    Student Dashboard Page
 * @route   /student/dashboard
 * @access  Private (Student only)
 * Displays student performance statistics, recent attempts, and leaderboard
 */
function StudentDashboardPage() {
  const { dashboardStats, dashboardLoading, fetchDashboardStats } = useStudentQuizStore();

  // Fetch dashboard stats on mount
  useEffect(() => {
    fetchDashboardStats();
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
      change: "+2 this week",
      icon: Trophy,
      gradient: "from-blue-500 to-indigo-600",
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColorClass: "bg-blue-50 dark:bg-blue-900/20",
      changeType: "positive",
    },
    {
      label: "Average Score",
      value: dashboardStats?.averageScore ?? 0,
      change: "+5.2% from last month",
      icon: CheckCircle2,
      gradient: "from-green-500 to-emerald-600",
      iconColor: "text-green-600 dark:text-green-400",
      bgColorClass: "bg-green-50 dark:bg-green-900/20",
      changeType: "positive",
    },
    {
      label: "Best Score",
      value: dashboardStats?.maxScore ?? 0,
      change: "New record! 🎉",
      icon: TrendingUp,
      gradient: "from-purple-500 to-violet-600",
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColorClass: "bg-purple-50 dark:bg-purple-900/20",
      changeType: "positive",
    },
    {
      label: "Lowest Score",
      value: dashboardStats?.minScore ?? 0,
      change: "-3.2% from best",
      icon: Clock,
      gradient: "from-orange-500 to-amber-600",
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColorClass: "bg-orange-50 dark:bg-orange-900/20",
      changeType: "negative",
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