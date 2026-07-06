import { useEffect } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import useAttemptQuizStore from "../../../../store/useAttemptQuizStore";
import StatsCard from "../components/StatsCard";
import PerformanceTrend from "../components/PerformanceTrend";
import RecentAttempt from "../components/RecentAttempt";
import LatestResult from "../components/LatestResult";
import Leaderboard from "../components/Leaderboard";
import WeakestArea from "../components/WeakestArea";

function StudentDashboard() {
  const { dashboardStats, dashboardLoading, fetchDashboardStats } = useAttemptQuizStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Re-fetch stats when the window/tab regains focus or becomes visible again
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

  const stats = [
    {
      label: "Total Tests Taken",
      value: dashboardStats?.totalTestsTaken ?? 0,
      change: "Since last month",
      icon: Trophy,
    },
    {
      label: "Average Score",
      value: `${dashboardStats?.averageScore ?? 0}%`,
      change: "Weighted by performance",
      icon: CheckCircle2,
    },
    {
      label: "Best Score",
      value: `${dashboardStats?.maxScore ?? 0}%`,
      change: "Top achievement",
      icon: TrendingUp,
    },
    {
      label: "Lowest Score",
      value: `${dashboardStats?.minScore ?? 0}%`,
      change: "Opportunity gap",
      icon: Clock,
    },
  ];

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
    <div className="space-y-8 pb-20">
      <div className="flex flex-wrap gap-4">
        {stats.map((stat, index) => {
          
          return (
            <StatsCard key={stat.label} {...stat} index={index} Icon={stat.icon} />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <PerformanceTrend performanceData={performanceData} dashboardStats={dashboardStats} dashboardLoading={dashboardLoading} />
          <RecentAttempt recentAttempts={recentAttempts} dashboardLoading={dashboardLoading} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <LatestResult latestResult={latestResult} dashboardStats={dashboardStats} />

        <WeakestArea weakAreas={weakAreas} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-bg-surface border border-border-main rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-text-main">Leaderboard</h2>
                <p className="text-sm text-text-secondary">Top student performance in your class.</p>
              </div>
              <span className="text-xs uppercase tracking-[0.24em] text-text-secondary">Top 5</span>
            </div>

            <div className="space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry) => (
                  <Leaderboard key={entry.rank} entry={entry} />
                ))
              ) : (
                <p className="text-sm text-text-secondary">Leaderboard is empty for now.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;

