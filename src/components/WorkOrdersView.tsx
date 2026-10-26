import React, { useState } from 'react';
import { Job, Customer, Technician, AIWorkSummary } from '../types';
import {
  Search,
  Filter,
  Plus,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle,
  FileText,
  User,
  Wrench,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';

interface WorkOrdersViewProps {
  jobs: Job[];
  customers: Customer[];
  technicians: Technician[];
  onOpenCreateJob: () => void;
  onUpdateJob: (updated: Job) => void;
  selectedJob: Job | null;
  setSelectedJob: (job: Job | null) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  jobs,
  customers,
  technicians,
  onOpenCreateJob,
  onUpdateJob,
  selectedJob,
  setSelectedJob,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<AIWorkSummary | null>(null);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || job.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusChange = async (job: Job, newStatus: Job['status']) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      onUpdateJob(data);
      if (selectedJob?.id === job.id) {
        setSelectedJob(data);
      }
    } catch (err) {
      console.error('Failed to update job status:', err);
    }
  };

  const handleAssignTech = async (job: Job, techId: string) => {
    const tech = technicians.find((t) => t.id === techId);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: tech ? tech.id : null,
          technicianName: tech ? tech.name : null,
          status: tech ? 'Dispatched' : 'Unassigned',
        }),
      });
      const data = await res.json();
      onUpdateJob(data);
      if (selectedJob?.id === job.id) {
        setSelectedJob(data);
      }
    } catch (err) {
      console.error('Failed to assign technician:', err);
    }
  };

  const generateJobAISummary = async (job: Job) => {
    setAiSummaryLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          customerName: job.customerName,
          notes: job.notes,
        }),
      });
      const data = await res.json();
      setGeneratedSummary(data);
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Work Orders & Field Operations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch, track, and close commercial service orders with automated line-item reconciliation.
          </p>
        </div>

        <button
          onClick={onOpenCreateJob}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket #, client company, equipment..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filter Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
          {['ALL', 'Unassigned', 'Dispatched', 'In Progress', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s === 'ALL' ? 'All Statuses' : s}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Categories</option>
          <option value="HVAC">HVAC</option>
          <option value="Refrigeration">Refrigeration</option>
          <option value="Industrial Automation">Industrial Automation</option>
          <option value="Electrical">Electrical</option>
          <option value="Hydraulics">Hydraulics</option>
        </select>
      </div>

      {/* Main Content Layout: Table & Slide-Over Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Orders List / Table */}
        <div className={`space-y-3 ${selectedJob ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No work orders matched the active filter criteria.
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const priorityColor =
                  job.priority === 'Critical'
                    ? 'text-rose-400 font-semibold'
                    : job.priority === 'High'
                    ? 'text-amber-400 font-medium'
                    : 'text-slate-400';

                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job);
                      setGeneratedSummary(null);
                    }}
                    className={`p-4 hover:bg-slate-800/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected ? 'bg-slate-800/70 border-l-2 border-l-cyan-400' : ''
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-cyan-400 font-semibold">{job.ticketNumber}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className={priorityColor}>{job.priority} Priority</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-400">{job.category}</span>
                      </div>

                      <h4 className="text-sm font-medium text-slate-100 truncate">
                        {job.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="text-slate-300 font-medium">{job.customerName}</span>
                        <span aria-hidden="true">·</span>
                        <span>Tech: {job.technicianName || 'Unassigned'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">${job.costEstimate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded border border-slate-700 bg-slate-800/80 text-slate-200">
                        {job.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Job Inspector Drawer */}
        {selectedJob && (
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                  <span>{selectedJob.ticketNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedJob.category}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mt-1">
                  {selectedJob.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status & Technician Quick Actions */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Order Lifecycle Status</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {(['Unassigned', 'Dispatched', 'En Route', 'In Progress', 'Completed'] as Job['status'][]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedJob, st)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium border text-left transition-colors ${
                          selectedJob.status === st
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Assign Field Technician</label>
                <select
                  value={selectedJob.technicianId || ''}
                  onChange={(e) => handleAssignTech(selectedJob, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Unassigned</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status} - {t.location.area})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Client & Address Info */}
            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-slate-300">{selectedJob.customerAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-400">
                  Est. Duration: {selectedJob.estimatedDurationHours} hrs · SLA Deadline: 2h remaining
                </span>
              </div>
            </div>

            {/* Field Notes & Parts */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Technician Field Notes</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                {selectedJob.notes || 'No field notes provided yet.'}
              </p>

              {selectedJob.partsRequired && selectedJob.partsRequired.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-xs text-slate-400">Parts Required</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedJob.partsRequired.map((p) => (
                      <span key={p} className="text-[11px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.customerSignature && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-xs text-emerald-300">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Customer Sign-off Verified</span>
                  </div>
                  <div className="text-[11px] text-emerald-400/80 mt-0.5">
                    {selectedJob.customerSignature}
                  </div>
                </div>
              )}
            </div>

            {/* AI Summary Generator Action */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <button
                onClick={() => generateJobAISummary(selectedJob)}
                disabled={aiSummaryLoading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>{aiSummaryLoading ? 'Distilling Work Order with AI...' : 'Generate AI Executive Summary & Invoice'}</span>
              </button>

              {generatedSummary && (
                <div className="p-4 bg-slate-950 border border-cyan-900/60 rounded-xl space-y-3 text-xs">
                  <div>
                    <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Executive Summary</div>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {generatedSummary.executiveSummary}
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Root Cause Analysis</div>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">
                      {generatedSummary.rootCause}
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-400">Action Items</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300 mt-1">
                      {generatedSummary.actionItems.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
                    <span className="text-slate-400">Total Billed:</span>
                    <span className="text-cyan-300 font-bold">{generatedSummary.totalCost}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
