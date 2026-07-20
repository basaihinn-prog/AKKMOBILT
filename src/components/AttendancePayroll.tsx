import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, Users, Plus, Download, Filter, TrendingUp, AlertCircle } from 'lucide-react';
import { AttendanceRecord, LeaveRequest, PayrollRecord, RoleType, BranchId } from '../types';

interface AttendancePayrollProps {
  currentUserRole: RoleType;
  currentBranchId: BranchId;
}

export default function AttendancePayroll({ currentUserRole, currentBranchId }: AttendancePayrollProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leave' | 'payroll'>('attendance');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: 'att-001',
      employeeId: 'emp-001',
      employeeName: 'Min Thu',
      branchId: 'b-yangon',
      date: new Date().toISOString().split('T')[0],
      checkInTime: '08:30',
      checkOutTime: '18:00',
      workHours: 9.5,
      status: 'present',
      notes: '',
    },
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'leave-001',
      employeeId: 'emp-001',
      employeeName: 'Min Thu',
      leaveType: 'sick',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      durationDays: 1,
      reason: 'Medical appointment',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([
    {
      id: 'payroll-001',
      employeeId: 'emp-001',
      employeeName: 'Min Thu',
      branchId: 'b-yangon',
      month: 'December',
      year: 2024,
      baseSalary: 500000,
      allowances: 50000,
      bonuses: 0,
      deductions: 25000,
      taxes: 50000,
      netSalary: 475000,
      status: 'calculated',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  const canManageAttendance = ['Owner', 'Super Admin', 'Admin', 'Branch Manager', 'HR Manager'].includes(currentUserRole);
  const canApproveLeave = ['Owner', 'Super Admin', 'Admin', 'Branch Manager', 'HR Manager'].includes(currentUserRole);
  const canManagePayroll = ['Owner', 'Super Admin', 'Accountant', 'HR Manager'].includes(currentUserRole);

  // Attendance Stats
  const todayRecords = attendanceRecords.filter((r) => r.date === selectedDate);
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const absentCount = todayRecords.filter((r) => r.status === 'absent').length;
  const lateCount = todayRecords.filter((r) => r.status === 'late').length;

  // Leave Stats
  const pendingLeaves = leaveRequests.filter((r) => r.status === 'pending').length;
  const approvedLeaves = leaveRequests.filter((r) => r.status === 'approved').length;

  // Payroll Stats
  const totalPayroll = payrollRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const averageSalary = payrollRecords.length > 0 ? Math.round(totalPayroll / payrollRecords.length) : 0;

  const handleApproveLeave = (leaveId: string) => {
    setLeaveRequests(
      leaveRequests.map((l) =>
        l.id === leaveId ? { ...l, status: 'approved', approvedBy: 'current-user' } : l
      )
    );
  };

  const handleRejectLeave = (leaveId: string) => {
    setLeaveRequests(
      leaveRequests.map((l) => (l.id === leaveId ? { ...l, status: 'rejected' } : l))
    );
  };

  const handleApprovePayroll = (payrollId: string) => {
    setPayrollRecords(
      payrollRecords.map((p) =>
        p.id === payrollId ? { ...p, status: 'approved', approvedBy: 'current-user' } : p
      )
    );
  };

  const handleProcessPayroll = (payrollId: string) => {
    setPayrollRecords(
      payrollRecords.map((p) =>
        p.id === payrollId ? { ...p, status: 'paid', paidDate: new Date().toISOString() } : p
      )
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">HR Management</h2>
            <p className="text-sm text-muted">Attendance, Leave & Payroll Management</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        {['attendance', 'leave', 'payroll'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'attendance' | 'leave' | 'payroll')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-muted text-sm">Present Today</p>
              <p className="text-3xl font-bold text-green-600">{presentCount}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-muted text-sm">Absent</p>
              <p className="text-3xl font-bold text-red-600">{absentCount}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-muted text-sm">Late</p>
              <p className="text-3xl font-bold text-yellow-600">{lateCount}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-muted text-sm">Avg Work Hours</p>
              <p className="text-3xl font-bold text-blue-600">
                {todayRecords.length > 0
                  ? (todayRecords.reduce((sum, r) => sum + r.workHours, 0) / todayRecords.length).toFixed(1)
                  : '0'}
              </p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <label className="text-sm font-medium text-muted">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 px-3 py-2 border border-border rounded-lg w-full max-w-xs"
            />
          </div>

          {/* Attendance Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Work Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Notes</th>
                </tr>
              </thead>
              <tbody>
                {todayRecords.map((record) => (
                  <tr key={record.id} className="border-b border-border hover:bg-surface">
                    <td className="px-6 py-4 font-medium text-foreground">{record.employeeName}</td>
                    <td className="px-6 py-4 text-sm text-muted">{record.checkInTime}</td>
                    <td className="px-6 py-4 text-sm text-muted">{record.checkOutTime || '-'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">{record.workHours}h</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : record.status === 'absent'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{record.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAVE TAB */}
      {activeTab === 'leave' && (
        <div className="flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-muted text-sm">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingLeaves}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-muted text-sm">Approved Leaves</p>
              <p className="text-3xl font-bold text-green-600">{approvedLeaves}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-muted text-sm">Total Requests</p>
              <p className="text-3xl font-bold text-blue-600">{leaveRequests.length}</p>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((leave) => (
                  <tr key={leave.id} className="border-b border-border hover:bg-surface">
                    <td className="px-6 py-4 font-medium text-foreground">{leave.employeeName}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {leave.durationDays} day{leave.durationDays > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{leave.reason}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          leave.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : leave.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canApproveLeave && leave.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApproveLeave(leave.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectLeave(leave.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL TAB */}
      {activeTab === 'payroll' && (
        <div className="flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-muted text-sm">Total Payroll</p>
              <p className="text-3xl font-bold text-green-600">{(totalPayroll / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-muted text-sm">Avg Salary</p>
              <p className="text-3xl font-bold text-blue-600">{(averageSalary / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-muted text-sm">Employees</p>
              <p className="text-3xl font-bold text-purple-600">{payrollRecords.length}</p>
            </div>
          </div>

          {/* Month Selector */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <label className="text-sm font-medium text-muted">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-2 px-3 py-2 border border-border rounded-lg w-full max-w-xs"
            />
          </div>

          {/* Payroll Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Employee</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted">Base</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted">Allowances</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted">Deductions</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted">Net</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((payroll) => (
                  <tr key={payroll.id} className="border-b border-border hover:bg-surface">
                    <td className="px-6 py-4 font-medium text-foreground">{payroll.employeeName}</td>
                    <td className="px-6 py-4 text-right text-sm text-muted">{(payroll.baseSalary / 1000).toFixed(0)}K</td>
                    <td className="px-6 py-4 text-right text-sm text-muted">{(payroll.allowances / 1000).toFixed(0)}K</td>
                    <td className="px-6 py-4 text-right text-sm text-muted">{(payroll.deductions / 1000).toFixed(0)}K</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                      {(payroll.netSalary / 1000).toFixed(0)}K
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payroll.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : payroll.status === 'approved'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canManagePayroll && (
                        <div className="flex gap-2 justify-end">
                          {payroll.status === 'calculated' && (
                            <button
                              onClick={() => handleApprovePayroll(payroll.id)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition"
                            >
                              Approve
                            </button>
                          )}
                          {payroll.status === 'approved' && (
                            <button
                              onClick={() => handleProcessPayroll(payroll.id)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
