// import React from 'react'
import { motion } from "framer-motion";

// ✅ SAHI TARIQA: Saare props ek hi object ke andar se destructure honge
function StatsCard({ label, value, change, index, Icon }) {
  return (
    <motion.div
      key={label}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }} // Ab index sahi kaam karega
      className="flex-1 min-w-55 px-6 py-5 bg-bg-surface border border-border-main rounded-3xl shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-text-main font-bold">
          {label}
        </p>
        <span className="p-2 rounded-2xl bg-bg-main text-text-secondary">
          {/* ✅ Agar Icon pass ho raha hai toh bina kisi jhanjhat ke render hoga */}
          {Icon && <Icon className="w-4 h-4" />}
        </span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-text-main tracking-tight">
          {value}
        </span>
      </div>
      <p className="mt-2 text-xs text-text-secondary">{change}</p>
    </motion.div>
  );
}

export default StatsCard;
