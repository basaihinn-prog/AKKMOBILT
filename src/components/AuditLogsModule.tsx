/**
 * Enterprise Audit Logs & Activity Timeline Module
 * Features: Complete audit trail, activity timeline, change tracking, filtering, export
 */

import React, { useState, useMemo } from 'react';
import {
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  ChevronDown,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  FileText,
  Trash2,
  Edit,
  Plus,
  TrendingUp,
  BarChart3,
  Activity,
  Database,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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

import type { AuditLog, ActivityTimeline, AuditAction, AuditResourceType } from '../types';

interface AuditLogsModuleProps {
  onExportLogs?: () => void;
  onFilterLogs?: (filters: any) => void;
}

export default function AuditLogsModule({
  onExportLogs,
  onFilterLogs,
}: AuditLogsModuleProps) {
  const [activeView, setActiveView] = useState<'logs' | 'timeline' | 'analytics' | 'retention'>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterResourceType, setFilterResourceType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);

  // Mock audit logs
  const auditLogs: AuditLog[] = [
    {
      id: 'audit-001',
      userId: 'user-1',
      userName: 'Daw Su Su',
      action: 'create',
      resourceType: 'repair',
      resourceId: 'REP-9482',
      resourceName: 'iPhone 15 Pro - Shattered Screen',
      branchId: 'b-yangon',
      changes: {
        before: {},
        after: {
          customerName: 'Ko Min Thuta',
          issueDescription: 'Shattered front panel, flickering bottom screen',
          status: 'received',
        },
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success',
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'audit-002',
      userId: 'user-2',
      userName: 'Ko Aung Win',
      action: 'update',
      resourceType: 'repair',
      resourceId: 'REP-9482',
      resourceName: 'iPhone 15 Pro - Shattered Screen',
      branchId: 'b-yangon',
      changes: {
        before: { status: 'received' },
        after: { status: 'repairing', assignedTechnician: 'U Hla Tun' },
      },
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
      status: 'success',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
    },
    {
      id: 'audit-003',
      userId: 'user-3',
      userName: 'Daw Shwe Yee',
      action: 'read',
      resourceType: 'sale',
      resourceId: 'SAL-10021',
      resourceName: 'iPhone 17 Pro Max - 3,900,000 MMK',
      branchId: 'b-yangon',
      changes: { before: {}, after: {} },
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      status: 'success',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'audit-004',
      userId: 'user-4',
      userName: 'Ko Kyaw Kyaw',
      action: 'delete',
      resourceType: 'inventory',
      resourceId: 'inv-1001',
      resourceName: 'Defective Samsung Phone - Removed from stock',
      branchId: 'b-mandalay',
      changes: {
        before: { quantity: 5 },
        after: { quantity: 0, status: 'archived' },
      },
      ipAddress: '192.168.2.50',
      userAgent: 'Mozilla/5.0',
      status: 'success',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'audit-005',
      userId: 'user-5',
      userName: 'U Aung Ko',
      action: 'approve',
      resourceType: 'sale',
      resourceId: 'SAL-10022',
      resourceName: 'High-value sale approval',
      branchId: 'b-naypyitaw',
      changes: {
        before: { approvalStatus: 'pending' },
        after: { approvalStatus: 'approved', approvedBy: 'U Aung Ko' },
      },
      ipAddress: '192.168.3.75',
      userAgent: 'Mozilla/5.0',
      status: 'success',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'audit-006',
      userId: 'user-1',
      userName: 'Daw Su Su',
      action: 'login',
      resourceType: 'user',
      resourceId: 'user-1',
      resourceName: 'Daw Su Su - Login',
      branchId: 'b-yangon',
      changes: { before: {}, after: { loginTime: new Date().toISOString() } },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success',
      timestamp: new Date(Date.now() - 28800000).toISOString(),
    },
    {
      id: 'audit-007',
      userId: 'user-6',
      userName: 'Ko Min Thuta',
      action: 'update',
      resourceType: 'employee',
      resourceId: 'EMP-001',
      resourceName: 'Ko Aung Win - Salary Update',
      branchId: 'b-yangon',
      changes: {
        before: { baseSalary: 800000 },
        after: { baseSalary: 850000, effectiveDate: '2026-08-01' },
      },
      ipAddress: '192.168.1.115',
      userAgent: 'Mozilla/5.0',
      status: 'success',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  // Mock activity timeline
  const activityTimeline: ActivityTimeline[] = auditLogs.map(log => ({
    id: log.id,
    userId: log.userId,
    userName: log.userName,
    action: log.action,
    description: `${log.action.charAt(0).toUpperCase() + log.action.slice(1)} ${log.resourceType}`,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    resourceName: log.resourceName,
    branchId: log.branchId,
    timestamp: log.timestamp,
    severity: log.status === 'success' ? 'info' : 'warning',
  }));

  // Action distribution chart
  const actionDistribution = [
    { name: 'Read', value: auditLogs.filter(l => l.action === 'read').length },
    { name: 'Create', value: auditLogs.filter(l => l.action === 'create').length },
    { name: 'Update', value: auditLogs.filter(l => l.action === 'update').length },
    { name: 'Delete', value: auditLogs.filter(l => l.action === 'delete').length },
    { name: 'Approve', value: auditLogs.filter(l => l.action === 'approve').length },
  ];

  // Resource type distribution
  const resourceDistribution = [
    { name: 'Sale', value: auditLogs.filter(l => l.resourceType === 'sale').length },
    { name: 'Repair', value: auditLogs.filter(l => l.resourceType === 'repair').length },
    { name: 'Inventory', value: auditLogs.filter(l => l.resourceType === 'inventory').length },
    { name: 'Employee', value: auditLogs.filter(l => l.resourceType === 'employee').length },
    { name: 'User', value: auditLogs.filter(l => l.resourceType === 'user').length },
  ];

  // User activity distribution
  const userActivity = [
    { name: 'Daw Su Su', value: auditLogs.filter(l => l.userName === 'Daw Su Su').length },
    { name: 'Ko Aung Win', value: auditLogs.filter(l => l.userName === 'Ko Aung Win').length },
    { name: 'Daw Shwe Yee', value: auditLogs.filter(l => l.userName === 'Daw Shwe Yee').length },
    { name: 'Others', value: auditLogs.filter(l => !['Daw Su Su', 'Ko Aung Win', 'Daw Shwe Yee'].includes(l.userName)).length },
  ];

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch =
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resourceId.includes(searchQuery) ||
        log.userId.includes(searchQuery);

      const matchesAction = filterAction === 'all' || log.action === filterAction;
      const matchesResourceType = filterResourceType === 'all' || log.resourceType === filterResourceType;
      const matchesUser = filterUser === 'all' || log.userName === filterUser;

      return matchesSearch && matchesAction && matchesResourceType && matchesUser;
    });
  }, [searchQuery, filterAction, filterResourceType, filterUser]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="w-full bg-gradient-to-br from-card via-slate-800 to-card min-h-screen text-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
            <Shield size={32} className="text-blue-400" />
            Audit Logs
          </h1>
          <p className="text-subtle mt-1">Complete system change tracking and compliance audit trail</p>
        </div>

        <button
          onClick={onExportLogs}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-border">
        {['logs', 'timeline', 'analytics', 'retention'].map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              activeView === view
                ? 'bg-blue-600 text-white'
                : 'text-muted hover:bg-elevated'
            }`}
          >
            {view === 'logs' && <FileText size={16} className="inline mr-2" />}
            {view === 'timeline' && <Activity size={16} className="inline mr-2" />}
            {view === 'analytics' && <BarChart3 size={16} className="inline mr-2" />}
            {view === 'retention' && <Database size={16} className="inline mr-2" />}
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* LOGS VIEW */}
      {activeView === 'logs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-subtle" size={18} />
              <input
                type="text"
                placeholder="Search user, resource, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-elevated border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-elevated border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="approve">Approve</option>
              <option value="login">Login</option>
            </select>

            <select
              value={filterResourceType}
              onChange={(e) => setFilterResourceType(e.target.value)}
              className="bg-elevated border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Resources</option>
              <option value="sale">Sale</option>
              <option value="repair">Repair</option>
              <option value="inventory">Inventory</option>
              <option value="employee">Employee</option>
              <option value="user">User</option>
            </select>

            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="bg-elevated border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Users</option>
              <option value="Daw Su Su">Daw Su Su</option>
              <option value="Ko Aung Win">Ko Aung Win</option>
              <option value="Daw Shwe Yee">Daw Shwe Yee</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-elevated border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Logs Table */}
          <div className="bg-elevated border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-elevated border-b border-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Resource</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Timestamp</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">IP Address</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-elevated/50 transition">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                            {log.userName.charAt(0)}
                          </div>
                          <span className="font-medium">{log.userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.action === 'create' ? 'bg-blue-600/20 text-blue-300' :
                          log.action === 'read' ? 'bg-emerald-600/20 text-emerald-300' :
                          log.action === 'update' ? 'bg-amber-600/20 text-amber-300' :
                          log.action === 'delete' ? 'bg-red-600/20 text-red-300' :
                          'bg-purple-600/20 text-purple-300'
                        }`}>
                          {log.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium">{log.resourceType}</p>
                          <p className="text-subtle text-xs">{log.resourceId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-subtle">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.status === 'success' ? (
                          <span className="flex items-center gap-1 text-success">
                            <CheckCircle size={16} />
                            Success
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400">
                            <AlertCircle size={16} />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-subtle font-mono text-xs">{log.ipAddress}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setDetailsOpen(detailsOpen === log.id ? null : log.id)}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expanded details */}
            {detailsOpen && (
              <div className="border-t border-border p-6 bg-elevated/50">
                {filteredLogs.find(l => l.id === detailsOpen) && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Change Details</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <p className="text-subtle text-sm mb-2">Before</p>
                        <pre className="bg-card p-3 rounded text-xs overflow-auto max-h-32 text-muted">
                          {JSON.stringify(filteredLogs.find(l => l.id === detailsOpen)?.changes.before || {}, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-subtle text-sm mb-2">After</p>
                        <pre className="bg-card p-3 rounded text-xs overflow-auto max-h-32 text-muted">
                          {JSON.stringify(filteredLogs.find(l => l.id === detailsOpen)?.changes.after || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIMELINE VIEW */}
      {activeView === 'timeline' && (
        <div className="space-y-4">
          <div className="relative pl-8">
            {activityTimeline.map((item, idx) => (
              <div key={item.id} className="mb-8">
                <div className="absolute -left-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  {item.action === 'create' && <Plus size={16} />}
                  {item.action === 'read' && <Eye size={16} />}
                  {item.action === 'update' && <Edit size={16} />}
                  {item.action === 'delete' && <Trash2 size={16} />}
                </div>

                {idx < activityTimeline.length - 1 && (
                  <div className="absolute -left-2 top-8 h-8 w-0.5 bg-elevated" />
                )}

                <div className="bg-elevated border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold">{item.resourceName}</p>
                      <p className="text-sm text-subtle mt-1 flex items-center gap-2">
                        <User size={14} />
                        {item.userName} • {item.action}
                      </p>
                      <p className="text-xs text-subtle mt-2 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      item.severity === 'info' ? 'bg-blue-600/20 text-blue-300' :
                      item.severity === 'warning' ? 'bg-amber-600/20 text-amber-300' :
                      'bg-red-600/20 text-red-300'
                    }`}>
                      {item.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS VIEW */}
      {activeView === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Action Distribution */}
            <div className="bg-elevated rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Action Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={actionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {actionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Resource Distribution */}
            <div className="bg-elevated rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Resource Types</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={resourceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {resourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* User Activity */}
            <div className="bg-elevated rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">User Activity</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={userActivity}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userActivity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
              <p className="text-blue-200 text-sm">Total Events</p>
              <p className="text-2xl font-bold mt-2">{auditLogs.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-4">
              <p className="text-emerald-200 text-sm">Successful</p>
              <p className="text-2xl font-bold mt-2">{auditLogs.filter(l => l.status === 'success').length}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-4">
              <p className="text-amber-200 text-sm">Unique Users</p>
              <p className="text-2xl font-bold mt-2">{new Set(auditLogs.map(l => l.userId)).size}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4">
              <p className="text-purple-200 text-sm">Failed</p>
              <p className="text-2xl font-bold mt-2">{auditLogs.filter(l => l.status === 'failure').length}</p>
            </div>
          </div>
        </div>
      )}

      {/* RETENTION VIEW */}
      {activeView === 'retention' && (
        <div className="bg-elevated rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Audit Log Retention Policy</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-l-blue-500 bg-elevated p-4 rounded">
              <p className="font-bold">Retention Period</p>
              <p className="text-subtle mt-2">Audit logs are retained for 90 days by default. Logs older than 90 days are automatically archived.</p>
            </div>
            <div className="border-l-4 border-l-emerald-500 bg-elevated p-4 rounded">
              <p className="font-bold">Compliance</p>
              <p className="text-subtle mt-2">All audit logs are encrypted and stored securely. Access is restricted to authorized administrators only.</p>
            </div>
            <div className="border-l-4 border-l-amber-500 bg-elevated p-4 rounded">
              <p className="font-bold">Storage</p>
              <p className="text-subtle mt-2">Current storage usage: 2.3 GB / 10 GB. Archived logs available for 1 year.</p>
              <div className="mt-3">
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-success h-2 rounded-full" style={{ width: '23%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
