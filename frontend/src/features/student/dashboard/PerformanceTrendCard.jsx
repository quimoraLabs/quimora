import { motion } from "motion/react";
import { TrendingUp, Sparkles } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
} from "recharts";

const PerformanceTrendCard = ({ dashboardStats, performanceData = [] }) => {
  // If only 1 data point exists, add a baseline reference so the area chart renders a gorgeous curve
  let displayData = performanceData;
  if (performanceData.length === 1 && performanceData[0].name !== "No Data") {
    displayData = [
      { name: "Baseline", score: Math.max(30, Math.round(performanceData[0].score * 0.85)) },
      performanceData[0],
    ];
  } else if (!performanceData.length) {
    displayData = [
      { name: "Start", score: 50 },
      { name: "Target", score: 75 },
    ];
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 sm:p-7 bg-surface border border-main rounded-3xl overflow-hidden relative shadow-sm"
    >
      {/* Background Accent Glow */}
      <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-2xs font-bold uppercase tracking-wider mb-1.5 border border-indigo-500/20">
            <TrendingUp className="w-3 h-3" />
            Accuracy & Elo Trajectory
          </div>
          <h2 className="text-xl font-bold text-main tracking-tight">
            Performance Trend
          </h2>
          <p className="text-xs text-muted">
            Continuous score progression and accuracy calibration across your attempts.
          </p>
        </div>

        <div className="rounded-2xl bg-main border border-main px-3.5 py-2 text-xs text-muted inline-flex items-center gap-2 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Predicted Next:{" "}
            <strong className="text-main">
              {dashboardStats?.predictedNextScore ?? "65"}%
            </strong>
          </span>
        </div>
      </div>

      {/* Area Chart */}
      <div className="w-full min-w-0">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800/80"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-slate-500 dark:text-slate-400"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "currentColor", fontSize: 11 }}
              domain={[0, 100]}
              className="text-slate-500 dark:text-slate-400"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 bg-surface/95 border border-main rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1">
                      <p className="font-bold text-main">{label}</p>
                      <p className="text-cyan-400 font-semibold">
                        Score: {payload[0].value}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fill="url(#performanceGradient)"
              activeDot={{ r: 6, fill: "#06b6d4", stroke: "#0f1422", strokeWidth: 2 }}
              dot={{ r: 4, fill: "#06b6d4" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PerformanceTrendCard;
