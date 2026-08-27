import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CalendarDays } from 'lucide-react';

const NewUsersChart = ({ data = [] }) => {
  // Use useMemo to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (data && data.length > 0) {
      return data;
    }
    
    // Generate sample data only once
    const sampleData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      sampleData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: Math.floor(Math.random() * 10) + 1,
      });
    }
    return sampleData;
  }, [data]); // Only re-run if data changes

  const totalNewUsers = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-main p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-main">New Users (Last 7 Days)</h3>
          <p className="text-sm text-muted">
            <span className="font-bold text-main">{totalNewUsers}</span> new users joined
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted bg-elevated px-3 py-1.5 rounded-full border border-main">
          <CalendarDays className="w-4 h-4" />
          Last 7 days
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-main)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--color-text-muted)' }}
              formatter={(value) => [`${value} users`, 'New']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#userGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NewUsersChart;