import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-main p-3 rounded-xl shadow-xl text-xs font-sans">
        <p className="font-bold text-main mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: <strong className="text-main">{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function InstructorAnalyticsChart({ activityTrends = [], scoreDistribution = [] }) {
  const hasActivityData = activityTrends.some((d) => d.attempts > 0);
  const hasDistributionData = scoreDistribution.some((d) => d.count > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* 7-Day Activity Trend (Area Chart) */}
      <div className="lg:col-span-7 bg-surface border border-main rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-main">
          <div>
            <h3 className="text-base font-bold text-main font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              7-Day Submissions Trend
            </h3>
            <p className="text-xs text-muted">Daily exam attempts across all your active quizzes.</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          {activityTrends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted">
              Loading trends...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="attempts"
                  name="Exam Attempts"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAttempts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Score Performance Distribution (Bar Chart) */}
      <div className="lg:col-span-5 bg-surface border border-main rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-main">
          <div>
            <h3 className="text-base font-bold text-main font-display flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Score Distribution
            </h3>
            <p className="text-xs text-muted">Student percentage grade buckets.</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          {scoreDistribution.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted">
              Loading distribution...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Students"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
