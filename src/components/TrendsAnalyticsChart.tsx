import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Calendar, 
  Filter, 
  Sparkles, 
  Activity 
} from 'lucide-react';
import { DailyTrendPoint } from '../types';

interface TrendsAnalyticsChartProps {
  data: DailyTrendPoint[];
}

type ViewMetric = 'all' | 'focus' | 'xp';
type TimeRange = 7 | 14 | 30;

export const TrendsAnalyticsChart: React.FC<TrendsAnalyticsChartProps> = ({ data }) => {
  const [metricView, setMetricView] = useState<ViewMetric>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>(30);

  // Slice data based on selected time range
  const filteredData = (data || []).slice(-timeRange);

  // Compute aggregate statistics
  const totalFocus = filteredData.reduce((acc, curr) => acc + (curr.focusMinutes || 0), 0);
  const totalXP = filteredData.reduce((acc, curr) => acc + (curr.xpGained || 0), 0);
  const activeDaysCount = filteredData.filter((d) => (d.focusMinutes || 0) > 0 || (d.xpGained || 0) > 0).length;
  const avgFocus = filteredData.length > 0 ? Math.round(totalFocus / filteredData.length) : 0;
  
  // Find peak day
  const peakDay = [...filteredData].sort((a, b) => (b.focusMinutes + b.xpGained) - (a.focusMinutes + a.xpGained))[0];

  // Custom Dark Mode Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const focusVal = payload.find((p: any) => p.dataKey === 'focusMinutes')?.value;
      const xpVal = payload.find((p: any) => p.dataKey === 'xpGained')?.value;

      return (
        <div className="bg-[#0D1527]/95 backdrop-blur-md border border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[170px]">
          <div className="text-slate-400 font-mono text-[11px] pb-1 border-b border-slate-800 flex items-center justify-between">
            <span className="text-white font-semibold">{label}</span>
            <span>Historical Log</span>
          </div>

          <div className="space-y-1.5 font-mono">
            {focusVal !== undefined && (
              <div className="flex items-center justify-between gap-3 text-amber-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Focus Time:</span>
                </span>
                <span className="font-bold tabular-nums">{focusVal} mins</span>
              </div>
            )}

            {xpVal !== undefined && (
              <div className="flex items-center justify-between gap-3 text-emerald-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>XP Gained:</span>
                </span>
                <span className="font-bold tabular-nums">+{xpVal} XP</span>
              </div>
            )}

            {focusVal && xpVal && focusVal > 0 ? (
              <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Efficiency:</span>
                <span className="text-cyan-300 font-semibold">{(xpVal / focusVal).toFixed(1)} XP/min</span>
              </div>
            ) : null}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-[#0D1527] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white tracking-tight">
              30-Day Cognitive Velocity & XP Trendline
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              · Dual-Axis Recharts Metric Tracker
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking daily focus block minutes (safety amber) and XP progression velocity (emerald) across recent study cycles.
          </p>
        </div>

        {/* View and Range Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Metric Filter */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setMetricView('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                metricView === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setMetricView('focus')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                metricView === 'focus'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-xs'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Focus
            </button>
            <button
              onClick={() => setMetricView('xp')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                metricView === 'xp'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-xs'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              XP
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px]">
            {([7, 14, 30] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeRange === r
                    ? 'bg-cyan-950/70 border border-cyan-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Focus Time</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {totalFocus}
            </span>
            <span className="text-xs text-amber-400 font-medium">min</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (~{(totalFocus / 60).toFixed(1)} hrs)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Focus Average</span>
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {avgFocus}
            </span>
            <span className="text-xs text-sky-400 font-medium">min/day</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>XP Accumulated</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              +{totalXP}
            </span>
            <span className="text-xs text-slate-400">XP</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peak Day</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5">
            <span className="text-sm font-bold text-slate-200">
              {peakDay ? peakDay.date : 'N/A'}
            </span>
            <div className="text-[11px] text-slate-400 font-mono truncate">
              {peakDay ? `${peakDay.focusMinutes}m · +${peakDay.xpGained} XP` : '0 min'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Line Graph Stage */}
      <div className="h-[280px] sm:h-[320px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            {/* Dark Grid Lines */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1E293B"
              vertical={false}
            />

            {/* X-Axis */}
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickMargin={8}
            />

            {/* Left Y-Axis: Focus Minutes (Safety Amber) */}
            {(metricView === 'all' || metricView === 'focus') && (
              <YAxis
                yAxisId="left"
                stroke="#F59E0B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}m`}
                domain={[0, 'dataMax + 15']}
              />
            )}

            {/* Right Y-Axis: XP Gain (Vivid Emerald) */}
            {(metricView === 'all' || metricView === 'xp') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}xp`}
                domain={[0, 'dataMax + 20']}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', color: '#94A3B8' }}
              formatter={(value) => {
                if (value === 'focusMinutes') return <span className="text-amber-300 font-medium">Daily Focus Minutes</span>;
                if (value === 'xpGained') return <span className="text-emerald-300 font-medium">Daily XP Gain</span>;
                return value;
              }}
            />

            {/* Focus Minutes Line */}
            {(metricView === 'all' || metricView === 'focus') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="focusMinutes"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={{ fill: '#F59E0B', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#F59E0B', stroke: '#090D16', strokeWidth: 2 }}
                name="focusMinutes"
              />
            )}

            {/* XP Gain Line */}
            {(metricView === 'all' || metricView === 'xp') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="xpGained"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#10B981', stroke: '#090D16', strokeWidth: 2 }}
                name="xpGained"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
