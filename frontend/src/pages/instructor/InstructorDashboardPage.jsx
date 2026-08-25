import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  BookOpen,
  Users,
  CheckCircle,
  BarChart3,
  Sparkles,
} from "lucide-react";
import Loader from "../../components/common/Loader";
import StatsOverview from "../../features/instructor/dashboard/components/StatsOverview";
import RecentQuizzesTable from "../../features/instructor/dashboard/components/RecentQuizzesTable";
import AiGeneratorBanner from "../../features/instructor/dashboard/components/AiGeneratorBanner";
import useInstructorDashboard from "../../features/instructor/dashboard/store/useInstructorDashboard";
import LiveActivityFeed from "../../features/instructor/dashboard/components/LiveActivityFeed";
import InstructorAnalyticsChart from "../../features/instructor/dashboard/components/InstructorAnalyticsChart";

const InstructorDashboardPage = () => {
  const { dashboardStats, dashboardLoading, fetchDashboardStats } =
    useInstructorDashboard();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (dashboardLoading && !dashboardStats) {
    return (
      <Loader/>
    );
  }

  const metrics = dashboardStats?.metrics || {
    totalQuizzes: 0,
    activeStudents: 0,
    totalAttempts: 0,
    avgScoreRate: 0,
  };

  const recentQuizzes = dashboardStats?.recentQuizzes || [];
  const liveActivities = dashboardStats?.liveActivities || [];
  const activityTrends = dashboardStats?.activityTrends || [];
  const scoreDistribution = dashboardStats?.scoreDistribution || [];

  const stats = [
    {
      title: "Total Quizzes",
      value: String(metrics.totalQuizzes),
      change: "+3 this week",
      icon: BookOpen,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      title: "Active Students",
      value: metrics.activeStudents.toLocaleString(),
      change: "+12% from last month",
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Total Attempts",
      value: metrics.totalAttempts.toLocaleString(),
      change: "+180 today",
      icon: CheckCircle,
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      title: "Avg. Score Rate",
      value: `${metrics.avgScoreRate}%`,
      change: "+2.1% improvement",
      icon: BarChart3,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-main text-main p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      <div className="mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-main pb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-main">
              Instructor Dashboard
            </h1>
            <p className="text-muted text-sm mt-1">
              Welcome back! Here's what's happening with your quizzes today.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl shadow-card transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Quiz
          </motion.button>
        </div>

        {/* Dynamic Stats Grid */}
        <StatsOverview stats={stats} />

        {/* Visual Graphical Analytics (Recharts) */}
        <InstructorAnalyticsChart
          activityTrends={activityTrends}
          scoreDistribution={scoreDistribution}
        />

        {/* Equal Height Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <RecentQuizzesTable quizzes={recentQuizzes} />
          <LiveActivityFeed liveActivities={liveActivities} />
        </div>

        {/* AI Generator Banner Section */}
        <div className="relative overflow-hidden bg-surface border border-main rounded-2xl p-6 shadow-card w-full transition-colors duration-300">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-start opacity-[0.12] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-brand-end opacity-[0.08] blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between z-10">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-accent">
                  Quimora AI
                </p>

                <h2 className="mt-1 font-display text-xl font-semibold text-main">
                  Create smarter quizzes with AI
                </h2>

                <p className="mt-1 max-w-2xl font-sans text-sm leading-6 text-muted">
                  Generate high-quality questions in seconds and tailor them to
                  your topic, difficulty, and learning goals.
                </p>
              </div>
            </div>

            <AiGeneratorBanner
              onQuizGenerated={fetchDashboardStats}
              buttonClassName="bg-accent shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;
