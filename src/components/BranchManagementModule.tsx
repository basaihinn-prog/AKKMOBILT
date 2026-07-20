/**
 * Enterprise Branch Management Module
 * Manages: Multiple branches, hierarchy, users, inventory, performance metrics
 */

import React, { useState, useMemo } from 'react';
import {
  Building,
  MapPin,
  Users,
  TrendingUp,
  Package,
  DollarSign,
  Phone,
  Mail,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Filter,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Map,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import type { Branch } from '../types';

interface BranchMetrics {
  branchId: string;
  branchName: string;
  monthlyRevenue: number;
  totalRepairs: number;
  totalInventory: number;
  staffCount: number;
  avgRating: number;
  operationHours: string;
  lastAudit?: string;
  complianceScore: number;
}

interface BranchUser {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface BranchTransfer {
  id: string;
  fromBranch: string;
  toBranch: string;
  itemCount: number;
  quantity: number;
  status: 'pending' | 'shipped' | 'delivered';
  date: string;
}

interface BranchManagementModuleProps {
  branches: Branch[];
  onCreateBranch?: (data: any) => void;
  onUpdateBranch?: (branchId: string, data: any) => void;
  onDeleteBranch?: (branchId: string) => void;
}

export default function BranchManagementModule({
  branches,
  onCreateBranch,
  onUpdateBranch,
  onDeleteBranch,
}: BranchManagementModuleProps) {
  const [activeView, setActiveView] = useState<'list' | 'detail' | 'analytics' | 'hierarchy'>('list');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Mock branch metrics
  const branchMetrics: BranchMetrics[] = [
    {
      branchId: 'b-yangon',
      branchName: 'Yangon HQ',
      monthlyRevenue: 85000000,
      totalRepairs: 45,
      totalInventory: 287,
      staffCount: 12,
      avgRating: 4.8,
      operationHours: '09:00 - 20:00',
      complianceScore: 98,
    },
    {
      branchId: 'b-mandalay',
      branchName: 'Mandalay Branch',
      monthlyRevenue: 42000000,
      totalRepairs: 28,
      totalInventory: 140,
      staffCount: 8,
      avgRating: 4.6,
      operationHours: '09:00 - 19:00',
      complianceScore: 95,
    },
    {
      branchId: 'b-naypyitaw',
      branchName: 'Naypyitaw Store',
      monthlyRevenue: 18000000,
      totalRepairs: 12,
      totalInventory: 63,
      staffCount: 4,
      avgRating: 4.4,
      operationHours: '10:00 - 18:00',
      complianceScore: 92,
    },
  ];

  // Mock branch users
  const branchUsers: Record<string, BranchUser[]> = {
    'b-yangon': [
      { id: 'u1', name: 'U Kyaw Swar', role: 'Branch Manager', status: 'active', joinDate: '2024-01-15' },
      { id: 'u2', name: 'Daw Su Su', role: 'Accountant', status: 'active', joinDate: '2024-02-01' },
      { id: 'u3', name: 'Ko Aung Win', role: 'Technician', status: 'active', joinDate: '2024-03-10' },
    ],
    'b-mandalay': [
      { id: 'u4', name: 'Daw Hla Hla', role: 'Branch Manager', status: 'active', joinDate: '2024-01-20' },
      { id: 'u5', name: 'Ko Nay Lin', role: 'Technician', status: 'active', joinDate: '2024-03-05' },
    ],
    'b-naypyitaw': [
      { id: 'u6', name: 'U Aung Ko', role: 'Branch Manager', status: 'active', joinDate: '2024-02-10' },
    ],
  };

  // Mock inter-branch transfers
  const transfers: BranchTransfer[] = [
    { id: 'tr1', fromBranch: 'b-yangon', toBranch: 'b-mandalay', itemCount: 5, quantity: 5, status: 'pending', date: '2026-07-20' },
    { id: 'tr2', fromBranch: 'b-mandalay', toBranch: 'b-naypyitaw', itemCount: 3, quantity: 3, status: 'shipped', date: '2026-07-19' },
    { id: 'tr3', fromBranch: 'b-naypyitaw', toBranch: 'b-yangon', itemCount: 2, quantity: 2, status: 'delivered', date: '2026-07-18' },
  ];

  // Filter and search
  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           branch.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [branches, searchQuery]);

  // Branch performance chart data
  const performanceData = branchMetrics.map(m => ({
    name: m.branchName.split(' ')[0],
    revenue: m.monthlyRevenue / 1000000,
    repairs: m.totalRepairs,
    staff: m.staffCount,
  }));

  const inventoryData = branchMetrics.map(m => ({
    name: m.branchName.split(' ')[0],
    value: m.totalInventory,
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
            <Building size={32} className="text-blue-400" />
            Branch Management
          </h1>
          <p className="text-[#8891ac] mt-1">{branches.length} locations • Manage hierarchy, users & performance</p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <Plus size={18} />
          New Branch
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-slate-700">
        {['list', 'detail', 'analytics', 'hierarchy'].map(view => (
          <button
            key={view}
            onClick={() => {
              setActiveView(view as any);
              if (view !== 'detail') setSelectedBranch(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              activeView === view
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {view === 'list' && <Map size={16} className="inline mr-2" />}
            {view === 'detail' && <Building size={16} className="inline mr-2" />}
            {view === 'analytics' && <BarChart3 size={16} className="inline mr-2" />}
            {view === 'hierarchy' && <ChevronDown size={16} className="inline mr-2" />}
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* LIST VIEW */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-[#8891ac]" size={18} />
              <input
                type="text"
                placeholder="Search branches by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Branch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBranches.map(branch => {
              const metrics = branchMetrics.find(m => m.branchId === branch.id);
              return (
                <div
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranch(branch);
                    setActiveView('detail');
                  }}
                  className="bg-[#222f5a] border border-slate-700 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-600 rounded-lg p-3">
                        <Building size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{branch.name}</h3>
                        <p className="text-sm text-[#8891ac] flex items-center gap-1 mt-1">
                          <MapPin size={14} />
                          {branch.city}
                        </p>
                      </div>
                    </div>
                    <div className="bg-emerald-600/20 text-[#10b981] px-2 py-1 rounded text-xs font-medium">
                      Active
                    </div>
                  </div>

                  {metrics && (
                    <div className="space-y-3 pt-4 border-t border-slate-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#8891ac] flex items-center gap-1">
                          <DollarSign size={14} /> Revenue
                        </span>
                        <span className="font-bold">{(metrics.monthlyRevenue / 1000000).toFixed(1)}M MMK</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#8891ac] flex items-center gap-1">
                          <Users size={14} /> Staff
                        </span>
                        <span className="font-bold">{metrics.staffCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#8891ac] flex items-center gap-1">
                          <Package size={14} /> Inventory
                        </span>
                        <span className="font-bold">{metrics.totalInventory} units</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#8891ac]">Rating</span>
                        <span className="font-bold text-amber-400">★ {metrics.avgRating}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
                    <button className="flex-1 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded font-medium text-sm transition">
                      <Edit size={14} className="inline mr-2" />
                      Edit
                    </button>
                    <button className="flex-1 bg-red-600/20 hover:bg-red-600/30 px-3 py-2 rounded font-medium text-sm text-red-400 transition">
                      <Trash2 size={14} className="inline mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL VIEW */}
      {activeView === 'detail' && selectedBranch && (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedBranch(null)}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4"
          >
            <ChevronRight size={18} className="rotate-180" />
            Back to List
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Branch Info */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-[#222f5a] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">{selectedBranch.name}</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-[#8891ac] text-sm">Location</p>
                    <p className="font-medium flex items-center gap-2 mt-1">
                      <MapPin size={16} className="text-blue-400" />
                      {selectedBranch.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8891ac] text-sm">Manager</p>
                    <p className="font-medium flex items-center gap-2 mt-1">
                      <Users size={16} className="text-[#10b981]" />
                      {selectedBranch.manager}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8891ac] text-sm">Contact</p>
                    <p className="font-medium flex items-center gap-2 mt-1">
                      <Phone size={16} className="text-amber-400" />
                      {selectedBranch.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {branchMetrics.find(m => m.branchId === selectedBranch.id) && (
                <div className="bg-[#222f5a] rounded-lg p-6">
                  <h3 className="font-bold mb-4">Key Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8891ac]">Compliance</span>
                      <span className="font-bold text-[#10b981]">
                        {branchMetrics.find(m => m.branchId === selectedBranch.id)?.complianceScore}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-[#10b981] h-2 rounded-full"
                        style={{
                          width: `${branchMetrics.find(m => m.branchId === selectedBranch.id)?.complianceScore}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Branch Staff & Transfers */}
            <div className="lg:col-span-2 space-y-6">
              {/* Staff List */}
              <div className="bg-[#222f5a] rounded-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Team Members ({branchUsers[selectedBranch.id]?.length || 0})
                </h3>
                <div className="space-y-2">
                  {branchUsers[selectedBranch.id]?.map(user => (
                    <div key={user.id} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-[#8891ac]">{user.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                        <span className="text-sm text-[#8891ac]">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium mt-4 flex items-center justify-center gap-2 transition">
                  <Plus size={16} />
                  Add Team Member
                </button>
              </div>

              {/* Recent Transfers */}
              <div className="bg-[#222f5a] rounded-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Package size={20} />
                  Stock Transfers
                </h3>
                <div className="space-y-2">
                  {transfers
                    .filter(t => t.fromBranch === selectedBranch.id || t.toBranch === selectedBranch.id)
                    .map(transfer => (
                      <div key={transfer.id} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">
                            {branches.find(b => b.id === transfer.fromBranch)?.name} →{' '}
                            {branches.find(b => b.id === transfer.toBranch)?.name}
                          </p>
                          <p className="text-xs text-[#8891ac]">{transfer.quantity} units</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {transfer.status === 'pending' && (
                            <>
                              <Clock size={14} className="text-amber-400" />
                              <span className="text-xs text-amber-400">Pending</span>
                            </>
                          )}
                          {transfer.status === 'shipped' && (
                            <>
                              <TrendingUp size={14} className="text-blue-400" />
                              <span className="text-xs text-blue-400">Shipped</span>
                            </>
                          )}
                          {transfer.status === 'delivered' && (
                            <>
                              <CheckCircle size={14} className="text-[#10b981]" />
                              <span className="text-xs text-[#10b981]">Delivered</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS VIEW */}
      {activeView === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue & Performance */}
            <div className="bg-[#222f5a] rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Branch Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (M MMK)" />
                  <Bar dataKey="repairs" fill="#10B981" name="Repairs" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Inventory Distribution */}
            <div className="bg-[#222f5a] rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Inventory Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Compliance Scores */}
          <div className="bg-[#222f5a] rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Compliance Scores</h2>
            <div className="space-y-4">
              {branchMetrics.map(metric => (
                <div key={metric.branchId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{metric.branchName}</span>
                    <span className="font-bold text-[#10b981]">{metric.complianceScore}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-[#10b981] h-2 rounded-full"
                      style={{ width: `${metric.complianceScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HIERARCHY VIEW */}
      {activeView === 'hierarchy' && (
        <div className="bg-[#222f5a] rounded-lg p-6">
          <h2 className="text-lg font-bold mb-6">Organization Hierarchy</h2>
          <div className="space-y-4">
            <div className="border-l-2 border-blue-500 pl-6 py-4">
              <div className="font-bold text-lg text-blue-400">AKK Mobile Enterprise</div>
              <p className="text-[#8891ac] text-sm mt-1">Head Office</p>

              <div className="mt-6 space-y-4 border-l-2 border-slate-600 pl-6">
                {branches.map(branch => (
                  <div key={branch.id} className="border-l-2 border-slate-600 pl-6 py-3">
                    <div className="font-medium text-[#10b981]">{branch.name}</div>
                    <div className="text-sm text-[#8891ac] mt-1 flex items-center gap-2">
                      <Users size={14} />
                      Manager: {branch.manager}
                    </div>
                    <div className="text-sm text-[#8891ac] flex items-center gap-2">
                      <MapPin size={14} />
                      {branch.city}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
