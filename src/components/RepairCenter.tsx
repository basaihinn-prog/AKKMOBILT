import React, { useState } from 'react';
import { Wrench, Search, Clock, ShieldCheck, UserCheck, CheckCircle2, AlertCircle, Plus, ClipboardList, Printer } from 'lucide-react';
import { RepairTicket, RepairStatus, BranchId } from '../types';
import ReceiptModal from './ReceiptModal';

interface RepairCenterProps {
  repairs: RepairTicket[];
  activeBranchId: BranchId;
  onRefresh: () => void;
}

export default function RepairCenter({ repairs, activeBranchId, onRefresh }: RepairCenterProps) {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [issue, setIssue] = useState('');
  const [cost, setCost] = useState('150000');
  const [warranty, setWarranty] = useState('6');
  const [loading, setLoading] = useState(false);
  
  // Update state details
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [techNotes, setTechNotes] = useState('');
  const [statusVal, setStatusVal] = useState<RepairStatus>('received');
  const [costVal, setCostVal] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !model || !issue) return;

    setLoading(true);
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: custName,
          customerPhone: custPhone,
          deviceBrand: brand,
          deviceModel: model,
          issueDescription: issue,
          branchId: activeBranchId,
          estimatedCost: parseFloat(cost) || 100000,
          warrantyMonths: parseInt(warranty) || 3
        })
      });

      if (res.ok) {
        setCustName('');
        setCustPhone('');
        setModel('');
        setIssue('');
        setIsCreating(false);
        onRefresh();
        alert('🔧 Diagnostics appointment ticket successfully logged in General Repair CRM.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const res = await fetch(`/api/repairs/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusVal,
          technicianNotes: techNotes,
          estimatedCost: parseFloat(costVal) || selectedTicket.estimatedCost
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedTicket(updated);
        onRefresh();
        alert('🔧 Diagnostics & Technician tracking log updated in Cloud ERP.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = repairs.filter(r =>
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.deviceModel.toLowerCase().includes(search.toLowerCase())
  );

  const getBadgeStyle = (status: RepairStatus) => {
    switch (status) {
      case 'received': return 'bg-[#3052a3]/10 text-[#3052a3] border border-[#3052a3]/20';
      case 'diagnostic': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse';
      case 'repairing': return 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20';
      case 'testing': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'ready': return 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25 font-bold';
      case 'delivered': return 'bg-slate-500/10 text-[#8891ac] border border-slate-500/25';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="repair-center-module">
      {/* LEFT: Repair List Tracker */}
      <div className="xl:col-span-7 space-y-5">
        <div className="bg-[#1a2554]/30 border border-[#1a2554] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by Ticket ID, Customer name or device..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f172e] border border-slate-850 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#b0b8d4] outline-none font-mono"
            />
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="w-full sm:w-auto bg-[#3052a3] hover:bg-indigo-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create diagnostics ticket</span>
          </button>
        </div>

        {/* Diagnostic creation form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="bg-[#1a2554]/40 border border-[#3052a3]/20 rounded-2xl p-5 space-y-4 font-mono text-xs animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="font-bold text-[#3052a3] flex items-center space-x-1.5">
                <Wrench className="w-4 h-4" />
                <span>NEW DIAGNOSTICS & HARDWARE REPAIR FORM</span>
              </span>
              <button type="button" onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white">Cancel</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[#8891ac]">Customer Name</label>
                <input
                  type="text"
                  placeholder="Ko Min Thuta"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-3 py-2 text-[#f0f4ff] outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[#8891ac]">Customer Phone</label>
                <input
                  type="tel"
                  placeholder="09799112233"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-3 py-2 text-[#f0f4ff] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[#8891ac]">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-3 py-2 text-[#f0f4ff] outline-none"
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Google">Google</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Xiaomi">Xiaomi</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[#8891ac]">Device Model</label>
                <input
                  type="text"
                  placeholder="iPhone 15 Pro Max"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-3 py-2 text-[#f0f4ff] outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[#8891ac]">Est. Repair Cost (MMK)</label>
                <input
                  type="number"
                  placeholder="150000"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-3 py-2 text-[#f0f4ff] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#8891ac]">Hardware Issue Description</label>
              <textarea
                placeholder="Front glass shattered, touch sensor flickering, water diagnostics needed..."
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-3 py-2 text-[#f0f4ff] outline-none h-20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[#8891ac]">Warranty (Months)</label>
                <input
                  type="number"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-3 py-2 text-[#f0f4ff] outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3052a3] hover:bg-indigo-400 text-slate-950 font-black py-2.5 rounded transition uppercase font-sans text-xs"
                >
                  {loading ? 'Logging diagnostics...' : 'Dispatch Ticket'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Repair Table / Card list */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setTechNotes(ticket.technicianNotes || '');
                  setStatusVal(ticket.status);
                  setCostVal(String(ticket.estimatedCost));
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-[#3052a3]/10 border-[#3052a3]'
                    : 'bg-[#1a2554]/20 border-[#1a2554] hover:border-slate-850'
                }`}
              >
                <div className="flex items-start justify-between gap-3 font-mono text-xs">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-extrabold text-white text-sm">{ticket.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getBadgeStyle(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="font-bold text-[#b0b8d4]">{ticket.deviceBrand} {ticket.deviceModel}</p>
                    <p className="text-[11px] text-[#8891ac] truncate max-w-[320px]">{ticket.issueDescription}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 pt-1 border-t border-[#1a2554]/50">
                      <span>Client: <strong>{ticket.customerName}</strong></span>
                      <span>Assigned: <strong className="text-slate-300">{ticket.assignedTechnician || 'Lead Technician'}</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className="text-xs font-bold text-[#10b981] block">{ticket.estimatedCost.toLocaleString()} MMK</span>
                    <span className="text-[10px] text-slate-500 block">{ticket.warrantyMonths}m warranty</span>
                    <span className="text-[9px] text-slate-500 block">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 bg-[#1a2554]/10 border border-[#1a2554] rounded-2xl text-center text-slate-600 font-mono space-y-2">
              <ClipboardList className="w-8 h-8 mx-auto text-slate-800" />
              <p className="text-xs">No active hardware repair diagnostic tickets found matching filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Technician Workspace */}
      <div className="xl:col-span-5">
        {selectedTicket ? (
          <div className="bg-[#1a2554]/20 border border-[#1a2554] rounded-2xl p-5 space-y-5 font-mono text-xs" id="technician-workspace">
            <div className="border-b border-[#1a2554] pb-3">
              <span className="text-[10px] text-[#3052a3] font-black uppercase tracking-wider block mb-1">Active Tech Diagnostic Bench</span>
              <h4 className="font-black text-sm text-[#f0f4ff]">{selectedTicket.id} - {selectedTicket.deviceModel}</h4>
            </div>

            <div className="space-y-3.5 bg-[#0f172e] border border-[#1a2554] p-4 rounded-xl text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Device / Brand:</span>
                <strong className="text-[#b0b8d4]">{selectedTicket.deviceBrand}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <strong className="text-[#b0b8d4]">{selectedTicket.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client Phone:</span>
                <strong className="text-[#b0b8d4]">{selectedTicket.customerPhone}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Warranty Policy:</span>
                <strong className="text-[#b0b8d4]">{selectedTicket.warrantyMonths} Months</strong>
              </div>
              <div className="border-t border-[#1a2554] pt-2.5">
                <span className="text-slate-500 block mb-1">Issue Reported:</span>
                <p className="text-slate-300 bg-[#1a2554]/20 p-2.5 rounded border border-[#1a2554] leading-relaxed text-[11px]">
                  {selectedTicket.issueDescription}
                </p>
              </div>
            </div>

            {/* Diagnostic updater form */}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#8891ac]">Diagnosis State</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value as RepairStatus)}
                    className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-2.5 py-2 text-[#b0b8d4] font-bold"
                  >
                    <option value="received">1. Received</option>
                    <option value="diagnostic">2. Diagnostic</option>
                    <option value="repairing">3. Repairing</option>
                    <option value="testing">4. Testing</option>
                    <option value="ready">5. Ready (Notify)</option>
                    <option value="delivered">6. Delivered</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[#8891ac]">Billable Quote (MMK)</label>
                  <input
                    type="number"
                    value={costVal}
                    onChange={(e) => setCostVal(e.target.value)}
                    className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-2.5 py-2 text-[#b0b8d4] font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#8891ac]">Technician Bench Notes</label>
                <textarea
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-3 py-2 text-[#b0b8d4] h-24 leading-relaxed"
                  placeholder="Note replacement serials, TrueTone recalibration codes, adhesive heat temps..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="submit"
                  className="w-full bg-slate-850 hover:bg-[#222f5a] border border-slate-750 text-[#b0b8d4] font-bold py-3 rounded-xl transition uppercase tracking-wider text-[11px]"
                >
                  Save Logs
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrinting(true)}
                  className="w-full bg-[#3052a3] hover:bg-indigo-400 text-slate-950 font-black py-3 rounded-xl transition uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Print Slip</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-[#1a2554]/10 border border-[#1a2554] rounded-2xl p-8 text-center text-slate-600 font-mono space-y-2 py-24">
            <Wrench className="w-10 h-10 mx-auto text-slate-800 animate-bounce" />
            <p className="text-xs">No active ticket loaded on workbench.</p>
            <p className="text-[10px] text-slate-500">Select any diagnostic ticket from the general list to inspect hardware logs or perform teardown updates.</p>
          </div>
        )}
      </div>

      {/* Branded print modal for service ticket */}
      {isPrinting && selectedTicket && (
        <ReceiptModal
          repair={selectedTicket}
          onClose={() => setIsPrinting(false)}
        />
      )}
    </div>
  );
}
