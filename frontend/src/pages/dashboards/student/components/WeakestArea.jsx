// import React from 'react'
import { motion } from "motion/react";

const WeakestArea = ({ weakAreas }) => {
  return (
              <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-bg-surface border border-border-main rounded-3xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-text-main">Weak Areas</h2>
              <span className="text-xs uppercase tracking-[0.24em] text-text-secondary">Focus Now</span>
            </div>
            <div className="space-y-4">
              {weakAreas.length > 0 ? (
                weakAreas.map((area) => (
                  <div key={area.tag} className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-text-secondary">
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
  )
}

export default WeakestArea