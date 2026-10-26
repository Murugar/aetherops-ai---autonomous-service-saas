import React, { useState } from 'react';
import { Customer, Job } from '../types';
import {
  Users,
  Search,
  Plus,
  Shield,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  jobs: Job[];
  onOpenCreateJob: (prefillCustomerId?: string) => void;
  onAddCustomer: (newCustomer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  jobs,
  onOpenCreateJob,
  onAddCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding customer
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contractTier, setContractTier] = useState<Customer['contractTier']>('Premium Care');
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || c.contractTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;

    const payload = {
      name,
      company,
      email,
      phone,
      address,
      contractTier,
      lifetimeValue: 12500,
      equipment: equipmentName
        ? [{ name: equipmentName, model: equipmentModel || 'Gen-4', installedYear: 2024, status: 'Optimal' }]
        : [],
    };

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      onAddCustomer(data);
      setShowAddModal(false);
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setAddress('');
      setEquipmentName('');
      setEquipmentModel('');
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Customer Accounts & Service Contracts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise equipment registry, SLA tier commitments, and maintenance history.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Account</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by contact name, company, email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          {['ALL', 'Enterprise', 'Premium Care', 'Standard SLA'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                tierFilter === tier
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tier === 'ALL' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCustomers.map((cust) => {
          const tierBadge =
            cust.contractTier === 'Enterprise'
              ? 'text-cyan-400 bg-cyan-950/80 border-cyan-800'
              : cust.contractTier === 'Premium Care'
              ? 'text-indigo-400 bg-indigo-950/80 border-indigo-800'
              : 'text-slate-400 bg-slate-800 border-slate-700';

          const openTickets = jobs.filter((j) => j.customerId === cust.id && j.status !== 'Completed');

          return (
            <div
              key={cust.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{cust.company}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${tierBadge}`}>
                      {cust.contractTier}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Primary Contact: <span className="text-slate-300">{cust.name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Lifetime Revenue</div>
                  <div className="text-sm font-mono font-bold text-slate-200">
                    ${cust.lifetimeValue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{cust.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{cust.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{cust.address}</span>
                </div>
              </div>

              {/* Equipment Inventory */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Critical Equipment Fleet</span>
                  <span className="text-[11px] text-slate-500">{cust.equipment.length} registered assets</span>
                </div>

                <div className="space-y-1.5">
                  {cust.equipment.map((eq, i) => {
                    const statusColor =
                      eq.status === 'Urgent Attention'
                        ? 'text-rose-400'
                        : eq.status === 'Inspection Due'
                        ? 'text-amber-400'
                        : 'text-emerald-400';

                    return (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-medium text-slate-200">{eq.name}</div>
                          <div className="text-[11px] text-slate-500">
                            Model: {eq.model} · Installed {eq.installedYear}
                          </div>
                        </div>
                        <span className={`text-[11px] font-medium ${statusColor}`}>
                          {eq.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span>Open Tickets: </span>
                  <span className="font-mono text-cyan-400 font-semibold">{openTickets.length} active</span>
                </div>

                <button
                  onClick={() => onOpenCreateJob(cust.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                >
                  Create Work Order
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Add Enterprise Client</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Company Name</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Horizon Labs Inc."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rachel@horizon.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Facility / Service Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="300 Mission St, San Francisco, CA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Contract SLA Tier</label>
                <select
                  value={contractTier}
                  onChange={(e) => setContractTier(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Enterprise">Enterprise (2h SLA, 24/7 Priority)</option>
                  <option value="Premium Care">Premium Care (4h SLA, Business Hours)</option>
                  <option value="Standard SLA">Standard SLA (8h SLA)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="text-slate-400 font-medium">Initial Equipment Asset</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    placeholder="Asset (e.g. Centrifugal Chiller 400T)"
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={equipmentModel}
                    onChange={(e) => setEquipmentModel(e.target.value)}
                    placeholder="Model (e.g. Trane Series R)"
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-semibold rounded-lg hover:bg-cyan-400"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
