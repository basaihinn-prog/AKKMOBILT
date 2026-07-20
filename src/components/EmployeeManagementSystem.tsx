/**
 * Enterprise Employee Management System
 * Features: Profiles, Attendance, Salary, Commission, Leave, Performance, ID Cards
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Clock,
  DollarSign,
  Calendar,
  Award,
  FileText,
  Download,
  Upload,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Card,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import type { Employee } from '../types';

interface EmployeeRecord extends Employee {
  email?: string;
  department?: string;
  position?: string;
  joinDate?: string;
  baseSalary?: number;
  commission?: number;
  certifications?: string[];
  performance?: number;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

interface SalaryRecord {
  month: string;
  baseSalary: number;
  commission: number;
  bonuses: number;
  deductions: number;
  totalPaid: number;
  status: 'pending' | 'processed' | 'paid';
}

interface EmployeeManagementSystemProps {
  employees: Employee[];
  onAddEmployee?: (data: any) => void;
  onUpdateEmployee?: (employeeId: string, data: any) => void;
  onDeleteEmployee?: (employeeId: string) => void;
}

export default function EmployeeManagementSystem({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}: EmployeeManagementSystemProps) {
  const [activeView, setActiveView] = useState<'list' | 'detail' | 'attendance' | 'payroll' | 'performance' | 'analytics'>('list');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock employee records
  const employeeRecords: EmployeeRecord[] = [
    {
      id: 'EMP-001',
      name: 'Ko Aung Win',
      email: 'aungwin@akk.mm',
      role: 'Technician',
      branchId: 'b-yangon',
      department: 'Service Center',
      position: 'Senior Technician',
      phone: '09420001111',
      attendanceStatus: 'checked_in',
      attendanceTime: '08:45 AM',
      salesTarget: 0,
      currentSales: 0,
      commissionRate: 0,
      joinDate: '2023-06-15',
      baseSalary: 800000,
      commission: 0,
      certifications: ['Apple Certified', 'Samsung Certified'],
      performance: 92,
    },
    {
      id: 'EMP-002',
      name: 'Daw Su Su',
      email: 'susu@akk.mm',
      role: 'Branch Manager',
      branchId: 'b-yangon',
      department: 'Management',
      position: 'Branch Manager',
      phone: '09420002222',
      attendanceStatus: 'checked_in',
      attendanceTime: '08:15 AM',
      salesTarget: 12000000,
      currentSales: 11200000,
      commissionRate: 0.015,
      joinDate: '2022-03-20',
      baseSalary: 1500000,
      commission: 168000,
      certifications: ['MBA', 'Management Certified'],
      performance: 96,
    },
    {
      id: 'EMP-003',
      name: 'Ko Nay Lin',
      email: 'naylin@akk.mm',
      role: 'Technician',
      branchId: 'b-mandalay',
      department: 'Service Center',
      position: 'Technician',
      phone: '09420003333',
      attendanceStatus: 'checked_out',
      attendanceTime: '04:00 PM',
      salesTarget: 0,
      currentSales: 0,
      commissionRate: 0,
      joinDate: '2023-08-10',
      baseSalary: 700000,
      commission: 0,
      certifications: ['General Training'],
      performance: 85,
    },
    {
      id: 'EMP-004',
      name: 'Daw Shwe Yee',
      email: 'shweyee@akk.mm',
      role: 'Accountant',
      branchId: 'b-yangon',
      department: 'Finance',
      position: 'Senior Accountant',
      phone: '09450009999',
      attendanceStatus: 'checked_in',
      attendanceTime: '09:00 AM',
      salesTarget: 0,
      currentSales: 0,
      commissionRate: 0,
      joinDate: '2021-01-10',
      baseSalary: 1200000,
      commission: 0,
      certifications: ['CPA', 'ACCA'],
      performance: 94,
    },
  ];

  // Mock attendance data
  const attendanceData: Record<string, AttendanceRecord[]> = {
    'EMP-001': [
      { date: '2026-07-21', status: 'present', checkInTime: '08:45', checkOutTime: '18:00' },
      { date: '2026-07-20', status: 'present', checkInTime: '08:30', checkOutTime: '17:45' },
      { date: '2026-07-19', status: 'absent', notes: 'Medical leave' },
    ],
  };

  // Mock salary data
  const salaryData: Record<string, SalaryRecord[]> = {
    'EMP-001': [
      { month: 'July 2026', baseSalary: 800000, commission: 0, bonuses: 50000, deductions: 80000, totalPaid: 770000, status: 'paid' },
      { month: 'June 2026', baseSalary: 800000, commission: 0, bonuses: 0, deductions: 80000, totalPaid: 720000, status: 'paid' },
      { month: 'May 2026', baseSalary: 800000, commission: 0, bonuses: 30000, deductions: 80000, totalPaid: 750000, status: 'paid' },
    ],
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employeeRecords.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           emp.id.includes(searchQuery);
      const matchesRole = filterRole === 'all' || emp.role === filterRole;
      const matchesBranch = filterBranch === 'all' || emp.branchId === filterBranch;
      return matchesSearch && matchesRole && matchesBranch;
    });
  }, [searchQuery, filterRole, filterBranch]);

  // Attendance chart data
  const attendanceChartData = [
    { date: 'Mon', present: 18, absent: 2, leave: 2 },
    { date: 'Tue', present: 19, absent: 1, leave: 2 },
    { date: 'Wed', present: 18, absent: 2, leave: 2 },
    { date: 'Thu', present: 20, absent: 0, leave: 2 },
    { date: 'Fri', present: 19, absent: 1, leave: 2 },
    { date: 'Sat', present: 15, absent: 3, leave: 4 },
    { date: 'Sun', present: 12, absent: 5, leave: 5 },
  ];

  // Performance distribution
  const performanceDistribution = [
    { range: 'Excellent (90-100)', value: 8 },
    { range: 'Good (80-89)', value: 6 },
    { range: 'Average (70-79)', value: 4 },
    { range: 'Below (< 70)', value: 2 },
  ];

  // Salary breakdown
  const salaryBreakdown = [
    { category: 'Base Salary', value: 4200000 },
    { category: 'Commission', value: 168000 },
    { category: 'Bonuses', value: 80000 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
            <Users size={32} className="text-blue-400" />
            Employee Management
          </h1>
          <p className="text-slate-400 mt-1">{employeeRecords.length} employees • Attendance, payroll, performance</p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-slate-700">
        {['list', 'detail', 'attendance', 'payroll', 'performance', 'analytics'].map(view => (
          <button
            key={view}
            onClick={() => {
              setActiveView(view as any);
              if (view !== 'detail') setSelectedEmployee(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              activeView === view
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {view === 'list' && <Users size={16} className="inline mr-2" />}
            {view === 'detail' && <FileText size={16} className="inline mr-2" />}
            {view === 'attendance' && <Clock size={16} className="inline mr-2" />}
            {view === 'payroll' && <DollarSign size={16} className="inline mr-2" />}
            {view === 'performance' && <TrendingUp size={16} className="inline mr-2" />}
            {view === 'analytics' && <BarChart3 size={16} className="inline mr-2" />}
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* LIST VIEW */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search employees by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Roles</option>
              <option value="Technician">Technician</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Accountant">Accountant</option>
              <option value="Sales">Sales</option>
            </select>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Branches</option>
              <option value="b-yangon">Yangon</option>
              <option value="b-mandalay">Mandalay</option>
              <option value="b-naypyitaw">Naypyitaw</option>
            </select>
          </div>

          {/* Employee Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(emp => (
              <div
                key={emp.id}
                onClick={() => {
                  setSelectedEmployee(emp);
                  setActiveView('detail');
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold">{emp.name}</h3>
                      <p className="text-sm text-slate-400">{emp.role}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    emp.attendanceStatus === 'checked_in'
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {emp.attendanceStatus === 'checked_in' ? 'Present' : 'Off'}
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={14} />
                    {emp.branchId === 'b-yangon' ? 'Yangon' : emp.branchId === 'b-mandalay' ? 'Mandalay' : 'Naypyitaw'}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone size={14} />
                    {emp.phone}
                  </div>
                </div>

                {emp.performance && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-slate-400">Performance</span>
                      <span className="font-bold text-amber-400">{emp.performance}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2 rounded-full"
                        style={{ width: `${emp.performance}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded font-medium text-sm transition">
                    <Eye size={14} className="inline mr-2" />
                    View
                  </button>
                  <button className="bg-red-600/20 hover:bg-red-600/30 px-3 py-2 rounded font-medium text-sm text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAIL VIEW */}
      {activeView === 'detail' && selectedEmployee && (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedEmployee(null)}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4"
          >
            <ChevronRight size={18} className="rotate-180" />
            Back to List
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Employee Profile */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-800 rounded-lg p-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-3xl mx-auto mb-4">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-center">{selectedEmployee.name}</h2>
                <p className="text-center text-slate-400 mt-1">{selectedEmployee.role}</p>

                <div className="space-y-3 mt-6 pt-6 border-t border-slate-700">
                  <div>
                    <p className="text-slate-400 text-sm">Department</p>
                    <p className="font-medium mt-1">{selectedEmployee.department}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Position</p>
                    <p className="font-medium mt-1">{selectedEmployee.position}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Join Date</p>
                    <p className="font-medium mt-1">{selectedEmployee.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Performance Score</p>
                    <p className="font-bold text-amber-400 mt-1">{selectedEmployee.performance}%</p>
                  </div>
                </div>
              </div>

              {/* ID Card */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <Card size={32} className="mb-3 opacity-50" />
                <p className="text-sm opacity-75">Employee ID Card</p>
                <p className="font-bold text-2xl mt-2">{selectedEmployee.id}</p>
                <div className="mt-4 pt-4 border-t border-white/20 text-xs">
                  <p className="opacity-75">{selectedEmployee.name}</p>
                  <p className="opacity-75">{selectedEmployee.position}</p>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition">
                <Download size={16} />
                Download ID Card
              </button>
            </div>

            {/* Employee Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="font-bold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-blue-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <p className="font-medium">{selectedEmployee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-emerald-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Phone</p>
                      <p className="font-medium">{selectedEmployee.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Award size={20} />
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.certifications?.map((cert, idx) => (
                    <div key={idx} className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                      {cert}
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Info */}
              {selectedEmployee.baseSalary && (
                <div className="bg-slate-800 rounded-lg p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <DollarSign size={20} />
                    Salary Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Base Salary</span>
                      <span className="font-bold">{selectedEmployee.baseSalary.toLocaleString()} MMK</span>
                    </div>
                    {selectedEmployee.commission > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Commission Rate</span>
                        <span className="font-bold text-emerald-400">{(selectedEmployee.commissionRate * 100).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE VIEW */}
      {activeView === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Weekly Attendance Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                <Legend />
                <Bar dataKey="present" fill="#10B981" name="Present" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                <Bar dataKey="leave" fill="#F59E0B" name="Leave" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* PAYROLL VIEW */}
      {activeView === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Salary Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salaryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, value }) => `${category}: ${value.toLocaleString()}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salaryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Payroll Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Base Salary</span>
                  <span className="font-bold text-lg">4,200,000 MMK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Commission</span>
                  <span className="font-bold text-emerald-400">168,000 MMK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bonuses</span>
                  <span className="font-bold text-blue-400">80,000 MMK</span>
                </div>
                <div className="border-t border-slate-700 pt-4 mt-4 flex items-center justify-between">
                  <span className="text-slate-400">Total This Month</span>
                  <span className="font-bold text-lg">4,448,000 MMK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERFORMANCE VIEW */}
      {activeView === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Performance Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, value }) => `${range}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">Top Performers</h2>
              <div className="space-y-3">
                {employeeRecords.sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 5).map(emp => (
                  <div key={emp.id} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.position}</p>
                    </div>
                    <span className="font-bold text-amber-400">⭐ {emp.performance}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS VIEW */}
      {activeView === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
              <p className="text-blue-200 text-sm">Total Employees</p>
              <p className="text-2xl font-bold mt-2">{employeeRecords.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-4">
              <p className="text-emerald-200 text-sm">On Duty Today</p>
              <p className="text-2xl font-bold mt-2">{employeeRecords.filter(e => e.attendanceStatus === 'checked_in').length}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-4">
              <p className="text-amber-200 text-sm">Avg Performance</p>
              <p className="text-2xl font-bold mt-2">{Math.round(employeeRecords.reduce((sum, e) => sum + (e.performance || 0), 0) / employeeRecords.length)}%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4">
              <p className="text-purple-200 text-sm">Total Payroll</p>
              <p className="text-2xl font-bold mt-2">4.4M MMK</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
