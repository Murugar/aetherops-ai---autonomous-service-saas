import React, { useState, useEffect } from 'react';
import { ViewMode, ActiveTab, Customer, Job, Technician, KnowledgeDoc, WorkflowRule, AnalyticsData } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { WorkOrdersView } from './components/WorkOrdersView';
import { CustomersView } from './components/CustomersView';
import { DispatchCalendarView } from './components/DispatchCalendarView';
import { WorkflowAutomationsView } from './components/WorkflowAutomationsView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { AnalyticsView } from './components/AnalyticsView';
import { InfrastructureView } from './components/InfrastructureView';
import { MobileFieldApp } from './components/MobileFieldApp';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { CreateJobModal } from './components/CreateJobModal';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('web');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Core Data States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Modals & Panels
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');
  const [isCreateJobOpen, setIsCreateJobOpen] = useState<boolean>(false);
  const [prefillCustomerId, setPrefillCustomerId] = useState<string | undefined>(undefined);

  // Initial Load from Express Backend API
  const loadData = async () => {
    try {
      const [cRes, jRes, tRes, kRes, wRes, aRes, hRes] = await Promise.all([
        fetch('/api/customers').then((r) => r.json()).catch(() => []),
        fetch('/api/jobs').then((r) => r.json()).catch(() => []),
        fetch('/api/technicians').then((r) => r.json()).catch(() => []),
        fetch('/api/knowledge').then((r) => r.json()).catch(() => []),
        fetch('/api/workflows').then((r) => r.json()).catch(() => []),
        fetch('/api/analytics').then((r) => r.json()).catch(() => null),
        fetch('/api/health').then((r) => r.json()).catch(() => null),
      ]);

      if (cRes && cRes.length) setCustomers(cRes);
      if (jRes && jRes.length) setJobs(jRes);
      if (tRes && tRes.length) setTechnicians(tRes);
      if (kRes && kRes.length) setKnowledgeDocs(kRes);
      if (wRes && wRes.length) setWorkflows(wRes);
      if (aRes) setAnalytics(aRes);
      setServerOnline(!!hRes && hRes.status === 'healthy');
    } catch (err) {
      console.error('Failed to load initial server state:', err);
      setServerOnline(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerWorkflow = async (workflowId: string) => {
    const res = await fetch('/api/workflows/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId }),
    });
    return res.json();
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev]);
    setSelectedJob(newJob);
    setActiveTab('jobs');
  };

  const handleUpdateJob = (updated: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    if (selectedJob?.id === updated.id) {
      setSelectedJob(updated);
    }
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [...prev, newCustomer]);
  };

  const handleOpenCopilotWithPrompt = (prompt: string) => {
    setCopilotInitialPrompt(prompt);
    setIsCopilotOpen(true);
  };

  const handleOpenCreateJob = (customerId?: string) => {
    setPrefillCustomerId(customerId);
    setIsCreateJobOpen(true);
  };

  const openJobsCount = jobs.filter((j) => j.status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeTab={activeTab}
        onOpenCreateJob={() => handleOpenCreateJob()}
        onOpenCopilot={() => {
          setCopilotInitialPrompt('');
          setIsCopilotOpen(true);
        }}
        serverOnline={serverOnline}
      />

      {/* Main Workspace Body */}
      {viewMode === 'mobile' ? (
        // Mobile Only View
        <div className="flex-1 flex items-center justify-center py-6 bg-slate-950/60">
          <MobileFieldApp
            jobs={jobs}
            technicians={technicians}
            customers={customers}
            onUpdateJob={handleUpdateJob}
            isStandalone={true}
          />
        </div>
      ) : viewMode === 'split' ? (
        // Split Screen View: Web Operations Hub on left, Mobile Field App on right
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openJobsCount={openJobsCount}
          />
          <main className="flex-1 overflow-y-auto border-r border-slate-800">
            {activeTab === 'overview' && (
              <DashboardView
                jobs={jobs}
                customers={customers}
                technicians={technicians}
                analytics={analytics}
                onSelectJob={(j) => {
                  setSelectedJob(j);
                  setActiveTab('jobs');
                }}
                onOpenCreateJob={() => handleOpenCreateJob()}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}
            {activeTab === 'jobs' && (
              <WorkOrdersView
                jobs={jobs}
                customers={customers}
                technicians={technicians}
                onOpenCreateJob={() => handleOpenCreateJob()}
                onUpdateJob={handleUpdateJob}
                selectedJob={selectedJob}
                setSelectedJob={setSelectedJob}
              />
            )}
            {activeTab === 'customers' && (
              <CustomersView
                customers={customers}
                jobs={jobs}
                onOpenCreateJob={handleOpenCreateJob}
                onAddCustomer={handleAddCustomer}
              />
            )}
            {activeTab === 'calendar' && (
              <DispatchCalendarView
                technicians={technicians}
                jobs={jobs}
                onSelectJob={(j) => {
                  setSelectedJob(j);
                  setActiveTab('jobs');
                }}
              />
            )}
            {activeTab === 'workflows' && (
              <WorkflowAutomationsView
                workflows={workflows}
                onTriggerWorkflow={handleTriggerWorkflow}
              />
            )}
            {activeTab === 'knowledge' && (
              <KnowledgeBaseView initialDocs={knowledgeDocs} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsView analytics={analytics} technicians={technicians} />
            )}
            {activeTab === 'infrastructure' && <InfrastructureView />}
            {activeTab === 'copilot' && (
              <div className="p-8 max-w-4xl mx-auto">
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
                  <h3 className="text-base font-bold text-slate-100">
                    Aether AI Fleet Copilot
                  </h3>
                  <p className="text-xs text-slate-400">
                    Interact directly with the service intelligence assistant using the side drawer.
                  </p>
                  <button
                    onClick={() => setIsCopilotOpen(true)}
                    className="px-4 py-2 bg-cyan-500 text-slate-950 font-semibold rounded-lg text-xs"
                  >
                    Open Copilot Drawer
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Right Column: Live Mobile App */}
          <div className="w-[430px] shrink-0 bg-slate-950/80 p-4 flex items-center justify-center overflow-y-auto">
            <MobileFieldApp
              jobs={jobs}
              technicians={technicians}
              customers={customers}
              onUpdateJob={handleUpdateJob}
            />
          </div>
        </div>
      ) : (
        // Standard Web SaaS View
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openJobsCount={openJobsCount}
          />
          <main className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <DashboardView
                jobs={jobs}
                customers={customers}
                technicians={technicians}
                analytics={analytics}
                onSelectJob={(j) => {
                  setSelectedJob(j);
                  setActiveTab('jobs');
                }}
                onOpenCreateJob={() => handleOpenCreateJob()}
                onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
              />
            )}
            {activeTab === 'jobs' && (
              <WorkOrdersView
                jobs={jobs}
                customers={customers}
                technicians={technicians}
                onOpenCreateJob={() => handleOpenCreateJob()}
                onUpdateJob={handleUpdateJob}
                selectedJob={selectedJob}
                setSelectedJob={setSelectedJob}
              />
            )}
            {activeTab === 'customers' && (
              <CustomersView
                customers={customers}
                jobs={jobs}
                onOpenCreateJob={handleOpenCreateJob}
                onAddCustomer={handleAddCustomer}
              />
            )}
            {activeTab === 'calendar' && (
              <DispatchCalendarView
                technicians={technicians}
                jobs={jobs}
                onSelectJob={(j) => {
                  setSelectedJob(j);
                  setActiveTab('jobs');
                }}
              />
            )}
            {activeTab === 'workflows' && (
              <WorkflowAutomationsView
                workflows={workflows}
                onTriggerWorkflow={handleTriggerWorkflow}
              />
            )}
            {activeTab === 'knowledge' && (
              <KnowledgeBaseView initialDocs={knowledgeDocs} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsView analytics={analytics} technicians={technicians} />
            )}
            {activeTab === 'infrastructure' && <InfrastructureView />}
            {activeTab === 'copilot' && (
              <div className="p-8 max-w-4xl mx-auto">
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
                  <h3 className="text-base font-bold text-slate-100">
                    Aether AI Operations Copilot
                  </h3>
                  <p className="text-xs text-slate-400">
                    Autonomous dispatch assistant capable of triaging work orders, matching technicians, analyzing warranties, and answering SOP inquiries.
                  </p>
                  <button
                    onClick={() => setIsCopilotOpen(true)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors"
                  >
                    Open Live Copilot Console
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialPrompt={copilotInitialPrompt}
      />

      {/* New Work Order Creation Modal */}
      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
        customers={customers}
        technicians={technicians}
        onJobCreated={handleJobCreated}
        prefillCustomerId={prefillCustomerId}
      />
    </div>
  );
}
