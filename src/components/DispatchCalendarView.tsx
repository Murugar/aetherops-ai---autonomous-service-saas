import React, { useState } from 'react';
import { Technician, Job } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  Navigation,
  CheckCircle,
  AlertCircle,
  Truck,
} from 'lucide-react';

interface DispatchCalendarViewProps {
  technicians: Technician[];
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}

export const DispatchCalendarView: React.FC<DispatchCalendarViewProps> = ({
  technicians,
  jobs,
  onSelectJob,
}) => {
  const [selectedDay, setSelectedDay] = useState('Today, Oct 26');
  const [routeOptimized, setRouteOptimized] = useState(false);
  const [optimizationSaving, setOptimizationSaving] = useState({ miles: 34.2, minutes: 52, fuel: '$28.40' });

  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  const handleOptimizeRoutes = () => {
    setRouteOptimized(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Dispatch Timeline & Route Scheduling
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic crew allocation with AI-driven waypoint clustering and traffic-aware dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOptimizeRoutes}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              routeOptimized
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{routeOptimized ? 'Routes AI Optimized' : 'Run Route Optimizer'}</span>
          </button>
        </div>
      </div>

      {/* Route Optimization Savings Banner */}
      {routeOptimized && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-emerald-200">
                AI Dispatch Routing Engine Executed Successfully
              </div>
              <div className="text-emerald-400/80">
                Re-sequenced service stops based on live Caltrans traffic and parts inventory proximity.
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 font-mono font-bold text-slate-200">
            <span>Saved {optimizationSaving.miles} mi</span>
            <span>·</span>
            <span>Saved {optimizationSaving.minutes} min</span>
            <span>·</span>
            <span className="text-emerald-400">-{optimizationSaving.fuel} fuel</span>
          </div>
        </div>
      )}

      {/* Timeline Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Timeline Header Row */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/70 p-3 text-xs font-semibold text-slate-400">
            <div className="col-span-2">Technician & Vehicle</div>
            {hours.map((hr) => (
              <div key={hr} className="text-center font-mono">
                {hr}
              </div>
            ))}
          </div>

          {/* Technician Rows */}
          <div className="divide-y divide-slate-800/80">
            {technicians.map((tech) => {
              const techJobs = jobs.filter((j) => j.technicianId === tech.id);

              return (
                <div key={tech.id} className="grid grid-cols-7 p-4 items-center hover:bg-slate-800/30 transition-colors">
                  {/* Tech Profile Column */}
                  <div className="col-span-2 flex items-center gap-3 pr-4">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{tech.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{tech.location.area}</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                        Status: {tech.status}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Slots (5 columns) */}
                  <div className="col-span-5 grid grid-cols-5 gap-2">
                    {techJobs.length > 0 ? (
                      techJobs.map((job) => (
                        <div
                          key={job.id}
                          onClick={() => onSelectJob(job)}
                          className="col-span-2 p-2.5 bg-slate-950 border border-cyan-800/60 rounded-lg hover:border-cyan-500 cursor-pointer transition-all space-y-1 shadow-sm"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono text-cyan-400 font-semibold">{job.ticketNumber}</span>
                            <span className="text-slate-400">{job.category}</span>
                          </div>
                          <div className="text-xs font-medium text-slate-200 truncate">
                            {job.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {job.customerName}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-5 py-3 text-center text-xs text-slate-500 italic">
                        Available for standby or emergency critical dispatch
                      </div>
                    )}
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
