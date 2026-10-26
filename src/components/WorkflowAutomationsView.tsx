import React, { useState } from 'react';
import { WorkflowRule } from '../types';
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  Settings2,
  Check,
} from 'lucide-react';

interface WorkflowAutomationsViewProps {
  workflows: WorkflowRule[];
  onTriggerWorkflow: (workflowId: string) => Promise<any>;
}

export const WorkflowAutomationsView: React.FC<WorkflowAutomationsViewProps> = ({
  workflows,
  onTriggerWorkflow,
}) => {
  const [activeSimulation, setActiveSimulation] = useState<any | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [localWorkflows, setLocalWorkflows] = useState<WorkflowRule[]>(workflows);

  const handleSimulate = async (wf: WorkflowRule) => {
    setSimulatingId(wf.id);
    setActiveSimulation(null);
    try {
      const result = await onTriggerWorkflow(wf.id);
      setActiveSimulation(result);
      // increment count locally
      setLocalWorkflows((prev) =>
        prev.map((w) =>
          w.id === wf.id ? { ...w, executionsCount: w.executionsCount + 1, lastRun: 'Just now' } : w
        )
      );
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulatingId(null);
    }
  };

  const toggleActive = (id: string) => {
    setLocalWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Autonomous Workflow Automation Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Trigger-condition-action pipelines powered by Gemini AI decision reasoning and background worker queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            {localWorkflows.filter((w) => w.active).length} Active Pipelines
          </span>
        </div>
      </div>

      {/* Live Simulation Output Card */}
      {activeSimulation && (
        <div className="p-6 bg-slate-900 border border-cyan-800/80 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Pipeline Simulation Execution Trace: {activeSimulation.workflowName}
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              STATUS: {activeSimulation.status}
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {activeSimulation.steps.map((st: any, i: number) => (
              <div key={i} className="flex items-start gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200">{st.step}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{st.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflows Visual Flow Cards */}
      <div className="space-y-6">
        {localWorkflows.map((wf) => (
          <div
            key={wf.id}
            className={`p-6 rounded-2xl border transition-all ${
              wf.active
                ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                : 'bg-slate-950/60 border-slate-900 opacity-60'
            }`}
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">{wf.name}</h3>
                  <button
                    onClick={() => toggleActive(wf.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                      wf.active
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {wf.active ? 'ACTIVE' : 'PAUSED'}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">{wf.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-xs text-slate-400">
                  <div>Executions: <span className="font-mono text-cyan-400 font-semibold">{wf.executionsCount}</span></div>
                  <div className="text-[11px] text-slate-500">Last: {wf.lastRun}</div>
                </div>

                <button
                  onClick={() => handleSimulate(wf)}
                  disabled={simulatingId === wf.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{simulatingId === wf.id ? 'Running Trace...' : 'Simulate'}</span>
                </button>
              </div>
            </div>

            {/* Pipeline Step Visualizer */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              {/* Trigger Node */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  01. Event Trigger
                </div>
                <div className="font-mono text-slate-200 text-xs font-semibold">
                  {wf.trigger}
                </div>
                <div className="text-[11px] text-slate-500">
                  Listens to real-time webhook & DB change streams
                </div>
              </div>

              {/* Conditions Node */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  02. Rule Filter Conditions
                </div>
                <div className="space-y-1">
                  {wf.conditions.map((cond, i) => (
                    <div key={i} className="font-mono text-[11px] text-slate-300">
                      • {cond}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Action Node */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-900/60 space-y-1">
                <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>03. AI Autonomous Action</span>
                </div>
                <div className="font-mono text-cyan-200 text-xs font-semibold">
                  {wf.aiAction}
                </div>
                <div className="text-[11px] text-slate-500">
                  Executes Gemini model reasoning & external service triggers
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
