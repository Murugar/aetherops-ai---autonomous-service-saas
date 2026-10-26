import React from 'react';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  Workflow,
  Search,
  Sparkles,
  BarChart3,
  Server,
  Wrench,
  Bot,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openJobsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openJobsCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Operations Command', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'jobs', label: 'Work Orders & Dispatch', icon: <ClipboardList className="w-4 h-4" />, badge: openJobsCount },
    { id: 'customers', label: 'CRM & Client Accounts', icon: <Users className="w-4 h-4" /> },
    { id: 'calendar', label: 'Dispatch Timeline', icon: <Calendar className="w-4 h-4" /> },
    { id: 'workflows', label: 'Autonomous Workflows', icon: <Workflow className="w-4 h-4" /> },
    { id: 'knowledge', label: 'Semantic Knowledge RAG', icon: <Search className="w-4 h-4" /> },
    { id: 'copilot', label: 'AI Operations Copilot', icon: <Bot className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & SLA Metrics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'infrastructure', label: 'Cloud & API Infra', icon: <Server className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>AetherOps</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Service Cloud</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-300 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Technician Roster Snapshot at bottom */}
      <div className="p-4 border-t border-slate-900 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <span>Field Crew Status</span>
          <span className="text-emerald-400 font-mono">4 Online</span>
        </div>
        <div className="space-y-2 px-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300">Alex Rivera (HVAC/Cryo)</span>
            <span className="text-amber-400">On Site</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300">Devon Vance (VFD/PLC)</span>
            <span className="text-blue-400">En Route</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300">Maya Chen (Hydraulics)</span>
            <span className="text-emerald-400">Available</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300">Liam Thorne (IoT Sensors)</span>
            <span className="text-emerald-400">Available</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
