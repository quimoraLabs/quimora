import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  BookOpen,
  Users,
  CheckCircle,
  BarChart3,
  Clock,
} from "lucide-react";
import StatsOverview from "../../features/instructor/dashboard/StatsOverview";
import RecentQuizzesTable from "../../features/instructor/dashboard/RecentQuizzesTable";
import AiGeneratorBanner from "../../features/instructor/dashboard/AiGeneratorBanner";

const InstructorDashboardPage = () => {
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: "Advanced React & Hooks Mastery",
      questions: 20,
      attempts: 342,
      avgScore: "82%",
      status: "Active",
    },
    {
      id: 2,
      title: "Data Structures & Algorithms (Basic)",
      questions: 15,
      attempts: 512,
      avgScore: "68%",
      status: "Active",
    },
    {
      id: 3,
      title: "Tailwind CSS & Modern UI Design",
      questions: 10,
      attempts: 189,
      avgScore: "91%",
      status: "Active",
    },
    {
      id: 4,
      title: "Node.js Fundamentals & REST APIs",
      questions: 25,
      attempts: 0,
      avgScore: "--",
      status: "Draft",
    },
  ]);

  const stats = [
    {
      title: "Total Quizzes",
      value: String(quizzes.length),
      change: "+3 this week",
      icon: BookOpen,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      title: "Active Students",
      value: "1,280",
      change: "+12% from last month",
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Total Attempts",
      value: "8,450",
      change: "+180 today",
      icon: CheckCircle,
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      title: "Avg. Score Rate",
      value: "76.4%",
      change: "+2.1% improvement",
      icon: BarChart3,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: "Aarav Sharma",
      action: "completed",
      quiz: "React Mastery",
      score: "95%",
      time: "2 mins ago",
    },
    {
      id: 2,
      user: "Priya Patel",
      action: "completed",
      quiz: "DSA Basic",
      score: "74%",
      time: "12 mins ago",
    },
    {
      id: 3,
      user: "Rohan Verma",
      action: "joined",
      quiz: "Tailwind CSS",
      score: null,
      time: "25 mins ago",
    },
  ];

  const handleQuizGenerated = (newQuiz) => {
    setQuizzes((prev) => [newQuiz, ...prev]);
  };

  return (
    <div className="min-h-screen bg-main text-main p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
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
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create New Quiz
          </motion.button>
        </div>

        {/* Modular Stats Grid */}
        <StatsOverview stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Quizzes Component */}
          <RecentQuizzesTable quizzes={quizzes} />

          {/* Activity Feed & AI Box */}
          <div className="space-y-6">
            {/* Live Feed */}
            <div className="bg-surface border border-main rounded-2xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h3 className="font-display text-lg font-semibold text-main">
                  Live Student Activity
                </h3>
              </div>

              <div className="space-y-3">
                {recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-elevated/60 border border-soft"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0">
                      {act.user.charAt(0)}
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="text-muted">
                        <span className="font-semibold text-main">
                          {act.user}
                        </span>{" "}
                        {act.action}{" "}
                        <span className="text-accent font-medium">
                          {act.quiz}
                        </span>
                      </p>
                      {act.score && (
                        <p className="text-muted mt-0.5">
                          Score:{" "}
                          <span className="text-emerald-500 font-semibold">
                            {act.score}
                          </span>
                        </p>
                      )}
                      <span className="text-[10px] text-muted flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {act.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Generator Banner & Modal */}
            <AiGeneratorBanner onQuizGenerated={handleQuizGenerated} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;
