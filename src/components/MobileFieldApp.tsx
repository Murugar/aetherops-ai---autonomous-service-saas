import React, { useState, useRef } from 'react';
import { Job, Technician, Customer } from '../types';
import {
  MapPin,
  Navigation,
  Phone,
  Camera,
  Mic,
  MicOff,
  CheckCircle,
  Clock,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  FileCheck,
  ChevronRight,
  Shield,
  Layers,
  PenTool,
} from 'lucide-react';

interface MobileFieldAppProps {
  jobs: Job[];
  technicians: Technician[];
  customers: Customer[];
  onUpdateJob: (updated: Job) => void;
  isStandalone?: boolean;
}

export const MobileFieldApp: React.FC<MobileFieldAppProps> = ({
  jobs,
  technicians,
  customers,
  onUpdateJob,
  isStandalone = false,
}) => {
  const [activeTechId, setActiveTechId] = useState<string>('tech-1');
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isRecordingNote, setIsRecordingNote] = useState<boolean>(false);
  const [voiceNoteText, setVoiceNoteText] = useState<string>('');
  const [showSignaturePad, setShowSignaturePad] = useState<boolean>(false);
  const [signedName, setSignedName] = useState<string>('');
  const [navigating, setNavigating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'current' | 'all' | 'inventory'>('current');

  const currentTech = technicians.find((t) => t.id === activeTechId) || technicians[0];
  const assignedJobs = jobs.filter((j) => j.technicianId === currentTech.id);
  const activeJob = assignedJobs.find((j) => j.status === 'In Progress' || j.status === 'En Route' || j.status === 'Dispatched') || assignedJobs[0];

  const handleStatusUpdate = async (job: Job, newStatus: Job['status']) => {
    if (offlineMode) {
      setPendingSyncCount((c) => c + 1);
      const updated = { ...job, status: newStatus };
      onUpdateJob(updated);
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      onUpdateJob(data);
    } catch (err) {
      console.error('Mobile status update failed:', err);
    }
  };

  const handleVoiceNoteDictate = () => {
    if (isRecordingNote) {
      setIsRecordingNote(false);
      return;
    }

    setIsRecordingNote(true);
    setTimeout(() => {
      setIsRecordingNote(false);
      const note = `Diagnostic check complete: Suction pressure recovered to 14.5 PSIG following TXV replacement. Cryo temp stabilized at -78.4°C. Cleaned evaporator intake. Ready for manager signoff.`;
      setVoiceNoteText(note);
      if (activeJob) {
        const updated = {
          ...activeJob,
          notes: activeJob.notes ? `${activeJob.notes}\n\n[Field Audio Note]: ${note}` : `[Field Audio Note]: ${note}`,
        };
        onUpdateJob(updated);
      }
    }, 2500);
  };

  const handleSignOff = async () => {
    if (!activeJob || !signedName) return;
    const signatureStr = `${signedName} (Verified via Field Mobile Companion at ${new Date().toLocaleTimeString()})`;
    const updated = {
      ...activeJob,
      status: 'Completed' as Job['status'],
      customerSignature: signatureStr,
    };
    onUpdateJob(updated);
    setShowSignaturePad(false);
    setSignedName('');

    if (!offlineMode) {
      await fetch(`/api/jobs/${activeJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          customerSignature: signatureStr,
        }),
      });
    } else {
      setPendingSyncCount((c) => c + 1);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${isStandalone ? 'min-h-[calc(100vh-4rem)]' : ''}`}>
      {/* Phone Shell Frame */}
      <div className="w-full max-w-[390px] h-[780px] bg-slate-950 rounded-[44px] border-[10px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden font-sans">
        {/* Dynamic Island / Speaker notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
        </div>

        {/* Mobile Status Bar */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] text-slate-300 z-20 font-medium">
          <span>09:41</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setOfflineMode(!offlineMode);
                if (offlineMode && pendingSyncCount > 0) {
                  setPendingSyncCount(0);
                }
              }}
              title="Toggle Offline Queue Simulation"
              className="flex items-center gap-1 text-[10px] font-mono hover:text-cyan-400"
            >
              {offlineMode ? (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400">Offline ({pendingSyncCount})</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">5G Cloud</span>
                </>
              )}
            </button>
            <div className="w-4 h-2.5 border border-slate-300 rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-slate-200 rounded-xs" />
            </div>
          </div>
        </div>

        {/* Technician Profile Header */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={currentTech.avatar}
              alt={currentTech.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <div>
              <div className="text-xs font-bold text-slate-100">{currentTech.name}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>{currentTech.status}</span>
                <span aria-hidden="true">·</span>
                <span className="text-cyan-400">★ {currentTech.rating}</span>
              </div>
            </div>
          </div>

          {/* Switch Tech Selector */}
          <select
            value={activeTechId}
            onChange={(e) => setActiveTechId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1 focus:outline-none"
          >
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name.split(' ')[0]} ({t.specialties[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Scrollable Mobile App Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'current' ? (
            activeJob ? (
              <div className="space-y-4">
                {/* Active Job Card */}
                <div className="p-4 bg-slate-900 border border-cyan-900/60 rounded-2xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-cyan-400 font-bold">{activeJob.ticketNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold text-[10px]">
                      {activeJob.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{activeJob.title}</h3>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">
                      {activeJob.customerName}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-[11px] leading-tight">
                        {activeJob.customerAddress}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <span>SLA: 2h Remaining</span>
                      <button
                        onClick={() => setNavigating(!navigating)}
                        className={`flex items-center gap-1 font-semibold ${
                          navigating ? 'text-emerald-400' : 'text-cyan-400 hover:text-cyan-300'
                        }`}
                      >
                        <Navigation className="w-3 h-3" />
                        <span>{navigating ? 'GPS Active (12 min)' : 'Start Route'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Status Workflow Progression */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Update On-Site Status
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      <button
                        onClick={() => handleStatusUpdate(activeJob, 'En Route')}
                        className={`py-1.5 rounded-lg border text-center font-medium ${
                          activeJob.status === 'En Route'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        En Route
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(activeJob, 'In Progress')}
                        className={`py-1.5 rounded-lg border text-center font-medium ${
                          activeJob.status === 'In Progress'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        On Site
                      </button>
                      <button
                        onClick={() => setShowSignaturePad(true)}
                        className={`py-1.5 rounded-lg border text-center font-medium ${
                          activeJob.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-300'
                        }`}
                      >
                        Sign Off
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Hands-Free Voice Note Dictation */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI Voice Memo & Diagnostic</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Auto-transcribe</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tap to dictate technical diagnosis, parts replaced, and sensor readings while hands are busy.
                  </p>

                  <button
                    onClick={handleVoiceNoteDictate}
                    className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                      isRecordingNote
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                        : 'bg-slate-950 text-cyan-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isRecordingNote ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecordingNote ? 'Listening to speech...' : 'Record Voice Field Note'}</span>
                  </button>

                  {voiceNoteText && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                      <div className="text-[10px] text-cyan-400 font-semibold mb-1">Transcribed Field Note:</div>
                      {voiceNoteText}
                    </div>
                  )}
                </div>

                {/* Truck Parts Quick Inventory */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                  <div className="text-xs font-semibold text-slate-200">Van Inventory for this Ticket</div>
                  <div className="space-y-1.5">
                    {currentTech.truckInventory.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px]"
                      >
                        <span className="text-slate-300 truncate">{item.part}</span>
                        <span className="font-mono text-cyan-400 font-bold shrink-0">{item.qty} in van</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-semibold text-slate-200">All assigned jobs completed!</div>
                <p className="text-[11px] text-slate-500">Standby for next dispatch assignment.</p>
              </div>
            )
          ) : activeTab === 'all' ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 px-1">Today's Assigned Schedule</div>
              {assignedJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-cyan-400">{job.ticketNumber}</span>
                    <span className="text-slate-400">{job.status}</span>
                  </div>
                  <div className="font-medium text-slate-200">{job.title}</div>
                  <div className="text-[11px] text-slate-400">{job.customerName}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 px-1">Full Van Storage Stock</div>
              <div className="space-y-1.5">
                {currentTech.truckInventory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-200">{item.part}</span>
                    <span className="font-mono text-cyan-400 font-bold">{item.qty} units</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Signature Modal Overlay inside Mobile Frame */}
        {showSignaturePad && (
          <div className="absolute inset-0 bg-slate-950/95 z-40 p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100">Customer Digital Sign-Off</h4>
                <button
                  onClick={() => setShowSignaturePad(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Confirming completion of service order {activeJob?.ticketNumber} for {activeJob?.customerName}.
              </p>
            </div>

            {/* Signature Draw Area Simulation */}
            <div className="space-y-3">
              <div className="h-32 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center relative p-3">
                <div className="text-slate-600 text-xs italic font-serif pointer-events-none select-none">
                  {signedName ? signedName : 'Customer signs here with finger or stylus'}
                </div>
              </div>

              <input
                type="text"
                value={signedName}
                onChange={(e) => setSignedName(e.target.value)}
                placeholder="Type customer authorized name..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleSignOff}
              disabled={!signedName}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors disabled:opacity-40"
            >
              Verify & Complete Work Order
            </button>
          </div>
        )}

        {/* Bottom Mobile Tab Bar */}
        <div className="h-14 border-t border-slate-800/80 bg-slate-950 px-6 flex items-center justify-around text-xs text-slate-400 z-20">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex flex-col items-center gap-0.5 ${
              activeTab === 'current' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-[10px]">Active</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex flex-col items-center gap-0.5 ${
              activeTab === 'all' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px]">Today's Route</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center gap-0.5 ${
              activeTab === 'inventory' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="text-[10px]">Van Parts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
