import React, { useState } from 'react';
import { Job, Customer, Technician, AnalyticsData, AIRecommendation } from '../types';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  Phone,
  ShieldCheck,
  Radio,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardViewProps {
  jobs: Job[];
  customers: Customer[];
  technicians: Technician[];
  analytics: AnalyticsData | null;
  onSelectJob: (job: Job) => void;
  onOpenCreateJob: () => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  customers,
  technicians,
  analytics,
  onSelectJob,
  onOpenCreateJob,
  onOpenCopilotWithPrompt,
}) => {
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [activeRecommendation, setActiveRecommendation] = useState<AIRecommendation | null>({
    bestTechnician: {
      id: 'tech-3',
      name: 'Maya Chen',
      matchScore: 98,
      reasoning: 'Located 1.2 miles away in Downtown SF with available status, 4.98 rating, and full inventory of required differential airflow switches.',
      etaMinutes: 14,
    },
    preventiveAdvice: 'The Carrier AquaForce chiller at Metropolitan Data Centers is approaching its 6-year operational cycle. Recommend proposing a proactive condenser tube descaling package during today’s visit.',
    upsellOpportunity: 'High probability of closing a 2-year Enterprise Extended Warranty upgrade with Vance Logistics (+ $4,200 ARR).',
    slaRisk: 'WO-8849 has 74 minutes remaining before Enterprise SLA penalty. Alex Rivera is currently verifying system pressure on site.',
  });

  const runSmartTriage = async (jobId: string) => {
    setRecommendationLoading(true);
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      setActiveRecommendation(data);
    } catch (err) {
      console.error('Failed to run smart triage:', err);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const criticalJobs = jobs.filter((j) => j.priority === 'Critical' || j.priority === 'High');
  const unassignedJobs = jobs.filter((j) => j.status === 'Unassigned');

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & KPI row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Autonomous Dispatch & Fleet Overview
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Live Telematics</span>
            <span aria-hidden="true">·</span>
            <span>San Francisco Bay Area Service Region</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono">Telemetry Refreshed Just Now</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenCopilotWithPrompt('Run full operational audit on today\'s service queue and technician utilization')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Fleet Audit</span>
          </button>
          <button
            onClick={onOpenCreateJob}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Create Work Order
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/90 border border-slate-800/90 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Service Revenue</span>
            <span className="text-emerald-400 font-medium">{analytics?.revenueGrowthMoM || '+18.4%'}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            ${analytics?.totalMonthlyRevenue?.toLocaleString() || '184,500'}
          </div>
          <div className="text-[11px] text-slate-500">
            Across 342 billed commercial service contracts
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800/90 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>First-Time Fix Rate</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {analytics?.firstTimeFixRate || 91.2}%
          </div>
          <div className="text-[11px] text-slate-500">
            Industry standard benchmark: 76.0%
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800/90 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active SLA Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {analytics?.activeSlaComplianceRate || 98.6}%
          </div>
          <div className="text-[11px] text-slate-500">
            1 job nearing 2-hour window threshold
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 border border-slate-800/90 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Technician Utilization</span>
            <UserCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            {analytics?.technicianUtilizationRate || 88.5}%
          </div>
          <div className="text-[11px] text-slate-500">
            4 of 4 active crew members on scheduled routes
          </div>
        </div>
      </div>

      {/* AI Autonomous Intelligence & Smart Recommendation Box */}
      <div className="p-6 bg-slate-900/80 border border-cyan-900/50 rounded-2xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Aether Autonomous Intelligence Match Engine</span>
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Optimal Technician Routing & Predictive Maintenance Advice
            </h3>
          </div>
          <button
            onClick={() => runSmartTriage(unassignedJobs[0]?.id || jobs[0]?.id)}
            disabled={recommendationLoading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
          >
            {recommendationLoading ? 'Analyzing Telemetry...' : 'Refresh Recommendation'}
          </button>
        </div>

        {activeRecommendation && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium">Recommended Technician Match</div>
              <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span>{activeRecommendation.bestTechnician?.name || 'Maya Chen'}</span>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                  {activeRecommendation.bestTechnician?.matchScore || 98}% Fit
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeRecommendation.bestTechnician?.reasoning}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium">Predictive Equipment Advice</div>
              <div className="text-sm font-semibold text-amber-300">Carrier AquaForce Chiller</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeRecommendation.preventiveAdvice}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400 font-medium">SLA Risk Assessment</div>
              <div className="text-sm font-semibold text-rose-300">WO-8849 Thermal Excursion</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {activeRecommendation.slaRisk}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Live Jobs Queue & Field Crew Telematics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Work Orders Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-200">Live Work Orders Queue</h3>
              <span className="text-xs text-slate-500 font-mono">({jobs.length} tickets)</span>
            </div>
            <button
              onClick={() => onOpenCopilotWithPrompt('Triage all unassigned jobs and assign best available technicians')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>Auto-Triage with AI</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
            {jobs.slice(0, 5).map((job) => {
              const priorityColor =
                job.priority === 'Critical'
                  ? 'text-rose-400'
                  : job.priority === 'High'
                  ? 'text-amber-400'
                  : 'text-slate-400';

              const statusColor =
                job.status === 'Completed'
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50'
                  : job.status === 'In Progress'
                  ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50'
                  : job.status === 'En Route'
                  ? 'text-blue-400 bg-blue-950/60 border-blue-800/50'
                  : 'text-slate-400 bg-slate-800 border-slate-700';

              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-cyan-400 font-medium">{job.ticketNumber}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className={`font-medium ${priorityColor}`}>{job.priority} Priority</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-400">{job.category}</span>
                    </div>

                    <h4 className="text-sm font-medium text-slate-100 truncate">
                      {job.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{job.customerName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Assigned: {job.technicianName || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded border font-medium ${statusColor}`}>
                      {job.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Field Crew Telematics & Availability */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Field Crew Telematics</h3>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              GPS Live
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl divide-y divide-slate-800/80">
            {technicians.map((tech) => {
              const statusBg =
                tech.status === 'On Site'
                  ? 'text-amber-400'
                  : tech.status === 'En Route'
                  ? 'text-blue-400'
                  : 'text-emerald-400';

              return (
                <div key={tech.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={tech.avatar}
                        alt={tech.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-200">{tech.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{tech.location.area}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${statusBg}`}>
                      {tech.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Rating: ★ {tech.rating}</span>
                    <span>Completed Today: {tech.completedJobsToday}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-1">
                    {tech.specialties.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
