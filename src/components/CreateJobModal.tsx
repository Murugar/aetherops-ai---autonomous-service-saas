import React, { useState } from 'react';
import { Job, Customer, Technician } from '../types';
import { X, Sparkles, Plus, Clock, Wrench } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  technicians: Technician[];
  onJobCreated: (newJob: Job) => void;
  prefillCustomerId?: string;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  customers,
  technicians,
  onJobCreated,
  prefillCustomerId,
}) => {
  const [customerId, setCustomerId] = useState<string>(prefillCustomerId || (customers[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Job['category']>('HVAC');
  const [priority, setPriority] = useState<Job['priority']>('High');
  const [technicianId, setTechnicianId] = useState<string>('');
  const [costEstimate, setCostEstimate] = useState<number>(750);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedCustomer = customers.find((c) => c.id === customerId) || customers[0];

  const handleAIAutoFill = () => {
    setTitle('Secondary Cryogenic Stage Solenoid Bypass Fault');
    setCategory('Refrigeration');
    setPriority('Critical');
    setCostEstimate(1350);
    setNotes('Sensors detect secondary stage suction pressure dropped below 4 PSIG. Biological inventory requires immediate inspection of bypass solenoid and TXV valve.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    const assignedTech = technicians.find((t) => t.id === technicianId);

    const payload = {
      title,
      customerId: selectedCustomer?.id || 'cust-1',
      customerName: selectedCustomer?.company || 'Commercial Client',
      customerAddress: selectedCustomer?.address || 'San Francisco, CA',
      technicianId: assignedTech ? assignedTech.id : null,
      technicianName: assignedTech ? assignedTech.name : null,
      priority,
      category,
      costEstimate,
      notes,
      estimatedDurationHours: 2.5,
      partsRequired: ['Bypass Solenoid Kit', 'High-Pressure Sensor'],
    };

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      onJobCreated(data);
      onClose();
    } catch (err) {
      console.error('Failed to create job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">Create Commercial Work Order</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate dispatch ticket with automated SLA timer and technician pairing.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">Need a quick test scenario?</span>
          <button
            type="button"
            onClick={handleAIAutoFill}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg hover:bg-cyan-500/30 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Auto-Fill Symptom</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400">Client Account</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.contractTier})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Service Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="HVAC">HVAC & Climate</option>
                <option value="Refrigeration">Refrigeration & Cryogenics</option>
                <option value="Industrial Automation">Industrial Automation & PLC</option>
                <option value="Electrical">Electrical Distribution</option>
                <option value="Hydraulics">Hydraulics & Heavy Machinery</option>
              </select>
            </div>
          </div>

          {/* Job Title */}
          <div className="space-y-1">
            <label className="text-slate-400">Work Order Title / Incident Summary</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Compressor Inverter Thermal Fault on Data Hall Unit #2"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Priority & Technician */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400">SLA Priority Tier</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Critical">Critical (2h SLA Emergency)</option>
                <option value="High">High (4h SLA Priority)</option>
                <option value="Normal">Normal (Next-Day Scheduled)</option>
                <option value="Low">Low (Preventive Routine)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Assign Technician</label>
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">AI Autonomous Dispatch (Auto-Pair)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.status} - {t.location.area})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cost Estimate & Notes */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400">Cost Estimate ($)</label>
              <input
                type="number"
                value={costEstimate}
                onChange={(e) => setCostEstimate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-slate-400">Field Symptoms / Diagnostic Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Diagnostic readings, error codes, facility access instructions..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Dispatching...' : 'Confirm & Dispatch Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
