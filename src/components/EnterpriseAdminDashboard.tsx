/**
 * Enterprise Admin Dashboard Component
 * Features: Owner Dashboard, Super Admin Dashboard, KPIs, Charts, Global Search, Notifications, Activity Timeline
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Bell,
  Clock,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  Calendar,
  Activity,
  LogOut,
  Settings,
  Home,
  Shield,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import type {
  PosSale,
  RepairTicket,
  Customer,
  Branch,
  Employee,
  SystemNotification,
  ActivityTimeline,
  AuditLog,
} from '../types';

interface EnterpriseAdminDashboardProps {
  userRole: 'Owner' | 'Super Admin' | 'Admin' | 'Branch Manager';
  branchId: string;
  sales: PosSale[];
  repairs: RepairTicket[];
  customers: Customer[];
  branches: Branch[];
  employees: Employee[];
  onViewDetails?: (resource: string, id: string) => void;
}

export default function EnterpriseAdminDashboard({
  userRole,
  branchId,
  sales,
  repairs,
  customers,
  branches,
  employees,
  onViewDetails,
}: EnterpriseAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'kpis' | 'analytics' | 'search' | 'notifications' | 'activity'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(branchId);
  const [selectedDateRange, setSelectedDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Filter data by branch and role
  const filteredData = useMemo(() => {
    let salesToUse = sales;
    let repairsToUse = repairs;
    let employeesToUse = employees;

    if (userRole !== 'Owner' && userRole !== 'Super Admin') {
      salesToUse = sales.filter(s => s.branchId === selectedBranch);
      repairsToUse = repairs.filter(r => r.branchId === selectedBranch);
      employeesToUse = employees.filter(e => e.branchId === selectedBranch);
    } else if (selectedBranch !== 'all') {
      salesToUse = sales.filter(s => s.branchId === selectedBranch);
      repairsToUse = repairs.filter(r => r.branchId === selectedBranch);
      employeesToUse = employees.filter(e => e.branchId === selectedBranch);
    }

    return { salesToUse, repairsToUse, employeesToUse };
  }, [sales, repairs, employees, selectedBranch, userRole]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalSales = filteredData.salesToUse.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalRepairs = filteredData.repairsToUse.length;
    const totalCustomers = customers.length;
    const totalStaff = filteredData.employeesToUse.length;
    const checkedInStaff = filteredData.employeesToUse.filter(e => e.attendanceStatus === 'checked_in').length;
    const repairsCompleted = filteredData.repairsToUse.filter(r => r.status === 'delivered').length;
    const avgRepairCost =
      totalRepairs > 0
        ? Math.round(
            filteredData.repairsToUse.reduce((sum, r) => sum + r.estimatedCost, 0) / totalRepairs
          )
        : 0;

    return {
      totalSales,
      totalRevenue: Math.round(totalSales * 1.05), // with tax
      totalRepairs,
      repairsCompleted,
      totalCustomers,
      totalStaff,
      checkedInStaff,
      avgRepairCost,
      avgSaleValue: totalSales > 0 ? Math.round(totalSales / filteredData.salesToUse.length) : 0,
    };
  }, [filteredData, customers]);

  // Global search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results = [];

    // Search in sales
    filteredData.salesToUse.forEach(sale => {
      if (
        sale.customerName.toLowerCase().includes(query) ||
        sale.customerPhone.includes(query) ||
        sale.id.includes(query)
      ) {
        results.push({ type: 'sale', id: sale.id, title: sale.id, subtitle: sale.customerName });
      }
    });

    // Search in repairs
    filteredData.repairsToUse.forEach(repair => {
      if (
        repair.customerName.toLowerCase().includes(query) ||
        repair.customerPhone.includes(query) ||
        repair.id.includes(query)
      ) {
        results.push({ type: 'repair', id: repair.id, title: repair.id, subtitle: repair.customerName });
      }
    });

    // Search in employees
    filteredData.employeesToUse.forEach(emp => {
      if (
        emp.name.toLowerCase().includes(query) ||
        emp.phone.includes(query) ||
        emp.id.includes(query)
      ) {
        results.push({ type: 'employee', id: emp.id, title: emp.name, subtitle: emp.role });
      }
    });

    // Search in customers
    customers.forEach(cust => {
      if (
        cust.name.toLowerCase().includes(query) ||
        cust.phone.includes(query)
      ) {
        results.push({ type: 'customer', id: cust.id, title: cust.name, subtitle: cust.phone });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, filteredData, customers]);

  // Mock notifications
  const notifications: SystemNotification[] = [
    {
      id: 'n1',
      userId: 'user1',
      title: 'Low Stock Alert',
      message: 'iPhone 15 Pro stock below minimum threshold at Mandalay branch',
      type: 'warning',
      resourceType: 'inventory',
      resourceId: 'inv-1',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'n2',
      userId: 'user1',
      title: 'High Value Repair',
      message: 'REP-9482: Repair exceeds 400,000 MMK threshold',
      type: 'info',
      resourceType: 'repair',
      resourceId: 'REP-9482',
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'n3',
      userId: 'user1',
      title: 'Attendance Alert',
      message: '3 employees not yet checked in today',
      type: 'warning',
      resourceType: 'employee',
      resourceId: 'emp-bulk',
      isRead: false,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  // Mock activity timeline
  const activityTimeline: ActivityTimeline[] = [
    {
      id: 'act1',
      userId: 'user2',
      userName: 'Daw Su Su',
      action: 'created',
      description: 'New repair ticket created',
      resourceType: 'repair',
      resourceId: 'REP-9482',
      resourceName: 'iPhone 15 Pro - Shattered Screen',
      branchId: 'b-yangon',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      severity: 'info',
    },
    {
      id: 'act2',
      userId: 'user3',
      userName: 'Ko Min Thuta',
      action: 'update',
      description: 'Sale completed',
      resourceType: 'sale',
      resourceId: 'SAL-10021',
      resourceName: 'iPhone 17 Pro Max - 3,900,000 MMK',
      branchId: 'b-yangon',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      severity: 'info',
    },
    {
      id: 'act3',
      userId: 'user1',
      userName: 'U Kyaw Swar',
      action: 'update',
      description: 'Branch inventory transfer approved',
      resourceType: 'inventory',
      resourceId: 'TR-502',
      resourceName: 'iPhone 15 Pro (5 units) Yangon to Mandalay',
      branchId: 'b-yangon',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      severity: 'info',
    },
  ];

  // Chart data
  const dailySalesData = [
    { date: 'Mon', sales: 4200000, repairs: 1200000 },
    { date: 'Tue', sales: 3800000, repairs: 900000 },
    { date: 'Wed', sales: 5100000, repairs: 1500000 },
    { date: 'Thu', sales: 4900000, repairs: 1100000 },
    { date: 'Fri', sales: 6200000, repairs: 1800000 },
    { date: 'Sat', sales: 5800000, repairs: 1300000 },
    { date: 'Sun', sales: 4100000, repairs: 800000 },
  ];

  const branchPerformance = branches.map(branch => ({
    name: branch.name,
    sales: filteredData.salesToUse
      .filter(s => s.branchId === branch.id)
      .reduce((sum, s) => sum + s.totalAmount, 0),
    repairs: filteredData.repairsToUse.filter(r => r.branchId === branch.id).length,
  }));

  const paymentMethodDistribution = [
    { name: 'Cash', value: filteredData.salesToUse.filter(s => s.paymentMethod === 'cash').length },
    { name: 'KBZ Pay', value: filteredData.salesToUse.filter(s => s.paymentMethod === 'kbzpay').length },
    { name: 'Wave Pay', value: filteredData.salesToUse.filter(s => s.paymentMethod === 'wavepay').length },
    { name: 'Credit', value: filteredData.salesToUse.filter(s => s.paymentMethod === 'credit').length },
    { name: 'Other', value: filteredData.salesToUse.filter(s => !['cash', 'kbzpay', 'wavepay', 'credit'].includes(s.paymentMethod)).length },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const repairStatusDistribution = [
    { name: 'Received', value: filteredData.repairsToUse.filter(r => r.status === 'received').length },
    { name: 'Diagn.', value: filteredData.repairsToUse.filter(r => r.status === 'diagnostic').length },
    { name: 'Repair', value: filteredData.repairsToUse.filter(r => r.status === 'repairing').length },
    { name: 'Testing', value: filteredData.repairsToUse.filter(r => r.status === 'testing').length },
    { name: 'Ready', value: filteredData.repairsToUse.filter(r => r.status === 'ready').length },
    { name: 'Delivered', value: filteredData.repairsToUse.filter(r => r.status === 'delivered').length },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-card via-slate-800 to-card min-h-screen text-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {userRole} Dashboard
          </h1>
          <p className="text-subtle mt-1">Real-time business intelligence & operations</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-elevated rounded-lg transition"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button className="p-2 hover:bg-elevated rounded-lg transition">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-subtle" size={18} />
          <input
            type="text"
            placeholder="Search sales, repairs, employees, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-elevated border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-elevated border border-slate-600 mt-1 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchResults.map(result => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => {
                    onViewDetails?.(result.type, result.id);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-600 border-b border-slate-600 last:border-b-0"
                >
                  <div className="text-sm font-medium">{result.title}</div>
                  <div className="text-xs text-subtle">{result.subtitle}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="bg-elevated border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="all">All Branches</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value as any)}
          className="bg-elevated border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-border">
        {['overview', 'kpis', 'analytics', 'search', 'notifications', 'activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-muted hover:bg-elevated'
            }`}
          >
            {tab === 'overview' && <Home size={16} className="inline mr-2" />}
            {tab === 'kpis' && <TrendingUp size={16} className="inline mr-2" />}
            {tab === 'analytics' && <BarChart3 size={16} className="inline mr-2" />}
            {tab === 'search' && <Search size={16} className="inline mr-2" />}
            {tab === 'notifications' && <Bell size={16} className="inline mr-2" />}
            {tab === 'activity' && <Activity size={16} className="inline mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold mt-2">{(kpis.totalRevenue / 1000000).toFixed(1)}M MMK</p>
                  <p className="text-blue-200 text-xs mt-2">↑ 12% from last period</p>
                </div>
                <DollarSign size={40} className="text-blue-200 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200 text-sm font-medium">Active Repairs</p>
                  <p className="text-2xl font-bold mt-2">{kpis.totalRepairs}</p>
                  <p className="text-emerald-200 text-xs mt-2">{kpis.repairsCompleted} completed</p>
                </div>
                <Zap size={40} className="text-emerald-200 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-200 text-sm font-medium">Total Customers</p>
                  <p className="text-2xl font-bold mt-2">{kpis.totalCustomers}</p>
                  <p className="text-amber-200 text-xs mt-2">Avg. {(kpis.avgSaleValue / 1000000).toFixed(1)}M/sale</p>
                </div>
                <Users size={40} className="text-amber-200 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Staff On Duty</p>
                  <p className="text-2xl font-bold mt-2">{kpis.checkedInStaff}/{kpis.totalStaff}</p>
                  <p className="text-purple-200 text-xs mt-2">{Math.round((kpis.checkedInStaff/kpis.totalStaff)*100)}% present</p>
                </div>
                <Users size={40} className="text-purple-200 opacity-50" />
              </div>
            </div>
          </div>

          {/* Sales & Repair Trend Chart */}
          <div className="bg-elevated rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <LineChartIcon size={20} />
              7-Day Performance Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailySalesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRepairs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px', color: '#E2E8F0' }} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  name="Sales Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="repairs"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorRepairs)"
                  name="Repair Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB: KPIs */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branch Performance */}
            <div className="bg-elevated rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-bold mb-4">Branch Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={branchPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94A3B8" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                  <Legend />
                  <Bar dataKey="sales" fill="#3B82F6" name="Sales (MMK)" />
                  <Bar dataKey="repairs" fill="#10B981" name="Repairs" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Methods */}
            <div className="bg-elevated rounded-lg p-6 shadow-lg">
              <h2 className="text-lg font-bold mb-4">Payment Methods Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Repair Status Distribution */}
          <div className="bg-elevated rounded-lg p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Repair Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={repairStatusDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                <Bar dataKey="value" fill="#F59E0B" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB: SEARCH */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-subtle" size={20} />
            <input
              type="text"
              placeholder="Search across all data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-elevated border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {searchResults.map(result => (
                <div key={`${result.type}-${result.id}`} className="bg-elevated rounded-lg p-4 hover:bg-elevated cursor-pointer transition">
                  <div className="flex items-center gap-3">
                    {result.type === 'sale' && <DollarSign size={20} className="text-blue-400" />}
                    {result.type === 'repair' && <Zap size={20} className="text-amber-400" />}
                    {result.type === 'employee' && <Users size={20} className="text-success" />}
                    {result.type === 'customer' && <Users size={20} className="text-purple-400" />}
                    <div>
                      <p className="font-medium">{result.title}</p>
                      <p className="text-sm text-subtle">{result.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-elevated rounded-lg p-8 text-center">
              <Search size={40} className="mx-auto text-subtle mb-4" />
              <p className="text-subtle">
                {searchQuery ? 'No results found' : 'Enter a search term to find sales, repairs, employees, or customers'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`bg-elevated rounded-lg p-4 border-l-4 ${
                  notif.type === 'warning'
                    ? 'border-l-amber-400'
                    : notif.type === 'error'
                    ? 'border-l-red-400'
                    : 'border-l-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {notif.type === 'warning' && <AlertCircle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />}
                    {notif.type === 'error' && <AlertTriangle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />}
                    {notif.type === 'info' && <Info size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />}
                    {notif.type === 'success' && <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="font-medium">{notif.title}</p>
                      <p className="text-sm text-subtle mt-1">{notif.message}</p>
                      <p className="text-xs text-subtle mt-2">
                        <Clock size={12} className="inline mr-1" />
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-elevated rounded-lg p-8 text-center">
              <Bell size={40} className="mx-auto text-subtle mb-4" />
              <p className="text-subtle">No notifications at this time</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="relative">
            {activityTimeline.map((item, idx) => (
              <div key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.action === 'create' ? 'bg-blue-600' :
                    item.action === 'update' ? 'bg-emerald-600' :
                    'bg-purple-600'
                  }`}>
                    {item.action === 'create' && <Plus size={16} />}
                    {item.action === 'update' && <CheckCircle size={16} />}
                    {item.action === 'delete' && <AlertTriangle size={16} />}
                  </div>
                  {idx < activityTimeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-elevated my-2" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="font-medium">
                    {item.userName} <span className="text-subtle">{item.action}d</span>
                  </p>
                  <p className="text-sm text-subtle">{item.resourceName}</p>
                  <p className="text-xs text-subtle mt-1">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
