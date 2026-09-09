// Reports & Operations Analytics
// Plant KPIs, OEE Loss Analysis & First Pass Yield

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Layers, ShieldCheck, Gauge } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Today (Current Shifts)');

  const oeeTrendData = [
    { hour: '07:00', availability: 95, performance: 88, quality: 99, oee: 82.8 },
    { hour: '09:00', availability: 90, performance: 92, quality: 98, oee: 81.1 },
    { hour: '11:00', availability: 82, performance: 85, quality: 97, oee: 67.6 },
    { hour: '13:00', availability: 94, performance: 90, quality: 99, oee: 83.7 },
    { hour: '15:00', availability: 89, performance: 91, quality: 98, oee: 79.4 },
    { hour: '17:00', availability: 93, performance: 89, quality: 99, oee: 81.9 },
  ];

  const downtimePareto = [
    { reason: 'Feeder Jam / Mechanical', minutes: 35, cumulativePct: 41 },
    { reason: 'Sensor Interlock Lockout', minutes: 25, cumulativePct: 70 },
    { reason: 'Die Height Calibration', minutes: 15, cumulativePct: 88 },
    { reason: 'Material Shortage Delay', minutes: 10, cumulativePct: 100 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Performance Intelligence
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              FOUNDATION ONLY
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Reports & Operations Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Plant OEE trends, Downtime Pareto analysis, First Pass Yield (FPY), and MTBF / MTTR statistics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option>Today (Current Shifts)</option>
            <option>Past 7 Days</option>
            <option>This Month (M-T-D)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">Plant OEE Avg</span>
          <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">79.4%</span>
          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">+2.1% vs Target</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">First Pass Yield (FPY)</span>
          <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">98.4%</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Target: ≥ 98.0%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">MTTR (Avg Repair)</span>
          <span className="text-2xl font-black font-mono text-cyan-300 mt-1 block">22.5 min</span>
          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">-4.2m improvement</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 uppercase block">MTBF (Mean Time Between)</span>
          <span className="text-2xl font-black font-mono text-indigo-300 mt-1 block">184.2 hrs</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">High Reliability</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OEE Component Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>Intra-Day OEE & Component Trend</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={oeeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="availability" stroke="#38bdf8" name="Availability %" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="performance" stroke="#a78bfa" name="Performance %" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="oee" stroke="#f59e0b" name="Overall OEE %" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Downtime Pareto Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            <span>Downtime Loss Pareto (Minutes)</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downtimePareto} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="reason" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="minutes" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Downtime (Min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
