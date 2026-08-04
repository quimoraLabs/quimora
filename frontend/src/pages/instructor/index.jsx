import {
  Plus,
  BookOpen,
  Users,
  CheckCircle,
  BarChart3,
  Clock,
  MoreVertical,
  ArrowUpRight,
  Sparkles,
  Zap,
} from "lucide-react";
import Card from "../../features/instructor/components/Card";

const InstructorDashboard = () => {
  const stats = [
    {
      title: "Total Quizzes",
      value: "24",
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

  const recentQuizzes = [
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
          <button className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Create New Quiz
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => {
           
            return (
              <Card key={idx} idx={idx} stat={stat} />
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Quizzes Table */}
          <div className="lg:col-span-2 bg-surface border border-main rounded-2xl p-5 sm:p-6 shadow-card">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-main">
                  Recent Quizzes
                </h3>
                <p className="text-muted text-xs">
                  Manage and view performance of active tests
                </p>
              </div>
              <button className="text-xs text-accent hover:underline font-medium flex items-center gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-muted">
                <thead className="bg-elevated text-muted text-xs uppercase tracking-wider border-b border-main">
                  <tr>
                    <th className="py-3 px-4">Quiz Title</th>
                    <th className="py-3 px-4">Attempts</th>
                    <th className="py-3 px-4">Avg. Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {recentQuizzes.map((quiz) => (
                    <tr
                      key={quiz.id}
                      className="hover:bg-elevated/50 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-main">
                        {quiz.title}
                        <div className="text-xs text-muted font-normal">
                          {quiz.questions} Questions
                        </div>
                      </td>
                      <td className="py-4 px-4">{quiz.attempts}</td>
                      <td className="py-4 px-4 font-semibold text-main">
                        {quiz.avgScore}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            quiz.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}
                        >
                          {quiz.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="p-1.5 text-muted hover:text-main rounded-lg hover:bg-elevated transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
                    className="flex items-start gap-3 p-3 rounded-xl bg-elevated/60 border border-soft transition-all"
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

            {/* AI Banner Box */}
            <div className="relative overflow-hidden bg-linear-to-br from-blue-900/40 via-purple-900/30 to-surface border border-blue-500/30 rounded-2xl p-5 shadow-card">
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-semibold text-emerald-400">
                <Zap className="w-3 h-3" /> 3 Free Generations
              </div>

              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <h4 className="font-display text-sm font-semibold text-main">
                  Generate Quiz with AI
                </h4>
              </div>

              <p className="text-muted text-xs mb-4 leading-relaxed">
                Save time by automatically generating questions from topics or
                text notes.
              </p>

              <button className="w-full py-2.5 bg-accent text-white rounded-xl text-xs font-semibold transition-all">
                Try AI Quiz Generator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
