// import React from 'react'
import { motion } from "motion/react";
import { LayoutGrid, BarChart3, Trophy } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <LayoutGrid className="w-8 h-8" />,
      title: "Choose Topic",
      description: "Pick a topic from various categories that you want to test.",
      step: 1,
      color: "bg-indigo-600",
      lightColor: "bg-indigo-100",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Pick Difficulty",
      description: "Select your preferred difficulty level and start the quiz.",
      step: 2,
      color: "bg-rose-500",
      lightColor: "bg-rose-100",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Get Instant Result",
      description: "See your score, correct answers and improve your skills.",
      step: 3,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-100",
    },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            How it works
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Get started in 3 simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-gray-200 dark:border-slate-800 -translate-y-12 z-0" />

          {steps.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className={`w-20 h-20 rounded-2xl ${item.color} text-white flex items-center justify-center mb-6 shadow-xl shadow-${item.color}/20 group-hover:scale-110 transition-transform`}>
                {item.icon}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-950 rounded-full border-2 border-gray-100 dark:border-slate-800 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white">
                  {item.step}
                </div>
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-xs">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks