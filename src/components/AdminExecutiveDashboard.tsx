import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Wrench,
  Users,
  Search,
  Bell,
  Activity,
  History,
  Building,
  TrendingDown,
  ArrowUpRight,
  RefreshCw,
  Clock,
  ShieldAlert,
  Server,
  Zap,
  CheckCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { PosSale, Expense, JoinedInventory, RepairTicket, Customer, Branch, PhoneProduct } from '../types';

interface AdminExecutiveDashboardProps {
  sales: PosSale[];
  expenses: Expense[];
  inventories: JoinedInventory[];
  repairs: RepairTicket[];
  customers: Customer[];
  branches: Branch[];
  products: PhoneProduct[];
  onRefreshAllData?: () => void;
  activeSimulatedRole: string;
}

interface AuditLogEntry {
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  ip: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { timestamp: "2026-07-19 21:30", user: "Daw Su Su", role: "Branch Manager", action: "SHIFT_CLOSE", details: "Yangon Head Office cash drawer closed successfully. Discrepancy: 0 MMK.", ip: "192.168.1.104" },
  { timestamp: "2026-07-19 21:15", user: "U Nay Win", role: "Cashier", action: "POS_SALE_INVOICE", details: "Generated Sale Receipt #S-8431 with 1x iPhone 15 Pro, total 4,200,000 MMK.", ip: "192.168.1.109" },
  { timestamp: "2026-07-19 20:45", user: "Ko Aung Win", role: "Technician", action: "REPAIR_STATUS_CHANGE", details: "Ticket #R-048 status changed to 'READY' for Samsung S24 AMOLED Screen.", ip: "192.168.1.112" },
  { timestamp: "2026-07-19 19:30", user: "Super Admin", role: "Super Admin", action: "GATEWAY_COMMIT", details: "Modified secure API gateway tokens for partner Telegram notification bot.", ip: "203.81.65.23" },
  { timestamp: "2026-07-19 18:20", user: "Maing Ye Naing", role: "Sales", action: "LOYALTY_REGISTRATION", details: "Registered VIP member U Khin Maung with tier Gold +500 points.", ip: "192.168.2.115" },
  { timestamp: "2026-07-19 17:05", user: "Owner", role: "Owner", action: "EDIT_INVENTORY", details: "Edited low stock alarm threshold to 5 for iPhone 15 Pro handset.", ip: "111.84.192.42" }
];

export default function AdminExecutiveDashboard({
  sales,
  expenses,
  inventories,
  repairs,
  customers,
  branches,
  products,
  onRefreshAllData,
  activeSimulatedRole
}: AdminExecutiveDashboardProps) {
  // Perspective state: owner, super_admin, branch
  const [perspective, setPerspective] = useState<'owner' | 'super_admin' | 'branch'>('owner');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('b-yangon');
  const [auditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Global Search State
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{
    products: PhoneProduct[];
    customers: Customer[];
    repairs: RepairTicket[];
  } | null>(null);

  const handleGlobalSearchChange = (val: string) => {
    setGlobalSearch(val);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }

    const filteredProds = products.filter(
      (p) => p.name.toLowerCase().includes(val.toLowerCase()) || p.brand.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 3);

    const filteredCusts = customers.filter(
      (c) => c.name.toLowerCase().includes(val.toLowerCase()) || c.phone.includes(val)
    ).slice(0, 3);

    const filteredRepairs = repairs.filter(
      (r) => r.customerName.toLowerCase().includes(val.toLowerCase()) || r.deviceModel.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 3);

    setSearchResults({
      products: filteredProds,
      customers: filteredCusts,
      repairs: filteredRepairs
    });
  };

  // Filter metrics based on selected perspective
  const filteredSales = perspective === 'branch'
    ? sales.filter((s) => s.branchId === selectedBranchId)
    : sales;

  const filteredExpenses = perspective === 'branch'
    ? expenses.filter((e) => e.branchId === selectedBranchId)
    : expenses;

  const filteredInventories = perspective === 'branch'
    ? inventories.filter((i) => i.branchId === selectedBranchId)
    : inventories;

  const filteredRepairs = perspective === 'branch'
    ? repairs.filter((r) => r.branchId === selectedBranchId)
    : repairs;

  // KPI calculations
  const grossSalesValue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalTaxCollected = filteredSales.reduce((sum, s) => sum + s.taxAmount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const estimatedCogs = filteredSales.reduce((sum, s) => {
    const origSubtotal = s.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return sum + Math.round(origSubtotal * 0.72); // 72% average cost of goods
  }, 0);

  const netSurplus = grossSalesValue - totalExpenses - estimatedCogs;
  const stockAssetValuation = filteredInventories.reduce((sum, item) => sum + item.productPrice * item.stock, 0);
  const stockUnitQuantity = filteredInventories.reduce((sum, item) => sum + item.stock, 0);

  const lowStockCount = filteredInventories.filter((i) => i.stock <= i.minAlertThreshold).length;
  const activeRepairsCount = filteredRepairs.filter((r) => r.status !== 'delivered' && r.status !== 'ready').length;
  const repairPipelineRevenue = filteredRepairs.reduce((sum, r) => sum + r.estimatedCost, 0);

  // Recharts Sales Over Time
  const getSalesTrends = () => {
    const daily: Record<string, { revenue: number; margin: number }> = {};
    const now = Date.now();
    for (let i = 4; i >= 0; i--) {
      const dStr = new Date(now - 3600000 * 24 * i).toISOString().split('T')[0];
      daily[dStr] = { revenue: 0, margin: 0 };
    }

    filteredSales.forEach((s) => {
      const day = s.createdAt.split('T')[0];
      if (daily[day]) {
        daily[day].revenue += s.totalAmount;
        daily[day].margin += Math.round(s.totalAmount * 0.28); // estimated 28% gross margin
      }
    });

    return Object.keys(daily).sort().map((date) => ({
      date: date.substring(5), // MM-DD
      Revenue: daily[date].revenue,
      Margin: daily[date].margin
    }));
  };

  // Recharts Expense category breakdown
  const getExpensesBreakdown = () => {
    const categories: Record<string, number> = { Rent: 0, Salary: 0, Utilities: 0, Marketing: 0, 'Repair Parts': 0, Other: 0 };
    filteredExpenses.forEach((e) => {
      if (categories[e.category] !== undefined) {
        categories[e.category] += e.amount;
      } else {
        categories['Other'] += e.amount;
      }
    });

    const colors = ['#f43f5e', '#a855f7', '#6366f1', '#3b82f6', '#10b981', '#64748b'];
    return Object.keys(categories)
      .filter((k) => categories[k] > 0)
      .map((key, idx) => ({
        name: key,
        value: categories[key],
        color: colors[idx % colors.length]
      }));
  };

  // Branch Revenue vs Expenses comparison (Owner only)
  const getBranchesPerformance = () => {
    return branches.map((b) => {
      const rev = sales.filter((s) => s.branchId === b.id).reduce((acc, x) => acc + x.totalAmount, 0);
      const exp = expenses.filter((e) => e.branchId === b.id).reduce((acc, x) => acc + x.amount, 0);
      return {
        name: b.name.replace(' Branch', '').replace(' Showroom', ''),
        Revenue: rev,
        Expenses: exp
      };
    });
  };

  return (
    <div className="space-y-6" id="executive-dashboard-root">
      
      {/* 1. Global Search & Perspective Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-card/30 border border-border rounded-2xl p-4.5">
        
        {/* Global search input */}
        <div className="relative flex-1 bg-surface border border-slate-850 hover:border-border rounded-xl px-3 py-2 flex items-center space-x-2.5 font-mono text-xs">
          <Search className="w-4 h-4 text-subtle shrink-0" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => handleGlobalSearchChange(e.target.value)}
            placeholder="Search Products, CRM Tiers, Repairs, Staff ID..."
            className="w-full bg-transparent text-xs text-muted outline-none"
          />
          {globalSearch && (
            <button
              onClick={() => {
                setGlobalSearch('');
                setSearchResults(null);
              }}
              className="text-[9px] text-subtle hover:text-muted uppercase font-bold"
            >
              Clear
            </button>
          )}

          {/* Floating Global Search Dropdown */}
          {searchResults && (
            <div className="absolute top-12 left-0 right-0 bg-surface border border-border rounded-xl p-3.5 shadow-2xl z-50 space-y-3.5 font-mono text-[11px] text-subtle">
              {/* Product Results */}
              {searchResults.products.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] text-subtle uppercase font-black tracking-wider block">Handset Products Match</span>
                  {searchResults.products.map((p) => (
                    <div key={p.id} className="flex justify-between items-center bg-card/40 p-1.5 rounded border border-border">
                      <span className="text-muted font-extrabold">{p.name} <span className="text-subtle">({p.brand})</span></span>
                      <strong className="text-success">{p.price.toLocaleString()} MMK</strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Results */}
              {searchResults.customers.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] text-primary uppercase font-black tracking-wider block">VIP Customer Guest Match</span>
                  {searchResults.customers.map((c) => (
                    <div key={c.id} className="flex justify-between items-center bg-card/40 p-1.5 rounded border border-border">
                      <span className="text-muted font-extrabold">{c.name} <span className="text-subtle">({c.phone})</span></span>
                      <strong className="text-rose-400 text-[10px] uppercase font-bold">{c.tier} Member</strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Repair Results */}
              {searchResults.repairs.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] text-pink-400 uppercase font-black tracking-wider block">Service Diagnostics Match</span>
                  {searchResults.repairs.map((r) => (
                    <div key={r.id} className="flex justify-between items-center bg-card/40 p-1.5 rounded border border-border">
                      <span className="text-muted font-extrabold">{r.customerName} <span className="text-subtle">({r.deviceModel})</span></span>
                      <span className="text-subtle text-[10px] uppercase font-bold">{r.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.products.length === 0 && searchResults.customers.length === 0 && searchResults.repairs.length === 0 && (
                <div className="text-center text-subtle italic py-3">No master records found matching query</div>
              )}
            </div>
          )}
        </div>

        {/* Perspective Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface p-1 rounded-xl border border-slate-850 font-mono text-[10px] font-bold">
          <button
            onClick={() => setPerspective('owner')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              perspective === 'owner'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            Owner View
          </button>
          <button
            onClick={() => setPerspective('super_admin')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              perspective === 'super_admin'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            Super Admin View
          </button>
          <button
            onClick={() => setPerspective('branch')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              perspective === 'branch'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            Branch View
          </button>
        </div>

        {/* Branch Context Selector (Visible only on Branch Perspective) */}
        {perspective === 'branch' && (
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-surface border border-slate-850 hover:border-border text-amber-400 font-mono font-bold text-xs rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id} className="bg-surface text-muted">
                {b.name}
              </option>
            ))}
          </select>
        )}

      </div>

      {/* 2. live KPI Bento Grid Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        {/* KPI 1: Consolidated Revenue */}
        <div className="bg-card/15 border border-border rounded-2xl p-4.5 space-y-2 relative overflow-hidden group hover:border-border transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Gross Retail Turnover</span>
            <div className="p-1.5 bg-success/10 text-success rounded-lg">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <strong className="text-xl sm:text-2xl text-success block font-black">
              {grossSalesValue.toLocaleString()} MMK
            </strong>
            <div className="flex items-center space-x-1 mt-1 text-[9px] text-subtle leading-none">
              <span>GST Included:</span>
              <strong className="text-muted">{totalTaxCollected.toLocaleString()} MMK</strong>
            </div>
          </div>
        </div>

        {/* KPI 2: Net Surplus */}
        <div className="bg-card/15 border border-border rounded-2xl p-4.5 space-y-2 relative overflow-hidden group hover:border-border transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Estimated Net Margin</span>
            <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <strong className="text-xl sm:text-2xl text-rose-400 block font-black">
              {netSurplus.toLocaleString()} MMK
            </strong>
            <div className="flex items-center space-x-1 mt-1 text-[9px] text-subtle leading-none">
              <span>COGS deductions:</span>
              <strong className="text-subtle">-{estimatedCogs.toLocaleString()} MMK</strong>
            </div>
          </div>
        </div>

        {/* KPI 3: Stock asset valuation */}
        <div className="bg-card/15 border border-border rounded-2xl p-4.5 space-y-2 relative overflow-hidden group hover:border-border transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Showroom Asset Valuation</span>
            <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <strong className="text-xl sm:text-2xl text-accent block font-black">
              {stockAssetValuation.toLocaleString()} MMK
            </strong>
            <div className="flex items-center space-x-1 mt-1 text-[9px] text-subtle leading-none">
              <span>Physical Balance:</span>
              <strong className="text-primary">{stockUnitQuantity} pcs</strong>
              <span className="text-subtle">•</span>
              <strong className="text-amber-400 font-black">{lowStockCount} alerts</strong>
            </div>
          </div>
        </div>

        {/* KPI 4: Service Hardware Diagnostics */}
        <div className="bg-card/15 border border-border rounded-2xl p-4.5 space-y-2 relative overflow-hidden group hover:border-border transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Service intake status</span>
            <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <strong className="text-xl sm:text-2xl text-primary block font-black">
              {activeRepairsCount} tickets active
            </strong>
            <div className="flex items-center space-x-1 mt-1 text-[9px] text-subtle leading-none">
              <span>Est Pipe Val:</span>
              <strong className="text-success">{repairPipelineRevenue.toLocaleString()} MMK</strong>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Recharts Graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales trends area chart */}
        <div className="lg:col-span-8 bg-card/15 border border-border rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono">Consolidated Sales trends over time (MMK)</span>
            <span className="text-[9px] font-mono font-bold bg-surface border border-slate-850 px-2 py-0.5 rounded text-primary">REVENUE VS ESTIMATED PROFIT</span>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getSalesTrends()} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSalesRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSalesMargin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} className="font-mono" tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} className="font-mono" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ fontFamily: 'monospace', fontSize: '10px', color: '#64748b' }}
                  itemStyle={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#c084fc" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesRev)" name="Sales Revenue" />
                <Area type="monotone" dataKey="Margin" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorSalesMargin)" name="Gross Profit Margin" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses category pie chart */}
        <div className="lg:col-span-4 bg-card/15 border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono">Operating Expenses Categories</span>
          
          <div className="h-44 flex items-center justify-center relative">
            {getExpensesBreakdown().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getExpensesBreakdown()}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {getExpensesBreakdown().map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '10px' }}
                    itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center font-mono text-[10px] text-subtle">No OPEX costs recorded on system ledger</div>
            )}
            
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[8px] text-subtle font-mono font-bold uppercase">Expenses</span>
              <strong className="text-xs font-black text-muted font-mono">
                {totalExpenses.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono text-subtle">
            {getExpensesBreakdown().map((entry, idx) => (
              <div key={idx} className="flex items-center space-x-1.5 px-2 py-1 bg-surface/40 rounded border border-border/40">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="truncate flex-1">{entry.name}</span>
                <strong className="text-muted">{((entry.value / totalExpenses) * 100).toFixed(0)}%</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Infrastructure & Local Metrics Row (Super Admin vs. Branch details) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Showroom output comparison (Only relevant for Owner) OR Infrastructure Status (Super Admin) */}
        {perspective !== 'super_admin' ? (
          <div className="bg-card/15 border border-border rounded-2xl p-5 space-y-4 font-mono text-xs">
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider block">Showroom Performance Comparison</span>
            <div className="space-y-4">
              {getBranchesPerformance().map((b, idx) => {
                const maxVal = Math.max(...getBranchesPerformance().map((x) => x.Revenue)) || 1;
                const barPct = Math.min(100, Math.round((b.Revenue / maxVal) * 100));

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-[11px]">
                      <span className="font-extrabold text-muted">{b.name} Office</span>
                      <div className="space-x-1.5 text-[9px]">
                        <span className="text-subtle">Sales:</span>
                        <strong className="text-success">{b.Revenue.toLocaleString()}</strong>
                        <span className="text-subtle">|</span>
                        <span className="text-subtle">OPEX:</span>
                        <strong className="text-rose-400">{b.Expenses.toLocaleString()}</strong>
                      </div>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
                      <div
                        className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-card/15 border border-border rounded-2xl p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Infrastructure Server Status</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[9px] text-success font-extrabold">ONLINE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] text-subtle">
              <div className="bg-surface border border-border p-2.5 rounded-xl space-y-1">
                <span className="text-subtle uppercase font-bold text-[8px]">Inbound API Port</span>
                <strong className="text-muted block flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-primary" />
                  <span>Port 3000 Ingress</span>
                </strong>
              </div>
              <div className="bg-surface border border-border p-2.5 rounded-xl space-y-1">
                <span className="text-subtle uppercase font-bold text-[8px]">Database Backup State</span>
                <strong className="text-muted block flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-primary" />
                  <span>Supabase Live CDC</span>
                </strong>
              </div>
              <div className="bg-surface border border-border p-2.5 rounded-xl space-y-1">
                <span className="text-subtle uppercase font-bold text-[8px]">Antigravity Engine</span>
                <strong className="text-muted block flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gemini v2 API Active</span>
                </strong>
              </div>
              <div className="bg-surface border border-border p-2.5 rounded-xl space-y-1">
                <span className="text-subtle uppercase font-bold text-[8px]">E-Load VTU Gateways</span>
                <strong className="text-muted block flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-success" />
                  <span>MPT/Atom/Ooredoo</span>
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Right: Active Notifications Hub & timeline */}
        <div className="bg-card/15 border border-border rounded-2xl p-5 space-y-3.5 font-mono text-xs">
          <div className="flex justify-between items-baseline border-b border-border pb-2">
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider flex items-center space-x-1">
              <Bell className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Active Notifications Hub</span>
            </span>
            <span className="text-[9px] text-rose-400 bg-rose-500/10 px-1.5 rounded font-black">4 CRITICAL</span>
          </div>

          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            <div className="bg-surface border-l-2 border-rose-500 p-2.5 rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-muted text-[10px] block font-bold">Thilawa Warehouse Low Stock Warning</strong>
                <p className="text-[9px] text-subtle mt-0.5">Handset stock SKU: iPhone 15 Pro is critically low (1 unit remaining). Dispatch transfer request.</p>
              </div>
            </div>

            <div className="bg-surface border-l-2 border-rose-500 p-2.5 rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-muted text-[10px] block font-bold">Large Outgoing OPEX recorded</strong>
                <p className="text-[9px] text-subtle mt-0.5">Mandalay Branch manager recorded a cash expense of 650,000 MMK under 'Rent'.</p>
              </div>
            </div>

            <div className="bg-surface border-l-2 border-amber-500 p-2.5 rounded-xl flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-muted text-[10px] block font-bold">Hardware Repair Ticket Overdue</strong>
                <p className="text-[9px] text-subtle mt-0.5">Ticket #R-048 (AMOLED glass service) is past estimated delivery. assigned: Technician Aung Win.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Business Audit Ledger */}
      <div className="bg-card/15 border border-border rounded-2xl p-5 space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono flex items-center space-x-1">
              <History className="w-3.5 h-3.5 text-primary" />
              <span>Enterprise Audit Trail Logs</span>
            </span>
            <p className="text-[10px] text-subtle font-mono mt-1">Chronological record of write operations executed across active branches.</p>
          </div>
          <span className="text-[9px] font-mono text-subtle">SIMULATING ACTIVE ROLE: <strong className="text-primary uppercase">{activeSimulatedRole}</strong></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-border text-subtle font-bold uppercase text-[10px]">
                <th className="py-2 pr-2">Timestamp</th>
                <th className="py-2 px-2">Authorized User</th>
                <th className="py-2 px-2 text-center">Action Type</th>
                <th className="py-2 px-2">Transaction Details</th>
                <th className="py-2 pl-2 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="border-b border-border/50 text-[11px] hover:bg-card/10 text-subtle">
                  <td className="py-2.5 pr-2 whitespace-nowrap text-subtle">{log.timestamp}</td>
                  <td className="py-2.5 px-2 font-bold text-muted">
                    <span>{log.user}</span>
                    <span className="text-[9px] text-subtle block">{log.role}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="bg-surface border border-slate-850 text-primary font-bold text-[9px] px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 max-w-xs truncate leading-normal text-muted" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-2.5 pl-2 text-right text-subtle font-bold">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
