import React from "react";
import { motion } from "motion/react";
import { Target, AlertTriangle } from "lucide-react";

/**
 * 🎯 Weakest Areas / Calibration Priority Card
 */
const WeakestAreasCard = ({ weakAreas = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-surface border border-main rounded-3xl shadow-card"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-main flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-400" />
            Focus Areas
          </h2>
          <p className="text-xs text-muted">
            Topics needing practice & calibration
          </p>
        </div>
        <span className="text-2xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
          Needs Focus
        </span>
      </div>

      <div className="space-y-3">
        {weakAreas.length > 0 ? (
          weakAreas.map((area) => {
            const score = area.averageScore ?? 0;
            return (
              <div
                key={area.tag}
                className="p-3 bg-elevated/60 border border-main rounded-2xl space-y-2 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-main capitalize">{area.tag}</span>
                  <span
                    className={
                      score < 50
                        ? "text-rose-400"
                        : score < 70
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }
                  >
                    {score}% avg
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-main overflow-hidden border border-main">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score < 50
                        ? "bg-rose-500"
                        : score < 70
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, score)}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-muted">
            <p className="text-xs">No weak areas identified yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WeakestAreasCard;