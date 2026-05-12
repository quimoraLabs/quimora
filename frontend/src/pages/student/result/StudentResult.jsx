// import React from 'react'

import { ArrowUpRight, Calendar } from "lucide-react";
import { motion } from "motion/react";

const distributionData = [
  { category: "Math", score: 88, average: 72 },
  { category: "Science", score: 94, average: 65 },
  { category: "History", score: 76, average: 80 },
  { category: "Coding", score: 92, average: 70 },
  { category: "English", score: 82, average: 75 },
];
function StudentResult() {
  return (
    <div className="space-y-8 pb-20">
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
  )
}

export default StudentResult