import React from 'react';
import { AnalyticsData, Technician } from '../types';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  Clock,
  DollarSign,
  BarChart,
  Users,
  CheckCircle,
} from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
  technicians: Technician[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, technicians }) => {
  const weekly = analytics?.weeklyTrend || [
    { day: 'Mon', jobs: 48, revenue: 24800 },
    { day: 'Tue', jobs: 54, revenue: 29100 },
    { day: 'Wed', jobs: 51, revenue: 26400 },
    { day: 'Thu', jobs: 62, revenue: 33800 },
    { day: 'Fri', jobs: 58, revenue: 31200 },
    { day: 'Sat', jobs: 35, revenue: 19500 },
    { day: 'Sun', jobs: 34, revenue: 19700 },
  ];

  const maxRevenue = Math.max(...weekly.map((w) => w.revenue));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          Operations Analytics & Service Level Commitments
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Historical KPI breakdown, revenue yield per technician hour, and contract SLA compliance.
        </p>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Monthly Revenue</span>
            <span className="text-emerald-400 font-medium">{analytics?.revenueGrowthMoM || '+18.4%'}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            ${analytics?.totalMonthlyRevenue?.toLocaleString() || '184,500'}
          </div>
          <div className="text-[11px] text-slate-500">Across commercial contracts</div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>First-Time Fix Rate</span>
            <CheckCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {analytics?.firstTimeFixRate || 91.2}%
          </div>
          <div className="text-[11px] text-slate-500">+4.2% since AI dispatch rollout</div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Mean Response Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {analytics?.avgResponseTimeMinutes || 28} min
          </div>
          <div className="text-[11px] text-slate-500">From ticket open to technician dispatch</div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active SLA Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {analytics?.activeSlaComplianceRate || 98.6}%
          </div>
          <div className="text-[11px] text-slate-500">Target contract threshold: 95.0%</div>
        </div>
      </div>

      {/* Visual Revenue & Volume Trend Chart */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Weekly Revenue & Ticket Velocity</h3>
            <p className="text-xs text-slate-400">Daily gross billings and closed work order counts</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm" /> Revenue ($)
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" /> Tickets Closed
            </span>
          </div>
        </div>

        {/* SVG/CSS Bar Chart */}
        <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-800">
          {weekly.map((w, idx) => {
            const heightPercent = Math.round((w.revenue / maxRevenue) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip on hover */}
                <div className="text-[10px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  ${(w.revenue / 1000).toFixed(1)}k
                </div>

                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* Revenue Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-1/2 max-w-[28px] bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all group-hover:brightness-110"
                  />
                  {/* Jobs Bar */}
                  <div
                    style={{ height: `${Math.round((w.jobs / 70) * 100)}%` }}
                    className="w-1/2 max-w-[28px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all group-hover:brightness-110"
                  />
                </div>

                <div className="text-xs text-slate-400 font-medium">{w.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Columns: Category Distribution & Crew Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Service Category Distribution</h3>
          <div className="space-y-3">
            {analytics?.categoryBreakdown?.map((cat, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>{cat.name}</span>
                  <span className="font-mono text-slate-400">
                    {cat.count} jobs ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${cat.percentage}%` }}
                    className="h-full bg-cyan-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technician Performance Leaderboard */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Field Crew Performance</h3>
          <div className="space-y-3">
            {technicians.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="font-semibold text-slate-200">{t.name}</div>
                    <div className="text-[11px] text-slate-400">{t.specialties.join(', ')}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-cyan-400 font-mono font-semibold">★ {t.rating}</div>
                  <div className="text-[10px] text-slate-500">{t.completedJobsToday} jobs today</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
