import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  User,
  Phone,
  DollarSign,
  Package,
  Wrench,
  Users,
  TrendingUp,
  ArrowRightLeft,
  Search,
  CheckCircle,
  Clock,
  Plus,
  Trash2
} from 'lucide-react';
import { Branch, JoinedInventory, StockTransfer, Employee, PhoneProduct, BranchId } from '../types';

interface AdminBranchViewProps {
  branches: Branch[];
  inventories: JoinedInventory[];
  transfers: StockTransfer[];
  employees: Employee[];
  products: PhoneProduct[];
  onRefreshAllData?: () => void;
}

interface NewBranchInput {
  id: string;
  name: string;
  city: string;
  manager: string;
  phone: string;
}

export default function AdminBranchView({
  branches: initialBranches,
  inventories,
  transfers: initialTransfers,
  employees,
  products,
  onRefreshAllData
}: AdminBranchViewProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId>('b-yangon');
  const [transfers, setTransfers] = useState<StockTransfer[]>(initialTransfers);
  const [activeSubView, setActiveSubView] = useState<'dashboard' | 'inventory' | 'transfers' | 'staff'>('dashboard');

  // New Branch creation state
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [newBranch, setNewBranch] = useState<NewBranchInput>({
    id: '',
    name: '',
    city: '',
    manager: '',
    phone: ''
  });

  // Transfer stock state
  const [isTransferringStock, setIsTransferringStock] = useState(false);
  const [transferProdId, setTransferProdId] = useState('');
  const [transferQty, setTransferQty] = useState('5');
  const [transferTargetBranch, setTransferTargetBranch] = useState<BranchId>('b-mandalay');
  const [transferError, setTransferError] = useState<string | null>(null);

  // Search filter for inventory
  const [inventorySearch, setInventorySearch] = useState('');

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Calculations for current active branch
  const branchInventory = inventories.filter((i) => i.branchId === selectedBranch.id);
  const branchEmployees = employees.filter((e) => e.branchId === selectedBranch.id);
  
  // Simulated localized branch sales (using employee sales target and active metrics)
  const branchSalesTarget = branchEmployees.reduce((sum, e) => sum + e.salesTarget, 0) || 12000000;
  const branchSalesCurrent = branchEmployees.reduce((sum, e) => sum + e.currentSales, 0) || 9800000;
  const branchRevenuePct = Math.min(100, Math.round((branchSalesCurrent / branchSalesTarget) * 100));

  const totalStockUnits = branchInventory.reduce((sum, item) => sum + item.stock, 0);
  const totalValuation = branchInventory.reduce((sum, item) => sum + item.productPrice * item.stock, 0);

  const inboundTransfers = transfers.filter((t) => t.toBranchId === selectedBranch.id);
  const outboundTransfers = transfers.filter((t) => t.fromBranchId === selectedBranch.id);

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.city || !newBranch.manager) return;

    const formattedId = `b-${newBranch.name.toLowerCase().replace(/\s+/g, '')}` as BranchId;
    if (branches.some((b) => b.id === formattedId)) {
      alert('A branch with this code or name already exists.');
      return;
    }

    const created: Branch = {
      id: formattedId,
      name: newBranch.name,
      city: newBranch.city,
      manager: newBranch.manager,
      phone: newBranch.phone || '0942000' + Math.floor(1000 + Math.random() * 9000)
    };

    setBranches([...branches, created]);
    setSelectedBranchId(created.id);
    setIsAddingBranch(false);
    setNewBranch({ id: '', name: '', city: '', manager: '', phone: '' });
  };

  const handleDeleteBranch = (id: string) => {
    if (branches.length <= 1) {
      alert('You must maintain at least one branch showroom in the database.');
      return;
    }
    if (confirm(`Are you sure you want to permanently close branch "${id}"? All stocks will be returned to head warehouse.`)) {
      const remaining = branches.filter((b) => b.id !== id);
      setBranches(remaining);
      setSelectedBranchId(remaining[0].id as BranchId);
    }
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);

    if (!transferProdId) {
      setTransferError('Please select a product SKU to dispatch.');
      return;
    }
    if (selectedBranchId === transferTargetBranch) {
      setTransferError('Cannot transfer within the same showroom branch.');
      return;
    }

    const qtyNum = Number(transferQty);
    const sourceStock = branchInventory.find((i) => i.productId === transferProdId)?.stock || 0;
    
    if (sourceStock < qtyNum) {
      setTransferError(`Insufficient stock! Showroom has only [${sourceStock}] units in stock, but requested transfer is [${qtyNum}] units.`);
      return;
    }

    const selectedProduct = products.find((p) => p.id === transferProdId);
    if (!selectedProduct) return;

    const newTransfer: StockTransfer = {
      id: `TR-${Math.floor(10000 + Math.random() * 90000)}`,
      productId: transferProdId,
      productName: selectedProduct.name,
      fromBranchId: selectedBranchId,
      toBranchId: transferTargetBranch,
      fromBranchName: selectedBranch.name,
      toBranchName: branches.find((b) => b.id === transferTargetBranch)?.name || 'Branch Depot',
      quantity: qtyNum,
      status: 'pending',
      requestedBy: 'Branch Manager Desk',
      createdAt: new Date().toISOString()
    };

    setTransfers([newTransfer, ...transfers]);
    setIsTransferringStock(false);
    setTransferProdId('');
  };

  const handleUpdateTransferStatus = (transferId: string, nextStatus: 'shipped' | 'delivered') => {
    setTransfers(
      transfers.map((t) => {
        if (t.id !== transferId) return t;
        return { ...t, status: nextStatus };
      })
    );
  };

  const filteredBranchInventory = branchInventory.filter((item) =>
    item.productName.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.productBrand.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="branch-manager-root">
      
      {/* 1. Branch Selector List */}
      <div className="lg:col-span-4 bg-[#1a2554]/15 border border-[#1a2554] p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Branch Registry</span>
          <button
            onClick={() => setIsAddingBranch(true)}
            className="p-1 hover:bg-slate-850 border border-[#222f5a] rounded text-amber-400 font-bold text-[10px] flex items-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-mono">Create Branch</span>
          </button>
        </div>

        {isAddingBranch ? (
          <form onSubmit={handleAddBranchSubmit} className="bg-[#0f172e] p-4 rounded-xl border border-slate-850 space-y-3 font-mono text-xs">
            <span className="text-[10px] text-amber-400 font-black uppercase block border-b border-[#1a2554] pb-1.5">Create Showroom Branch</span>
            
            <div className="space-y-1">
              <label className="text-[#8891ac] text-[10px]">Showroom Name</label>
              <input
                type="text"
                required
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                placeholder="e.g. Pyay Road Branch"
                className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#8891ac] text-[10px]">City Location</label>
              <input
                type="text"
                required
                value={newBranch.city}
                onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                placeholder="e.g. Yangon"
                className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[#8891ac] text-[10px]">Branch Manager</label>
                <input
                  type="text"
                  required
                  value={newBranch.manager}
                  onChange={(e) => setNewBranch({ ...newBranch, manager: e.target.value })}
                  placeholder="e.g. U Zaw Myo"
                  className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#8891ac] text-[10px]">Phone contact</label>
                <input
                  type="tel"
                  value={newBranch.phone}
                  onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                  placeholder="09..."
                  className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#1a2554]">
              <button
                type="button"
                onClick={() => setIsAddingBranch(false)}
                className="flex-1 bg-[#1a2554] text-[#8891ac] py-2 rounded font-bold hover:text-[#b0b8d4]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-2 rounded"
              >
                Launch Store
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {branches.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBranchId(b.id as BranchId)}
                className={`group relative flex flex-col p-3 rounded-xl border font-mono text-xs cursor-pointer transition ${
                  selectedBranchId === b.id
                    ? 'bg-[#0f172e] border-amber-500/20 shadow'
                    : 'bg-[#1a2554]/10 border-transparent hover:border-slate-850 hover:bg-[#1a2554]/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-extrabold block ${selectedBranchId === b.id ? 'text-amber-400' : 'text-[#b0b8d4]'}`}>
                    {b.name}
                  </span>
                  <span className="text-[9px] bg-[#1a2554] border border-[#222f5a] px-1.5 py-0.5 rounded text-slate-500 uppercase font-bold">
                    {b.city}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-2 text-[10px] text-[#8891ac]">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>Manager:</span>
                  <strong className="text-slate-300">{b.manager}</strong>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#1a2554]/50">
                  <span className="text-[9px] text-slate-500">Code: <strong className="text-[#8891ac] uppercase">{b.id}</strong></span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBranch(b.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#1a2554] rounded text-rose-500 hover:text-rose-400 transition"
                    title="Close Showroom"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Dynamic Showroom Viewport */}
      <div className="lg:col-span-8 space-y-6">
        {/* Sub-menu Navigation tabs for active branch */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0f172e] p-1 rounded-xl border border-[#1a2554] font-mono text-[11px] font-bold">
          <button
            onClick={() => setActiveSubView('dashboard')}
            className={`flex-1 px-3 py-1.5 rounded-lg transition-all text-center ${
              activeSubView === 'dashboard'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-[#8891ac] hover:text-[#b0b8d4]'
            }`}
          >
            Showroom KPIs
          </button>
          <button
            onClick={() => setActiveSubView('inventory')}
            className={`flex-1 px-3 py-1.5 rounded-lg transition-all text-center ${
              activeSubView === 'inventory'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-[#8891ac] hover:text-[#b0b8d4]'
            }`}
          >
            Inventory Stock
          </button>
          <button
            onClick={() => setActiveSubView('transfers')}
            className={`flex-1 px-3 py-1.5 rounded-lg transition-all text-center ${
              activeSubView === 'transfers'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-[#8891ac] hover:text-[#b0b8d4]'
            }`}
          >
            Inter-Branch Transfers ({inboundTransfers.length + outboundTransfers.length})
          </button>
          <button
            onClick={() => setActiveSubView('staff')}
            className={`flex-1 px-3 py-1.5 rounded-lg transition-all text-center ${
              activeSubView === 'staff'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-[#8891ac] hover:text-[#b0b8d4]'
            }`}
          >
            Store Personnel ({branchEmployees.length})
          </button>
        </div>

        {/* Dynamic content card view */}
        <div className="bg-[#1a2554]/15 border border-[#1a2554] p-5 rounded-2xl min-h-[400px]">
          
          {/* A. BRANCH DASHBOARD */}
          {activeSubView === 'dashboard' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="border-b border-[#1a2554] pb-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Showroom Performance overview</span>
                <h3 className="text-base font-extrabold text-[#f0f4ff] flex items-center gap-2 mt-1">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>{selectedBranch.name}</span>
                </h3>
                <div className="flex items-center space-x-2 text-[10px] text-[#8891ac] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Location: {selectedBranch.city} Division</span>
                  <span className="text-slate-600">•</span>
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contact: {selectedBranch.phone}</span>
                </div>
              </div>

              {/* Local KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0f172e]/40 border border-[#1a2554] p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Total Sales</span>
                    <DollarSign className="w-3.5 h-3.5 text-[#10b981]" />
                  </div>
                  <strong className="text-base text-[#10b981] font-black block">
                    {branchSalesCurrent.toLocaleString()} MMK
                  </strong>
                  <span className="text-[9px] text-slate-500">Accumulated this month</span>
                </div>

                <div className="bg-[#0f172e]/40 border border-[#1a2554] p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Showroom stock valuation</span>
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <strong className="text-base text-[#b0b8d4] font-black block">
                    {totalValuation.toLocaleString()} MMK
                  </strong>
                  <span className="text-[9px] text-slate-500">{totalStockUnits} units currently in-store</span>
                </div>

                <div className="bg-[#0f172e]/40 border border-[#1a2554] p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Staffing Density</span>
                    <Users className="w-3.5 h-3.5 text-[#3052a3]" />
                  </div>
                  <strong className="text-base text-indigo-300 font-black block">
                    {branchEmployees.length} active employees
                  </strong>
                  <span className="text-[9px] text-slate-500">Manager: {selectedBranch.manager}</span>
                </div>
              </div>

              {/* Progress toward targets */}
              <div className="bg-[#0f172e]/40 border border-[#1a2554] p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-baseline text-[10px]">
                  <span className="text-[#8891ac] font-bold uppercase tracking-wider text-[9px] block">Showroom target achievement</span>
                  <strong className="text-amber-400 font-extrabold">{branchRevenuePct}% Achieved</strong>
                </div>
                
                {/* Visual line progress */}
                <div className="w-full bg-[#1a2554] h-3 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${branchRevenuePct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span>Current: <strong>{branchSalesCurrent.toLocaleString()} MMK</strong></span>
                  <span>Target: <strong>{branchSalesTarget.toLocaleString()} MMK</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* B. BRANCH INVENTORY */}
          {activeSubView === 'inventory' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a2554] pb-3">
                <div>
                  <h4 className="font-extrabold text-[#b0b8d4] uppercase text-[11px]">Showroom Stock Catalog</h4>
                  <span className="text-[9px] text-slate-500 block">Query inventory specific to {selectedBranch.name}</span>
                </div>
                <div className="relative w-48 bg-[#0f172e] border border-[#222f5a] rounded p-1 flex items-center space-x-1">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search brand/model..."
                    className="w-full bg-transparent outline-none text-[10px] text-[#b0b8d4]"
                  />
                </div>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-[#8891ac] border-collapse">
                  <thead>
                    <tr className="border-b border-[#1a2554] text-left text-slate-500 font-bold uppercase">
                      <th className="py-2.5 pr-2">Brand & Product Model</th>
                      <th className="py-2.5 text-right px-2">Retail Price (MMK)</th>
                      <th className="py-2.5 text-center px-2">Stock Level</th>
                      <th className="py-2.5 text-center px-2">Alert Threshold</th>
                      <th className="py-2.5 text-right pl-2">Est. Valuation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBranchInventory.length > 0 ? (
                      filteredBranchInventory.map((item, idx) => {
                        const lowStock = item.stock <= item.minAlertThreshold;
                        const valuation = item.productPrice * item.stock;

                        return (
                          <tr key={idx} className="border-b border-[#1a2554]/50 hover:bg-[#1a2554]/10">
                            <td className="py-2 pr-2">
                              <span className="font-extrabold text-[#b0b8d4] block">{item.productName}</span>
                              <span className="text-[9px] text-slate-500 block uppercase">{item.productBrand} • SKU: {item.productId}</span>
                            </td>
                            <td className="py-2 text-right px-2 text-slate-300 font-bold">
                              {item.productPrice.toLocaleString()}
                            </td>
                            <td className="py-2 text-center px-2">
                              <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
                                lowStock ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15 animate-pulse' : 'bg-[#0f172e] text-slate-300'
                              }`}>
                                {item.stock} units
                              </span>
                            </td>
                            <td className="py-2 text-center px-2 text-slate-500 font-bold">
                              {item.minAlertThreshold} units
                            </td>
                            <td className="py-2 text-right pl-2 text-[#10b981] font-extrabold">
                              {valuation.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 italic">No inventory products match selection</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* C. BRANCH TRANSFERS */}
          {activeSubView === 'transfers' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#1a2554] pb-3">
                <div>
                  <h4 className="font-extrabold text-[#b0b8d4] uppercase text-[11px]">Inter-Branch Logistics Ledger</h4>
                  <span className="text-[9px] text-slate-500 block">Manage transfer pipelines for {selectedBranch.name}</span>
                </div>
                
                <button
                  onClick={() => setIsTransferringStock(true)}
                  className="bg-[#0f172e] hover:bg-[#1a2554] border border-[#222f5a] text-amber-400 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Execute Transfer Out</span>
                </button>
              </div>

              {isTransferringStock && (
                <form onSubmit={handleExecuteTransfer} className="bg-[#0f172e] border border-slate-850 p-4 rounded-xl space-y-3">
                  <span className="text-[10px] text-amber-400 font-black uppercase block border-b border-[#1a2554] pb-1.5">Initiate Inter-Branch Transfer Request</span>
                  
                  {transferError && (
                    <div className="bg-rose-500/10 border border-rose-500/25 p-2.5 rounded-lg text-rose-400 text-[10px] font-bold">
                      ⚠️ {transferError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[#8891ac] text-[10px]">Select Product SKU</label>
                      <select
                        value={transferProdId}
                        onChange={(e) => setTransferProdId(e.target.value)}
                        className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4]"
                        required
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => {
                          const stockItem = branchInventory.find((bi) => bi.productId === p.id);
                          return (
                            <option key={p.id} value={p.id}>
                              {p.name} ({stockItem ? stockItem.stock : 0} in store)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#8891ac] text-[10px]">Destination Branch</label>
                      <select
                        value={transferTargetBranch}
                        onChange={(e) => setTransferTargetBranch(e.target.value as BranchId)}
                        className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4]"
                      >
                        {branches.filter(b => b.id !== selectedBranchId).map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#8891ac] text-[10px]">Quantity to Dispatch</label>
                      <input
                        type="number"
                        required
                        value={transferQty}
                        onChange={(e) => setTransferQty(e.target.value)}
                        className="w-full bg-[#1a2554] border border-[#222f5a] rounded p-1.5 text-[#b0b8d4]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsTransferringStock(false)}
                      className="flex-1 bg-[#1a2554] text-[#8891ac] py-1.5 rounded hover:text-[#b0b8d4] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-1.5 rounded"
                    >
                      Confirm Shipment Release
                    </button>
                  </div>
                </form>
              )}

              {/* Transfers tables: Incoming vs Outgoing */}
              <div className="space-y-4">
                <span className="text-[10px] text-[#3052a3] font-black uppercase tracking-wider block">Inbound shipments heading here</span>
                <div className="space-y-2">
                  {inboundTransfers.length > 0 ? (
                    inboundTransfers.map((t) => (
                      <div key={t.id} className="bg-[#0f172e]/40 p-3 border border-[#1a2554] rounded-xl flex items-center justify-between">
                        <div>
                          <strong className="text-[#b0b8d4] block text-[11px]">{t.productName}</strong>
                          <span className="text-[9px] text-slate-500 block">From: {t.fromBranchName} • Quantity: <strong className="text-slate-300">{t.quantity} units</strong></span>
                          <span className="text-[9px] text-slate-600 block mt-0.5">Dispatched: {t.createdAt.split('T')[0]} • Ref: {t.id}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 shrink-0">
                          {t.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateTransferStatus(t.id, 'shipped')}
                              className="bg-[#3052a3]/10 border border-[#3052a3]/20 text-[#3052a3] text-[9px] px-2 py-1 rounded hover:bg-[#3052a3]/20 font-bold"
                            >
                              Mark Shipped
                            </button>
                          )}
                          {t.status === 'shipped' && (
                            <button
                              onClick={() => handleUpdateTransferStatus(t.id, 'delivered')}
                              className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[9px] px-2 py-1 rounded hover:bg-[#10b981]/20 font-bold flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" /> Receive Stock
                            </button>
                          )}
                          {t.status === 'delivered' && (
                            <span className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[9px] px-2 py-0.5 rounded uppercase font-black">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-[10px] italic">No pending inbound shipments scheduled</div>
                  )}
                </div>

                <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block pt-2">Outbound Shipments Dispatched</span>
                <div className="space-y-2">
                  {outboundTransfers.length > 0 ? (
                    outboundTransfers.map((t) => (
                      <div key={t.id} className="bg-[#0f172e]/40 p-3 border border-[#1a2554] rounded-xl flex items-center justify-between">
                        <div>
                          <strong className="text-[#b0b8d4] block text-[11px]">{t.productName}</strong>
                          <span className="text-[9px] text-slate-500 block">Destination: {t.toBranchName} • Quantity: <strong className="text-slate-300">{t.quantity} units</strong></span>
                          <span className="text-[9px] text-slate-600 block mt-0.5">Ref: {t.id} • Issued by: {t.requestedBy}</span>
                        </div>
                        
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${
                          t.status === 'delivered'
                            ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/15'
                            : t.status === 'shipped'
                            ? 'bg-[#3052a3]/10 text-[#3052a3] border-[#3052a3]/15'
                            : 'bg-[#1a2554] text-slate-500 border-[#222f5a]'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-[10px] italic">No outbound stock shipments dispatched from this showroom</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* D. STORE PERSONNEL */}
          {activeSubView === 'staff' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="border-b border-[#1a2554] pb-3">
                <h4 className="font-extrabold text-[#b0b8d4] uppercase text-[11px]">Showroom Team Staffing</h4>
                <span className="text-[9px] text-slate-500 block">Employees active or assigned to {selectedBranch.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {branchEmployees.length > 0 ? (
                  branchEmployees.map((emp) => (
                    <div key={emp.id} className="bg-[#0f172e]/50 border border-[#1a2554] p-3.5 rounded-xl flex items-start justify-between">
                      <div className="space-y-1">
                        <strong className="text-[#b0b8d4] block">{emp.name}</strong>
                        <span className="text-[10px] text-slate-500 block">{emp.role} • Roster ID: {emp.id}</span>
                        <span className="text-[10px] text-[#8891ac] block"><Phone className="w-3 h-3 text-slate-500 inline mr-1" />{emp.phone}</span>
                      </div>

                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        emp.attendanceStatus === 'checked_in'
                          ? 'bg-[#10b981]/10 text-[#10b981]'
                          : emp.attendanceStatus === 'checked_out'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-[#1a2554] text-slate-500'
                      }`}>
                        {emp.attendanceStatus === 'checked_in' ? 'checked-in' : emp.attendanceStatus === 'checked_out' ? 'checked-out' : 'absent'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-slate-500 italic py-6">No personnel assigned to this showroom. Register staff in Employee tab.</div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
