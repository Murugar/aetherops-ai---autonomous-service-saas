import React from 'react';
import { ViewMode, ActiveTab } from '../types';
import { Monitor, Smartphone, Columns, Sparkles, Plus, Activity } from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeTab: ActiveTab;
  onOpenCreateJob: () => void;
  onOpenCopilot: () => void;
  serverOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  activeTab,
  onOpenCreateJob,
  onOpenCopilot,
  serverOnline,
}) => {
  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'overview':
        return 'Operations Command Center';
      case 'jobs':
        return 'Work Orders & Field Dispatch';
      case 'customers':
        return 'Enterprise Customer Accounts';
      case 'calendar':
        return 'Smart Dispatch & Route Schedule';
      case 'workflows':
        return 'Autonomous Workflow Studio';
      case 'knowledge':
        return 'Semantic Knowledge Retrieval & SOPs';
      case 'copilot':
        return 'Aether AI Operations Copilot';
      case 'analytics':
        return 'Service Analytics & SLA Performance';
      case 'infrastructure':
        return 'Cloud Architecture & Backend APIs';
      default:
        return 'Operations Console';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-cyan-400 tracking-wider uppercase text-[11px]">AetherOps AI</span>
            <span aria-hidden="true" className="text-slate-600">/</span>
            <span className="text-slate-300">{getTabTitle(activeTab)}</span>
          </div>
          <h1 className="text-base font-semibold text-slate-100 tracking-tight">
            Autonomous Service Cloud
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* View Mode Switcher: Web / Mobile / Split */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'web'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop Operations Hub"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web SaaS</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'mobile'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile Field Technician Companion"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile App</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Side-by-side Web & Field Mobile"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dual View</span>
          </button>
        </div>

        {/* Server State Indicator (quiet text) */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
          <span className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          <span>{serverOnline ? 'APIs Connected' : 'Connecting to Node/Python Bus...'}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={onOpenCreateJob}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Work Order</span>
          </button>
        </div>
      </div>
    </header>
  );
};
