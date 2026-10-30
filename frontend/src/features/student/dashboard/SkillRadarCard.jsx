import { motion } from "motion/react";
import { Compass, Sparkles, Target } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/**
 * 🕸️ Multi-Skill Radar / Spider Web Chart
 * Visualizes student competency across active domain skills based on Elo calibration.
 */
export default function SkillRadarCard({ profileData, weakAreas = [] }) {
  // Extract interests & Elo to build radar metrics
  const rawInterests = profileData?.profile?.interests || [];
  const eloRatings = profileData?.eloRatings || [];

  // Default fallback domains if student hasn't selected interests or is fresh
  const DEFAULT_DOMAINS = [
    { subject: "Python", score: 65, fullMark: 100 },
    { subject: "Data Structures", score: 55, fullMark: 100 },
    { subject: "SQL & DB", score: 70, fullMark: 100 },
    { subject: "React & UI", score: 80, fullMark: 100 },
    { subject: "OOP & Logic", score: 60, fullMark: 100 },
    { subject: "Backend", score: 68, fullMark: 100 },
  ];

  let radarData = DEFAULT_DOMAINS;

  if (rawInterests.length >= 3) {
    radarData = rawInterests.slice(0, 6).map((interest) => {
      const elo = eloRatings.find(
        (r) => r.interestId?._id === interest._id || r.interestId === interest._id
      );
      const rating = elo?.rating || 1000;
      // Convert Elo (800 - 1800) to a calibrated mastery percentage (20% - 98%)
      const scorePercentage = Math.min(
        98,
        Math.max(25, Math.round(((rating - 700) / 1200) * 100))
      );

      return {
        subject: interest.name || "Topic",
        score: scorePercentage,
        fullMark: 100,
      };
    });
  }

  // Find top domain
  const topDomain = [...radarData].sort((a, b) => b.score - a.score)[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 sm:p-7 bg-surface border border-main rounded-3xl relative overflow-hidden shadow-sm flex flex-col justify-between"
    >
      {/* Subtle Neon Background Glow */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-2xs font-bold uppercase tracking-wider mb-1.5 border border-cyan-500/20">
            <Compass className="w-3 h-3" />
            Skill Radar
          </div>
          <h2 className="text-lg font-bold text-main tracking-tight">
            Domain Mastery Matrix
          </h2>
          <p className="text-xs text-muted">
            Calibrated competency spider-web across your core tracks.
          </p>
        </div>

        {topDomain && (
          <div className="text-right shrink-0">
            <span className="text-2xs font-bold text-muted uppercase tracking-wider block">
              Top Strength
            </span>
            <span className="text-xs font-bold text-cyan-400 truncate max-w-30 inline-block">
              {topDomain.subject} ({topDomain.score}%)
            </span>
          </div>
        )}
      </div>

      {/* Spider Web Radar Chart */}
      <div className="w-full h-64 sm:h-72 min-w-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: "currentColor",
                fontSize: 10,
                fontWeight: 600,
              }}
              className="text-slate-600 dark:text-slate-400"
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-2.5 bg-surface/95 border border-main rounded-xl shadow-xl backdrop-blur-md text-xs space-y-1">
                      <p className="font-bold text-main">{data.subject}</p>
                      <p className="text-cyan-400 font-semibold">
                        Mastery Index: {data.score}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="Mastery"
              dataKey="score"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fill="#6366f1"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Insight Tag */}
      <div className="mt-3 pt-3 border-t border-main/60 flex items-center justify-between text-2xs text-muted">
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span>Balanced Across {radarData.length} Subjects</span>
        </span>
        <span className="text-2xs text-muted">
          Dynamic Elo Mapping
        </span>
      </div>
    </motion.div>
  );
}
