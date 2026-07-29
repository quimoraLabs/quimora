import {motion} from "motion/react";
import { BarChart3 } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
} from "recharts";

const PerformanceTrend = ({ dashboardStats, performanceData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 bg-bg-surface border border-border-main rounded-3xl overflow-hidden"
    >
      {/* <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-sky-500 to-indigo-600" /> */}
      <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-main tracking-tight">
            Performance Trend
          </h2>
          <p className="text-sm text-text-secondary">
            Track your score progression and improve your weak areas.
          </p>
        </div>
        <div className="rounded-3xl bg-bg-main px-4 py-3 text-sm text-text-secondary inline-flex items-center gap-2">
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
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#1f1f1f"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8b95a1", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8b95a1", fontSize: 11 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a0a0a",
                border: "1px solid #2d2d2d",
                borderRadius: 10,
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#lineGradient)"
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PerformanceTrend;
