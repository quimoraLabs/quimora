// import React from 'react'
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";
import { Trophy, Clock, CheckCircle2, TrendingUp, ArrowUpRight, Calendar } from "lucide-react";


const performanceData = [
  { name: "Jan", score: 65 },
  { name: "Feb", score: 72 },
  { name: "Mar", score: 68 },
  { name: "Apr", score: 85 },
  { name: "May", score: 92 },
];

const distributionData = [
  { category: "Math", score: 88, average: 72 },
  { category: "Science", score: 94, average: 65 },
  { category: "History", score: 76, average: 80 },
  { category: "Coding", score: 92, average: 70 },
  { category: "English", score: 82, average: 75 },
];

const stats = [
  { label: "Academic Standing", value: "Top 2%", change: "Rank #14", icon: Trophy, color: "text-amber-400" },
  { label: "Quizzes Completed", value: "48", change: "+12% this month", icon: CheckCircle2, color: "text-green-400" },
  { label: "Mastery Index", value: "86.4", change: "+2.1 pts", icon: TrendingUp, color: "text-blue-400" },
  { label: "Study Velocity", value: "3.2h", change: "Daily average", icon: Clock, color: "text-purple-400" },
];

const recentAttempts = [
  { id: "1", quiz: "Organic Chemistry II", score: 94, date: "2 hours ago", status: "passed", trend: "up" },
  { id: "2", quiz: "Data Structures & Algorithms", score: 88, date: "Yesterday", status: "passed", trend: "down" },
  { id: "3", quiz: "Modern Art History", score: 62, date: "3 days ago", status: "failed", trend: "neutral" },
];

function StudentDashboard() {
  return (
    <div className="space-y-8 pb-20">
      {/* Header Stat Strip - Unique slim design */}
      <div className="flex flex-wrap gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex-1 min-w-60 px-6 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center gap-4 hover:border-neutral-700 transition-all group"
          >
            {/* <div className={cn("p-2 rounded-lg bg-neutral-800/50", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div> */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white tracking-tight">{stat.value}</span>
                <span className="text-[10px] text-neutral-400 font-medium">{stat.change}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Performance Chart */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-indigo-600" />
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">Consistency Metric</h2>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono uppercase font-bold border border-blue-500/20 tracking-tighter">Live Dataset</span>
                </div>
                <p className="text-sm text-neutral-500 italic font-serif">Rolling 5-month performance variance</p>
              </div>
            </div>
            
            <div className="h-85 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#171717" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#404040', fontSize: 10, fontFamily: 'monospace' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#404040', fontSize: 10, fontFamily: 'monospace' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace' }}
                    cursor={{ stroke: '#262626', strokeWidth: 2 }}
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    animationDuration={2500}
                  />
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
              <h2 className="text-xl font-bold text-white tracking-tight">Operational Record</h2>
              <button className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-[10px] uppercase tracking-widest font-bold text-neutral-400 hover:text-white transition-colors">Export .csv</button>
            </div>
            
            <div className="space-y-2">
              {recentAttempts.map((attempt) => (
                <div key={attempt.id} className="grid grid-cols-12 items-center p-4 rounded-xl hover:bg-white/2 transition-colors border border-transparent hover:border-neutral-800 group">
                  <div className="col-span-5 flex items-center gap-4">
                    <span className="text-[10px] font-mono text-neutral-600 font-bold">#{attempt.id.padStart(3, '0')}</span>
                    <span className="font-semibold text-neutral-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight text-xs">{attempt.quiz}</span>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      {/* <div className="h-1 flex-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-1000", attempt.score >= 80 ? "bg-green-500" : "bg-blue-500")} style={{ width: `${attempt.score}%` }} />
                      </div> */}
                      <span className="text-xs font-mono font-bold text-neutral-300 w-8">{attempt.score}%</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-[10px] font-mono text-neutral-600 whitespace-nowrap uppercase tracking-widest">{attempt.date}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <Link to={`/results/${attempt.id}`} className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-md text-[10px] uppercase font-bold text-blue-400 transition-colors">Audit</Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl relative overflow-hidden"
          >
             {/* Circular mastery widget */}
            <h2 className="text-lg font-bold text-white mb-8">Subject Mastery</h2>
            <div className="space-y-6">
              {distributionData.map((item, i) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono uppercase tracking-widest">
                    <span className="text-neutral-500 font-bold">{item.category}</span>
                    <span className="text-white">{item.score}%</span>
                  </div>
                  <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-blue-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-linear-to-br from-indigo-600 to-blue-700 rounded-3xl text-white shadow-xl shadow-blue-500/20 flex flex-col justify-between min-h-75"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-200" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-100">Next Deadline</span>
              </div>
              <h3 className="text-3xl font-bold leading-tight">Advanced Biochemistry Terminal</h3>
              <p className="text-blue-100 mt-2 text-sm opacity-80 leading-relaxed font-serif">Comprehensive module covering protein synthesis and enzymatic pathways.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono uppercase font-bold text-blue-200">Time Remaining</p>
                  <p className="text-2xl font-bold font-mono">14:24:08</p>
                </div>
                <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-lg hover:scale-105 transition-transform active:scale-95">
                  <ArrowUpRight size={24} />
                </button>
              </div>
            </div>
          </motion.div>
          
          <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl">
            <h2 className="text-lg font-bold text-white mb-6">Peer Activity</h2>
            <div className="space-y-6">
              {[
                { name: "Sarah K.", activity: "Scored 98% in Math", time: "2m ago" },
                { name: "David L.", activity: "Started Science Quiz", time: "15m ago" },
                { name: "Alex M.", activity: "Reached Tier 1 Rank", time: "1h ago" },
              ].map((peer, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-400 uppercase">
                    {peer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-200">{peer.name}</p>
                    <p className="text-[10px] text-neutral-500 font-mono italic mt-0.5">{peer.activity}</p>
                  </div>
                  <span className="ml-auto text-[8px] font-mono text-neutral-700 uppercase">{peer.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard