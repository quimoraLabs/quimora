import { motion } from "motion/react";
import { Play, ArrowRight, CheckCircle2, Trophy, Target, TrendingUp } from "lucide-react";

const HeroSection = () => {
  return (
 <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-slate-950">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-150 h-150 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-100 h-100 bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6">
              <TrendingUp className="w-4 h-4" />
              Test Your Skills. Unlock Your Potential.
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-gray-900 dark:text-white leading-[1.1] mb-8">
              Test your skills. <br />
              Learn where you <span className="text-indigo-600">stand.</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-lg leading-relaxed">
              Quimora is a skill testing platform with topic-wise quizzes, 
              real-world difficulty levels and instant results to help you grow better every day.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group">
                Start Test
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                Browse Topics
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 overflow-hidden bg-gray-200">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="text-gray-900 dark:text-white font-bold">Join 10,000+</span> learners <br />
                testing their skills daily
              </p>
            </div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Dashboard Card Preview */}
            <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 p-8 w-full max-w-md mx-auto overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center font-bold text-slate-900">JS</div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">JavaScript Basics</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Level</span>
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded-lg uppercase">Intermediate</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-center border border-gray-100 dark:border-slate-800">
                  <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">10</p>
                  <p className="text-[10px] font-medium text-gray-500 uppercase">Questions</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-center border border-gray-100 dark:border-slate-800">
                  <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">12</p>
                  <p className="text-[10px] font-medium text-gray-500 uppercase">Minutes</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl text-center border border-gray-100 dark:border-slate-800">
                  <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">80%</p>
                  <p className="text-[10px] font-medium text-gray-500 uppercase">Pass Score</p>
                </div>
              </div>

              {/* Progress skeleton lines */}
              <div className="space-y-4 mb-10">
                <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-indigo-600 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-3/4 bg-gray-100 dark:bg-slate-800 rounded-full" />
                  <div className="h-2 w-1/2 bg-gray-100 dark:bg-slate-800 rounded-full" />
                </div>
              </div>

              <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
                Start Quiz
                <Play className="w-4 h-4" />
              </button>
            </div>

            {/* Decorative Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-6 z-20 w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 flex items-center justify-center text-indigo-600"
            >
              <Trophy className="w-8 h-8" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 -right-10 z-20 w-14 h-14 bg-emerald-500 rounded-2xl shadow-xl flex items-center justify-center text-white"
            >
              <Target className="w-8 h-8" />
            </motion.div>

            <motion.div 
              animate={{ x: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-1/2 -left-12 z-20 w-12 h-12 bg-rose-500 rounded-2xl shadow-xl flex items-center justify-center text-white"
            >
              <CheckCircle2 className="w-7 h-7" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection