import React, { useState } from 'react';
import { Shield, Activity, Lock, Eye, Download, Filter, Calendar, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { AuditLog, ActivityTimeline, LoginAttempt, SecurityEvent, SessionInfo, RoleType, BranchId } from '../types';

interface SecurityAuditProps {
  currentUserRole: RoleType;
  currentBranchId: BranchId;
}

export default function SecurityAudit({ currentUserRole, currentBranchId }: SecurityAuditProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'timeline' | 'logins' | 'sessions' | 'events'>('logs');
  
  const [auditLogs] = useState<AuditLog[]>([
    {
      id: 'log-001',
      userId: 'usr-001',
      userName: 'Min Thu',
      action: 'create',
      resourceType: 'sale',
      resourceId: 'sale-001',
      resourceName: 'Sale #1234',
      branchId: 'b-yangon',
      changes: {
        before: {},
        after: { amount: 2500000, items: 1, customer: 'John Doe' },
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      status: 'success',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'log-002',
      userId: 'usr-002',
      userName: 'Kyi Lin',
      action: 'update',
      resourceType: 'inventory',
      resourceId: 'inv-001',
      resourceName: 'iPhone 15 Stock',
      branchId: 'b-mandalay',
      changes: {
        before: { quantity: 50 },
        after: { quantity: 45 },
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0',
      status: 'success',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    },
  ]);

  const [activityTimeline] = useState<ActivityTimeline[]>([
    {
      id: 'act-001',
      userId: 'usr-001',
      userName: 'Min Thu',
      action: 'CREATE_SALE',
      description: 'Created new sale "Sale #1234"',
      resourceType: 'sale',
      resourceId: 'sale-001',
      resourceName: 'Sale #1234',
      branchId: 'b-yangon',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      severity: 'info',
    },
  ]);

  const [loginAttempts] = useState<LoginAttempt[]>([
    {
      id: 'login-001',
      email: 'min.thu@akkmobile.com',
      ipAddress: '192.168.1.100',
      deviceFingerprint: 'device-001',
      status: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    },
    {
      id: 'login-002',
      email: 'kyi.lin@akkmobile.com',
      ipAddress: '203.81.23.45',
      deviceFingerprint: 'device-002',
      status: 'failed',
      failureReason: 'Invalid password',
      timestamp: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
    },
  ]);

  const [sessions] = useState<SessionInfo[]>([
    {
      id: 'session-001',
      userId: 'usr-001',
      userName: 'Min Thu',
      role: 'Branch Manager',
      branchId: 'b-yangon',
      loginTime: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
      deviceType: 'desktop',
      deviceName: 'Windows PC',
      browser: 'Chrome',
      operatingSystem: 'Windows 10',
      ipAddress: '192.168.1.100',
      isActive: true,
      lastActivityTime: new Date(Date.now() - 2 * 60000).toISOString(),
    },
    {
      id: 'session-002',
      userId: 'usr-002',
      userName: 'Kyi Lin',
      role: 'Cashier',
      branchId: 'b-mandalay',
      loginTime: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
      deviceType: 'mobile',
      deviceName: 'iPhone 13',
      browser: 'Safari',
      operatingSystem: 'iOS 17',
      ipAddress: '203.81.23.45',
      isActive: true,
      lastActivityTime: new Date(Date.now() - 5 * 60000).toISOString(),
    },
  ]);

  const [securityEvents] = useState<SecurityEvent[]>([
    {
      id: 'evt-001',
      userId: 'usr-003',
      userName: 'Unknown User',
      eventType: 'unauthorized_access',
      severity: 'high',
      description: 'Attempted unauthorized access to financial data',
      ipAddress: '203.81.23.99',
      userAgent: 'Unknown',
      timestamp: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
      resolved: false,
    },
  ]);

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  const canViewAudit = ['Owner', 'Super Admin', 'Admin', 'Auditor'].includes(currentUserRole);

  if (!canViewAudit) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">You don't have permission to view audit logs</p>
        </div>
      </div>
    );
  }

  const stats = {
    todayActions: auditLogs.filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
    failedAttempts: loginAttempts.filter((a) => a.status === 'failed').length,
    activeSessions: sessions.filter((s) => s.isActive).length,
    securityEvents: securityEvents.filter((e) => !e.resolved).length,
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Security & Audit</h2>
            <p className="text-sm text-gray-600">Monitor system activity, security events, and access logs</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Today's Actions</p>
          <p className="text-3xl font-bold text-blue-600">{stats.todayActions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Failed Logins</p>
          <p className="text-3xl font-bold text-red-600">{stats.failedAttempts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Active Sessions</p>
          <p className="text-3xl font-bold text-green-600">{stats.activeSessions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Security Events</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.securityEvents}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 bg-white rounded-t-lg px-6 py-3">
        {['logs', 'timeline', 'logins', 'sessions', 'events'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 flex gap-4">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input type="date" className="flex-1 bg-transparent outline-none text-sm py-2" />
            </div>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>All Users</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Timestamp</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">User</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Resource</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{log.userName}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {log.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{log.resourceName}</td>
                    <td className="px-6 py-3">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTIVITY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {activityTimeline.map((activity) => (
            <div key={activity.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex gap-4">
                <div className={`p-3 rounded-lg ${
                  activity.severity === 'critical' ? 'bg-red-100' :
                  activity.severity === 'warning' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  <Activity className={`w-5 h-5 ${
                    activity.severity === 'critical' ? 'text-red-600' :
                    activity.severity === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-600">{activity.userName} • {activity.resourceType}</p>
                    </div>
                    <span className="text-xs text-gray-600">{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOGIN ATTEMPTS */}
      {activeTab === 'logins' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">IP Address</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Device</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loginAttempts.map((attempt) => (
                <tr key={attempt.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">{attempt.email}</td>
                  <td className="px-6 py-3 text-gray-600 text-xs">{attempt.ipAddress}</td>
                  <td className="px-6 py-3 text-gray-600 text-xs">{attempt.deviceFingerprint}</td>
                  <td className="px-6 py-3">
                    {attempt.status === 'success' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Success
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{new Date(attempt.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{session.userName}</p>
                  <p className="text-sm text-gray-600">{session.role} • {session.branchId}</p>
                </div>
                {session.isActive ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    Offline
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div><span className="text-gray-600">Device:</span> {session.deviceName}</div>
                <div><span className="text-gray-600">Browser:</span> {session.browser}</div>
                <div><span className="text-gray-600">IP:</span> {session.ipAddress}</div>
                <div><span className="text-gray-600">Logged in:</span> {new Date(session.loginTime).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECURITY EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {securityEvents.map((event) => (
            <div
              key={event.id}
              className={`rounded-lg border p-4 ${
                event.severity === 'critical' ? 'bg-red-50 border-red-200' :
                event.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                    event.severity === 'critical' ? 'text-red-600' :
                    event.severity === 'high' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`} />
                  <div>
                    <p className="font-semibold text-gray-900">{event.description}</p>
                    <p className="text-sm text-gray-600">{event.eventType} • {event.ipAddress}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  event.severity === 'critical' ? 'bg-red-100 text-red-700' :
                  event.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {event.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
