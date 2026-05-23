import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Trophy,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import useAttemptQuizStore from "../../../../store/useAttemptQuizStore";

function StudentDashboard() {
  const { dashboardStats, dashboardLoading, fetchDashboardStats } = useAttemptQuizStore();

  useEffect(() => {
    fetchDashboardStats();
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
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex-1 min-w-55 px-6 py-5 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
                  {stat.label}
                </p>
                <span className="p-2 rounded-2xl bg-neutral-800 text-sky-400">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white tracking-tight">{stat.value}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">{stat.change}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-sky-500 to-indigo-600" />
            <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Performance Trend</h2>
                <p className="text-sm text-neutral-500">Track your score progression and improve your weak areas.</p>
              </div>
              <div className="rounded-3xl bg-neutral-950 px-4 py-3 text-sm text-neutral-400 inline-flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                Predicted next: {dashboardStats?.predictedNextScore ?? "N/A"}%
              </div>
            </div>

            <div className="h-85 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#8b95a1", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8b95a1", fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0a0a",
                      border: "1px solid #2d2d2d",
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={2} fill="url(#lineGradient)" activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Recent Attempts</h2>
                <p className="text-sm text-neutral-500">Your latest completed tests, sorted by date.</p>
              </div>
              <button className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-white transition-colors">
                View all
              </button>
            </div>

            <div className="space-y-3">
              {dashboardLoading ? (
                <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center text-neutral-500">
                  Loading dashboard data...
                </div>
              ) : recentAttempts.length > 0 ? (
                recentAttempts.map((attempt, index) => (
                  <div
                    key={attempt.id ?? index}
                    className="grid grid-cols-12 items-center gap-4 p-4 rounded-3xl bg-neutral-950 border border-neutral-800"
                  >
                    <div className="col-span-5">
                      <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{attempt.quizTitle}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{attempt.score}%</p>
                    </div>
                    <div className="col-span-3 text-sm text-neutral-400">
                      {new Date(attempt.completedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="col-span-2 text-sm text-neutral-400">{attempt.status}</div>
                    <div className="col-span-2 text-right">
                      <Link
                        to={attempt.id ? `/results/${attempt.id}` : "#"}
                        className="text-xs uppercase tracking-[0.24em] text-sky-400 hover:text-sky-300"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center text-neutral-500">
                  No recent attempts available.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-white">Latest Result</h2>
                <p className="text-sm text-neutral-500">Your most recent completed quiz.</p>
              </div>
              <div className="rounded-3xl bg-slate-950 px-3 py-2 text-xs uppercase tracking-[0.3em] text-sky-400">
                Rank {dashboardStats?.currentRank ?? "N/A"}
              </div>
            </div>

            {latestResult ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-sm text-neutral-400">Quiz</p>
                  <p className="text-lg font-semibold text-white">{latestResult.quizTitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-neutral-950 p-4 border border-neutral-800">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-neutral-500">Score</p>
                    <p className="mt-2 text-3xl font-bold text-white">{latestResult.score}%</p>
                  </div>
                  <div className="rounded-3xl bg-neutral-950 p-4 border border-neutral-800">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-neutral-500">Correct</p>
                    <p className="mt-2 text-3xl font-bold text-white">{latestResult.correctAnswersCount}/{latestResult.totalQuestions}</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-neutral-950 p-4 border border-neutral-800">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-neutral-500">Completed</p>
                  <p className="mt-2 text-sm text-neutral-200">
                    {new Date(latestResult.completedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-8 text-center text-neutral-500">
                No completed quiz result yet.
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white">Weak Areas</h2>
              <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">Focus Now</span>
            </div>
            <div className="space-y-4">
              {weakAreas.length > 0 ? (
                weakAreas.map((area) => (
                  <div key={area.tag} className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-neutral-400">
                      <span>{area.tag}</span>
                      <span>{area.averageScore}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-950 overflow-hidden">
                      <div
                        className="h-full bg-sky-500"
                        style={{ width: `${Math.min(100, Math.max(0, 100 - area.averageScore))}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No weak areas to show yet.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-white">Leaderboard</h2>
                <p className="text-sm text-neutral-500">Top student performance in your class.</p>
              </div>
              <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">Top 5</span>
            </div>

            <div className="space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between gap-3 rounded-3xl border border-neutral-800 bg-neutral-950 p-4 ${entry.isMe ? "border-sky-500 bg-sky-500/10" : ""}`}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">#{entry.rank}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{entry.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{entry.averageScore}%</p>
                      <p className="text-[11px] text-neutral-500">{entry.totalTests} tests</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">Leaderboard is empty for now.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
// import React from 'react';
// import { useState } from 'react';
// import { motion } from 'framer-motion';

// // Mock Data
// const userStats = {
//   name: "Emery",
//   completed: 24,
//   totalAssigned: 30,
//   avgScore: 88,
//   globalRank: 12,
//   needsImprovement: [
//     { subject: "Organic Chemistry II", score: 58, focus: "Functional Groups", color: "bg-rose-500", track: "Medium • 30 Mins" },
//     { subject: "Intro to Neural Networks", score: 64, focus: "Backpropagation", color: "bg-amber-500", track: "Easy • 30 Mins" }
//   ],
//   leaderboard: [
//     { rank: 1, name: "Alex M.", score: 2940, isMe: false },
//     { rank: 2, name: "Sarah K.", score: 2810, isMe: false },
//     { rank: 3, name: "David L.", score: 2650, isMe: false },
//     { rank: 12, name: "Emery (You)", score: 2150, isMe: true },
//     { rank: 13, name: "Chris P.", score: 2110, isMe: false }
//   ]
// };

// export default function DesktopQuizDashboard() {
//   const completionPercentage = (userStats.completed / userStats.totalAssigned) * 100;

//   return (
//     <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800">


//         {/* 3. Scrollable Content Body */}
//         <main className="p-8 space-y-6 overflow-y-auto flex-1 max-w-350 w-full mx-auto">
          
//           {/* Row A: High-Level Analytics Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
//             {/* Stat Card 1: Completed Progress Ring */}
//             <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm flex items-center justify-between">
//               <div>
//                 <span className="text-xs font-bold dark:text-slate-100 text-slate-400 uppercase tracking-wider block">Total Progress</span>
//                 <span className="text-3xl font-black 
//                 dark:text-emerald-400
//                 text-slate-800 block mt-1">{userStats.completed}</span>
//                 <span className="text-xs dark:text-slate-300 text-slate-500 font-medium">Out of {userStats.totalAssigned} assigned tests</span>
//               </div>
//               <div className="relative w-16 h-16 flex items-center justify-center">
//                 <svg className="w-full h-full transform -rotate-90">
//                   <circle cx="32" cy="32" r="28" className="stroke-slate-100  fill-none" strokeWidth="5" />
//                   <motion.circle 
//                     cx="32" cy="32" r="28" className="stroke-blue-600 dark:stroke-blue-500 fill-none" strokeWidth="5"
//                     strokeDasharray={176}
//                     initial={{ strokeDashoffset: 176 }}
//                     animate={{ strokeDashoffset: 176 - (176 * completionPercentage) / 100 }}
//                     transition={{ duration: 1 }}
//                   />
//                 </svg>
//                 <span className="absolute text-[11px] font-black dark:text-slate-300 text-slate-700">{Math.round(completionPercentage)}%</span>
//               </div>
//             </div>

//             {/* Stat Card 2: Average Score */}
//             <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm flex items-center justify-between">
//               <div>
//                 <span className="text-xs font-bold dark:text-slate-100 text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
//                 <span className="text-3xl font-black 
//                 dark:text-emerald-400
//                 text-slate-800 block mt-1">{userStats.avgScore}%</span>
//                 <span className="text-xs dark:text-slate-300 text-slate-500 font-medium">Maintaining top tier grade</span>
//               </div>
//               <span className="text-3xl dark:bg-amber-100 bg-emerald-50 p-3 rounded-xl">🎯</span>
//             </div>

//             {/* Stat Card 3: Global Leaderboard Rank */}
//             <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm flex items-center justify-between">
//               <div>
//                 <span className="text-xs font-bold dark:text-slate-100 text-slate-400 uppercase tracking-wider block">Current Standings</span>
//                 <span className="text-3xl font-black 
//                 dark:text-blue-400
//                 text-blue-600 block mt-1">#{userStats.globalRank}</span>
//                 <span className="text-xs dark:text-slate-300 text-slate-500 font-medium">Ranked among all server users</span>
//               </div>
//               <span className="text-3xl dark:bg-blue-100 bg-blue-50 p-3 rounded-xl">🏆</span>
//             </div>
//           </div>

//           {/* Row B: Detailed Results Split View */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
//             {/* Left Column (Spans 2): Needs Improvement / Priority Practice */}
//             <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm space-y-4">
//               <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-600 pb-3">
//                 <div>
//                   <h2 className="text-base font-bold dark:text-slate-300 text-slate-800">⚠️ Critical Improvement Needed</h2>
//                   <p className="text-xs text-slate-400 mt-0.5">These topics fall below your 75% target benchmark threshold.</p>
//                 </div>
//                 <span className="text-xs bg-rose-50 dark:bg-rose-900 text-rose-600 dark:text-rose-300 font-bold px-2.5 py-1 rounded-lg">Action Required</span>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {userStats.needsImprovement.map((quiz, i) => (
//                   <div key={i} className="border border-slate-100 dark:border-slate-600 rounded-xl p-4 dark:bg-slate-700 bg-slate-50/50 flex flex-col justify-between space-y-4">
//                     <div className="space-y-1">
//                       <span className="text-[10px] text-slate-400 font-semibold uppercase">{quiz.track}</span>
//                       <h3 className="text-sm font-bold dark:text-slate-300 text-slate-800">{quiz.subject}</h3>
//                     </div>
                    
//                     <div className="space-y-1.5">
//                       <div className="flex justify-between text-xs font-bold">
//                         <span className="text-slate-500 dark:text-slate-300 ">Current Mastery</span>
//                         <span className="text-rose-600">{quiz.score}%</span>
//                       </div>
//                       <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
//                         <motion.div className={`h-full ${quiz.color}`} initial={{ width: 0 }} animate={{ width: `${quiz.score}%` }} transition={{ duration: 1 }} />
//                       </div>
//                     </div>
                    
//                     <div className="pt-2 border-t border-slate-100 dark:border-slate-600 text-xs text-slate-500 flex justify-between items-center">
//                       <span>Focus: <strong className="text-slate-700 dark:text-slate-300">{quiz.focus}</strong></span>
//                       <button className="text-blue-600 hover:text-blue-700 font-bold">Re-Take →</button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Right Column: Global Class Leaderboard */}
//             <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm overflow-hidden flex flex-col">
//               <div className="p-5 border-b border-slate-100 dark:border-slate-600 flex justify-between items-center">
//                 <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Class Leaderboard</h2>
//                 <span className="text-[11px] bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 font-bold px-2 py-0.5 rounded">XP System</span>
//               </div>
              
//               <div className="divide-y divide-slate-100 dark:divide-slate-600 flex-1 overflow-y-auto">
//                 {userStats.leaderboard.map((user, i) => (
//                   <div key={i} className={`px-5 py-3.5 flex items-center justify-between text-sm ${user.isMe ? 'dark:bg-slate-600 bg-blue-50/40 font-bold border-l-4 border-blue-600 pl-4' : ''}`}>
//                     <div className="flex items-center gap-3">
//                       <span className="w-6 text-center text-xs font-black dark:text-slate-300 text-slate-400">
//                         {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
//                       </span>
//                       <span className="font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
//                     </div>
//                     <span className="text-xs  text-slate-500 dark:text-slate-400 font-mono">{user.score} XP</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//   );
// }

