import React, { useState } from 'react';
import {
  Users,
  User,
  Phone,
  Building,
  DollarSign,
  Briefcase,
  Award,
  Calendar,
  Clock,
  FileCheck,
  FileText,
  BadgeAlert,
  Fingerprint,
  QrCode,
  Check,
  X,
  Plus,
  TrendingUp,
  Download
} from 'lucide-react';
import { Employee, BranchId } from '../types';

interface ExtendedEmployee extends Employee {
  email: string;
  joinedDate: string;
  department: string;
  salary: number; // in MMK
  shift: 'Morning' | 'Evening' | 'Full-Time';
  leaveBalance: number; // days remaining
  performanceScore: number; // out of 100
  documents: Array<{ name: string; size: string; status: 'verified' | 'pending' }>;
}

const INITIAL_EMPLOYEES: ExtendedEmployee[] = [
  {
    id: "EMP-001",
    name: "Ko Aung Win",
    role: "Technician",
    branchId: "b-yangon",
    phone: "09420001111",
    email: "aungwin.tech@akk-mobile.com",
    joinedDate: "2024-03-12",
    department: "Technical Services",
    salary: 650000,
    shift: "Full-Time",
    leaveBalance: 12,
    performanceScore: 94,
    attendanceStatus: "checked_in",
    attendanceTime: "08:45 AM",
    salesTarget: 2000000,
    currentSales: 1850000,
    commissionRate: 0.02,
    documents: [
      { name: "Employment_Contract.pdf", size: "1.2 MB", status: "verified" },
      { name: "NID_Card_Front_Back.jpg", size: "840 KB", status: "verified" },
      { name: "Technical_Cert_A_Plus.pdf", size: "2.4 MB", status: "verified" }
    ]
  },
  {
    id: "EMP-002",
    name: "Daw Su Su",
    role: "Branch Manager",
    branchId: "b-yangon",
    phone: "09420002222",
    email: "susu.mgr@akk-mobile.com",
    joinedDate: "2023-01-15",
    department: "Store Management",
    salary: 950000,
    shift: "Full-Time",
    leaveBalance: 14,
    performanceScore: 98,
    attendanceStatus: "checked_in",
    attendanceTime: "08:15 AM",
    salesTarget: 12000000,
    currentSales: 11200000,
    commissionRate: 0.015,
    documents: [
      { name: "Managerial_Agreement.pdf", size: "1.5 MB", status: "verified" },
      { name: "NID_Card.jpg", size: "900 KB", status: "verified" },
      { name: "University_Diploma.pdf", size: "3.1 MB", status: "verified" }
    ]
  },
  {
    id: "EMP-003",
    name: "Maing Ye Naing",
    role: "Sales",
    branchId: "b-mandalay",
    phone: "09420003333",
    email: "yenaing.sales@akk-mobile.com",
    joinedDate: "2024-06-01",
    department: "Retail Sales",
    salary: 450000,
    shift: "Morning",
    leaveBalance: 15,
    performanceScore: 88,
    attendanceStatus: "checked_out",
    attendanceTime: "04:00 PM",
    salesTarget: 6000000,
    currentSales: 5400000,
    commissionRate: 0.03,
    documents: [
      { name: "Sales_Onboarding_Contract.pdf", size: "1.1 MB", status: "verified" },
      { name: "NID_Card_Copy.jpg", size: "750 KB", status: "verified" }
    ]
  },
  {
    id: "EMP-004",
    name: "U Nay Win",
    role: "Cashier",
    branchId: "b-yangon",
    phone: "09459002011",
    email: "naywin.cashier@akk-mobile.com",
    joinedDate: "2023-11-10",
    department: "Cash & Audit Operations",
    salary: 500000,
    shift: "Evening",
    leaveBalance: 8,
    performanceScore: 91,
    attendanceStatus: "checked_in",
    attendanceTime: "03:55 PM",
    salesTarget: 1000000,
    currentSales: 890000,
    commissionRate: 0.005,
    documents: [
      { name: "Cashier_Surety_Bond.pdf", size: "2.1 MB", status: "verified" },
      { name: "NID_Card.jpg", size: "950 KB", status: "verified" }
    ]
  },
  {
    id: "EMP-005",
    name: "Ma Khin Thida",
    role: "Accountant",
    branchId: "b-naypyitaw",
    phone: "09420004444",
    email: "khinthida.acc@akk-mobile.com",
    joinedDate: "2024-02-18",
    department: "Finance & Accounts",
    salary: 750000,
    shift: "Full-Time",
    leaveBalance: 10,
    performanceScore: 96,
    attendanceStatus: "absent",
    salesTarget: 500000,
    currentSales: 480000,
    commissionRate: 0.0,
    documents: [
      { name: "Accountant_Agreement.pdf", size: "1.3 MB", status: "verified" },
      { name: "NID_Card.jpg", size: "890 KB", status: "verified" },
      { name: "ACCA_Certificate.pdf", size: "4.5 MB", status: "verified" }
    ]
  }
];

interface LeaveRequest {
  id: string;
  employeeName: string;
  type: 'Paid Leave' | 'Sick Leave' | 'Casual Leave' | 'Unpaid Leave';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: "LR-101",
    employeeName: "U Nay Win",
    type: "Sick Leave",
    startDate: "2026-07-22",
    endDate: "2026-07-23",
    days: 2,
    reason: "Medical checkup and fever rest.",
    status: "pending"
  },
  {
    id: "LR-102",
    employeeName: "Maing Ye Naing",
    type: "Casual Leave",
    startDate: "2026-07-28",
    endDate: "2026-07-30",
    days: 3,
    reason: "Family traditional donation event in Mandalay.",
    status: "pending"
  },
  {
    id: "LR-103",
    employeeName: "Ko Aung Win",
    type: "Paid Leave",
    startDate: "2026-06-10",
    endDate: "2026-06-14",
    days: 5,
    reason: "Annual vacation trip to Chaungtha Beach.",
    status: "approved"
  }
];

export default function AdminEmployeeView() {
  const [employees, setEmployees] = useState<ExtendedEmployee[]>(INITIAL_EMPLOYEES);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("EMP-001");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVES);

  // New leave form state
  const [applyLeaveType, setApplyLeaveType] = useState<LeaveRequest['type']>("Paid Leave");
  const [applyStart, setApplyStart] = useState("");
  const [applyEnd, setApplyEnd] = useState("");
  const [applyReason, setApplyReason] = useState("");
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // New employee state
  const [isAddingEmp, setIsAddingEmp] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: "",
    role: "Sales" as Employee['role'],
    branchId: "b-yangon" as BranchId,
    phone: "",
    email: "",
    department: "Retail Sales",
    salary: "450000",
    shift: "Full-Time" as 'Morning' | 'Evening' | 'Full-Time',
    salesTarget: "5000000",
    commissionRate: "1.5"
  });

  const selectedEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const handleToggleAttendance = (empId: string) => {
    setEmployees(
      employees.map((e) => {
        if (e.id !== empId) return e;
        const current = e.attendanceStatus;
        let nextStatus: Employee['attendanceStatus'] = 'checked_in';
        let nextTime: string | undefined = undefined;

        if (current === 'checked_in') {
          nextStatus = 'checked_out';
          nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (current === 'checked_out' || current === 'absent') {
          nextStatus = 'checked_in';
          nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        return {
          ...e,
          attendanceStatus: nextStatus,
          attendanceTime: nextTime
        };
      })
    );
  };

  const handleSimulateSale = (empId: string, amount: number) => {
    setEmployees(
      employees.map((e) => {
        if (e.id !== empId) return e;
        const nextSales = e.currentSales + amount;
        // recalculate score based on target achievement
        const pct = Math.min(100, Math.round((nextSales / e.salesTarget) * 100));
        return {
          ...e,
          currentSales: nextSales,
          performanceScore: Math.min(100, Math.max(70, Math.round(75 + (pct / 4))))
        };
      })
    );
  };

  const handleLeaveAction = (id: string, action: 'approved' | 'rejected') => {
    setLeaveRequests(
      leaveRequests.map((lr) => {
        if (lr.id !== id) return lr;

        // If approved, deduct from staff's balance
        if (action === 'approved') {
          setEmployees(
            employees.map((emp) => {
              if (emp.name === lr.employeeName) {
                return {
                  ...emp,
                  leaveBalance: Math.max(0, emp.leaveBalance - lr.days)
                };
              }
              return emp;
            })
          );
        }

        return { ...lr, status: action };
      })
    );
  };

  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyStart || !applyEnd || !applyReason) return;

    const start = new Date(applyStart);
    const end = new Date(applyEnd);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: `LR-${Math.floor(100 + Math.random() * 900)}`,
      employeeName: selectedEmp.name,
      type: applyLeaveType,
      startDate: applyStart,
      endDate: applyEnd,
      days: diffDays,
      reason: applyReason,
      status: 'pending'
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    setApplyStart("");
    setApplyEnd("");
    setApplyReason("");
    setLeaveSuccess(true);
    setTimeout(() => setLeaveSuccess(false), 3000);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.phone || !newEmp.email) return;

    const added: ExtendedEmployee = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: newEmp.name,
      role: newEmp.role,
      branchId: newEmp.branchId,
      phone: newEmp.phone,
      email: newEmp.email,
      joinedDate: new Date().toISOString().split('T')[0],
      department: newEmp.department,
      salary: Number(newEmp.salary),
      shift: newEmp.shift,
      leaveBalance: 15,
      performanceScore: 85,
      attendanceStatus: 'absent',
      salesTarget: Number(newEmp.salesTarget),
      currentSales: 0,
      commissionRate: Number(newEmp.commissionRate) / 100,
      documents: [
        { name: "Contract_Generated.pdf", size: "450 KB", status: "pending" },
        { name: "Identity_Verification_Awaiting.jpg", size: "0 B", status: "pending" }
      ]
    };

    setEmployees([...employees, added]);
    setSelectedEmpId(added.id);
    setIsAddingEmp(false);
    setNewEmp({
      name: "",
      role: "Sales",
      branchId: "b-yangon",
      phone: "",
      email: "",
      department: "Retail Sales",
      salary: "450000",
      shift: "Full-Time",
      salesTarget: "5000000",
      commissionRate: "1.5"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="employee-manager-root">
      
      {/* 1. Employee List Sidebar */}
      <div className="lg:col-span-4 bg-card/15 border border-border p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono">Staff Directory</span>
          <button
            onClick={() => setIsAddingEmp(true)}
            className="p-1 hover:bg-slate-850 border border-border rounded text-rose-400 font-bold text-[10px] flex items-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-mono">Add Employee</span>
          </button>
        </div>

        {isAddingEmp ? (
          <form onSubmit={handleAddEmployee} className="bg-surface p-4 rounded-xl border border-slate-850 space-y-3 font-mono text-xs">
            <span className="text-[10px] text-rose-400 font-black uppercase block border-b border-border pb-1.5">New Employee Profile</span>
            
            <div className="space-y-1">
              <label className="text-subtle text-[10px]">Staff Full Name</label>
              <input
                type="text"
                required
                value={newEmp.name}
                onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                placeholder="e.g. U Hla Maung"
                className="w-full bg-card border border-border rounded p-1.5 text-muted outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-subtle text-[10px]">Primary Role</label>
                <select
                  value={newEmp.role}
                  onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value as any })}
                  className="w-full bg-card border border-border rounded p-1.5 text-muted text-xs"
                >
                  <option value="Sales">Sales Professional</option>
                  <option value="Cashier">Cashier Operator</option>
                  <option value="Technician">Repair Technician</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-subtle text-[10px]">Showroom Branch</label>
                <select
                  value={newEmp.branchId}
                  onChange={(e) => setNewEmp({ ...newEmp, branchId: e.target.value as any })}
                  className="w-full bg-card border border-border rounded p-1.5 text-muted text-xs"
                >
                  <option value="b-yangon">Yangon Head Office</option>
                  <option value="b-mandalay">Mandalay Branch</option>
                  <option value="b-naypyitaw">Naypyitaw Mall</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-subtle text-[10px]">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newEmp.phone}
                  onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                  placeholder="09..."
                  className="w-full bg-card border border-border rounded p-1.5 text-muted outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-subtle text-[10px]">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  placeholder="name@akk.com"
                  className="w-full bg-card border border-border rounded p-1.5 text-muted outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-subtle text-[10px]">Base Salary (MMK)</label>
                <input
                  type="number"
                  value={newEmp.salary}
                  onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                  className="w-full bg-card border border-border rounded p-1.5 text-muted"
                />
              </div>
              <div className="space-y-1">
                <label className="text-subtle text-[10px]">Shift Designation</label>
                <select
                  value={newEmp.shift}
                  onChange={(e) => setNewEmp({ ...newEmp, shift: e.target.value as any })}
                  className="w-full bg-card border border-border rounded p-1.5 text-muted text-xs"
                >
                  <option value="Full-Time">Full-Time (9-6)</option>
                  <option value="Morning">Morning Shift (8-4)</option>
                  <option value="Evening">Evening Shift (4-12)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-subtle text-[10px]">Sales Target (MMK)</label>
                <input
                  type="number"
                  value={newEmp.salesTarget}
                  onChange={(e) => setNewEmp({ ...newEmp, salesTarget: e.target.value })}
                  className="w-full bg-card border border-border rounded p-1.5 text-muted"
                />
              </div>
              <div className="space-y-1">
                <label className="text-subtle text-[10px]">Commission (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newEmp.commissionRate}
                  onChange={(e) => setNewEmp({ ...newEmp, commissionRate: e.target.value })}
                  className="w-full bg-card border border-border rounded p-1.5 text-muted"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAddingEmp(false)}
                className="flex-1 bg-card text-subtle py-2 rounded font-bold hover:text-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black py-2 rounded"
              >
                Onboard Staff
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {employees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className={`flex items-center justify-between p-3 rounded-xl border font-mono text-xs cursor-pointer transition ${
                  selectedEmpId === emp.id
                    ? 'bg-surface border-rose-500/20 shadow'
                    : 'bg-card/10 border-transparent hover:border-slate-850 hover:bg-card/25'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-rose-400 font-extrabold text-xs">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="font-extrabold text-muted block">{emp.name}</span>
                    <span className="text-[10px] text-subtle block">{emp.role} • {emp.id}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                    emp.attendanceStatus === 'checked_in'
                      ? 'bg-success/10 text-success'
                      : emp.attendanceStatus === 'checked_out'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-elevated text-subtle'
                  }`}>
                    {emp.attendanceStatus === 'checked_in' ? 'checked-in' : emp.attendanceStatus === 'checked_out' ? 'checked-out' : 'absent'}
                  </span>
                  <span className="text-[9px] text-subtle font-bold">{emp.branchId.replace('b-', '').toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Employee Profile & Operations Center */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Profile Card & digital ID Card side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile particulars */}
          <div className="md:col-span-7 bg-card/15 border border-border p-5 rounded-2xl flex flex-col justify-between space-y-4 font-mono text-xs">
            <div className="border-b border-border pb-3.5">
              <span className="text-[10px] text-subtle font-bold uppercase tracking-wider block">Staff Profile Details</span>
              <h3 className="text-base font-extrabold text-foreground mt-1 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-400" />
                <span>{selectedEmp.name}</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div className="space-y-1 bg-surface/40 border border-border p-2.5 rounded-xl">
                <span className="text-subtle block text-[9px] uppercase font-bold">Roster Code</span>
                <strong className="text-muted font-bold block">{selectedEmp.id}</strong>
              </div>
              <div className="space-y-1 bg-surface/40 border border-border p-2.5 rounded-xl">
                <span className="text-subtle block text-[9px] uppercase font-bold">Work Department</span>
                <strong className="text-muted font-bold block">{selectedEmp.department}</strong>
              </div>
              <div className="space-y-1 bg-surface/40 border border-border p-2.5 rounded-xl">
                <span className="text-subtle block text-[9px] uppercase font-bold">Showroom Branch</span>
                <strong className="text-muted font-bold block">{selectedEmp.branchId.toUpperCase().replace('B-', '')} Office</strong>
              </div>
              <div className="space-y-1 bg-surface/40 border border-border p-2.5 rounded-xl">
                <span className="text-subtle block text-[9px] uppercase font-bold">Date of Joining</span>
                <strong className="text-muted font-bold block">{selectedEmp.joinedDate}</strong>
              </div>
            </div>

            <div className="space-y-2 bg-surface/40 border border-border p-3 rounded-xl">
              <div className="flex items-center space-x-2 text-[10px]">
                <Phone className="w-3.5 h-3.5 text-subtle" />
                <span className="text-subtle">Phone:</span>
                <strong className="text-muted">{selectedEmp.phone}</strong>
              </div>
              <div className="flex items-center space-x-2 text-[10px]">
                <Briefcase className="w-3.5 h-3.5 text-subtle" />
                <span className="text-subtle">Work Email:</span>
                <strong className="text-muted">{selectedEmp.email}</strong>
              </div>
              <div className="flex items-center space-x-2 text-[10px]">
                <Clock className="w-3.5 h-3.5 text-subtle" />
                <span className="text-subtle">Shift Schedule:</span>
                <strong className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded text-[9px]">{selectedEmp.shift}</strong>
              </div>
            </div>

            {/* Attendance & Sales simulations */}
            <div className="flex flex-wrap gap-2.5 pt-3 border-t border-border">
              <button
                onClick={() => handleToggleAttendance(selectedEmp.id)}
                className={`flex-1 min-w-[120px] font-black py-2 rounded-xl text-[10px] uppercase transition flex items-center justify-center space-x-1 border ${
                  selectedEmp.attendanceStatus === 'checked_in'
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/25 text-rose-400'
                    : 'bg-success/10 hover:bg-success/20 border-success/25 text-success'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>{selectedEmp.attendanceStatus === 'checked_in' ? 'CLOCK OUT NOW' : 'CLOCK IN NOW'}</span>
              </button>

              <button
                onClick={() => handleSimulateSale(selectedEmp.id, 1200000)}
                className="flex-1 min-w-[120px] bg-card hover:bg-slate-850 border border-border hover:border-success/20 text-success font-black py-2 rounded-xl text-[10px] uppercase transition flex items-center justify-center space-x-1"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>SIMULATE +1.2M SALE</span>
              </button>
            </div>
          </div>

          {/* Interactive Digital ID Card preview */}
          <div className="md:col-span-5 bg-gradient-to-br from-surface via-card to-surface border border-border p-5 rounded-2xl flex flex-col justify-between items-center text-center font-mono relative overflow-hidden h-[300px] md:h-auto group shadow">
            {/* Glossy overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />

            <div className="w-full flex justify-between items-center border-b border-border pb-2">
              <strong className="text-[10px] font-black tracking-widest text-subtle uppercase">AKK ENTERPRISE</strong>
              <span className="text-[8px] bg-success/10 border border-success/20 text-success px-1.5 py-0.5 rounded font-black">ACTIVE</span>
            </div>

            <div className="space-y-2 mt-4">
              <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mx-auto text-rose-400 font-extrabold text-lg shadow-lg">
                {selectedEmp.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-xs font-black text-foreground">{selectedEmp.name}</h4>
                <p className="text-[9px] text-subtle uppercase font-bold tracking-wider mt-0.5">{selectedEmp.role}</p>
                <p className="text-[8px] text-subtle mt-0.5">ID: {selectedEmp.id}</p>
              </div>
            </div>

            <div className="w-full bg-surface border border-border p-2 rounded-xl flex items-center justify-between gap-2 mt-4 text-left">
              <div>
                <span className="text-[7px] text-subtle block uppercase font-black">Official Branch</span>
                <strong className="text-[9px] text-muted block">{selectedEmp.branchId.toUpperCase().replace('B-', '')} SHOWROOM</strong>
              </div>
              <QrCode className="w-7 h-7 text-subtle shrink-0" />
            </div>
          </div>
        </div>

        {/* Financial metrics: base salary, sales target vs current sales, commission earned */}
        <div className="bg-card/15 border border-border p-5 rounded-2xl space-y-4 font-mono text-xs">
          <span className="text-[10px] text-subtle font-bold uppercase tracking-wider block">Payroll, Targets & Commissions</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface/50 border border-border p-3.5 rounded-xl space-y-1">
              <span className="text-[9px] text-subtle uppercase font-bold">Monthly Base Contract</span>
              <strong className="text-sm text-muted font-black block">
                {selectedEmp.salary.toLocaleString()} MMK
              </strong>
              <span className="text-[9px] text-subtle leading-none block">Frequency: Monthly pay-slip</span>
            </div>

            <div className="bg-surface/50 border border-border p-3.5 rounded-xl space-y-1">
              <span className="text-[9px] text-subtle uppercase font-bold">Accumulated Commissions</span>
              <strong className="text-sm text-success font-black block">
                {Math.round(selectedEmp.currentSales * selectedEmp.commissionRate).toLocaleString()} MMK
              </strong>
              <span className="text-[9px] text-subtle leading-none block">Incentive Rate: {(selectedEmp.commissionRate * 100).toFixed(1)}%</span>
            </div>

            <div className="bg-surface/50 border border-border p-3.5 rounded-xl space-y-1">
              <span className="text-[9px] text-subtle uppercase font-bold">Overall Performance Score</span>
              <div className="flex items-baseline space-x-1">
                <strong className="text-sm text-rose-400 font-black">
                  {selectedEmp.performanceScore}%
                </strong>
                <span className="text-[9px] text-subtle font-bold">of target met</span>
              </div>
              <span className="text-[9px] text-subtle leading-none block">Rating: {selectedEmp.performanceScore >= 95 ? 'Excellent' : selectedEmp.performanceScore >= 85 ? 'Highly Effective' : 'Satisfactory'}</span>
            </div>
          </div>

          {/* Sales Target progress bar */}
          <div className="bg-surface/50 border border-border p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-baseline text-[10px]">
              <span className="text-subtle font-bold">Monthly Sales Target Progress</span>
              <div className="space-x-1.5">
                <span className="text-subtle">Achieved:</span>
                <strong className="text-success">{selectedEmp.currentSales.toLocaleString()} MMK</strong>
                <span className="text-subtle">/</span>
                <span className="text-subtle">{selectedEmp.salesTarget.toLocaleString()} MMK</span>
              </div>
            </div>
            
            {/* Bar */}
            <div className="w-full bg-card h-2.5 rounded-full overflow-hidden border border-slate-850">
              <div
                className="bg-gradient-to-r from-rose-500 to-rose-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((selectedEmp.currentSales / selectedEmp.salesTarget) * 100))}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[9px] text-subtle pt-1">
              <span>0% Target</span>
              <strong className="text-rose-400">
                {Math.round((selectedEmp.currentSales / selectedEmp.salesTarget) * 100)}% Completed
              </strong>
              <span>100% Target Met</span>
            </div>
          </div>
        </div>

        {/* Attendance, Leaves & Documents Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leaves Section */}
          <div className="bg-card/15 border border-border p-4 rounded-2xl space-y-4 font-mono text-xs">
            <div className="border-b border-border pb-2 flex items-center justify-between">
              <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Leave Applications</span>
              <span className="text-[10px] text-subtle font-bold">Balance: <strong className="text-rose-400">{selectedEmp.leaveBalance} days</strong></span>
            </div>

            {leaveSuccess && (
              <div className="bg-success/10 border border-success/25 p-2 rounded-lg text-success font-bold text-[10px] text-center">
                Applied for leave! Manager audit pending.
              </div>
            )}

            {/* Apply Leave mini-form */}
            <form onSubmit={handleApplyLeaveSubmit} className="bg-surface/40 border border-border p-3 rounded-xl space-y-2 text-[10px]">
              <span className="text-subtle font-bold block uppercase text-[9px]">Apply for Leave (Self)</span>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-0.5">
                  <label className="text-subtle text-[8px]">Type</label>
                  <select
                    value={applyLeaveType}
                    onChange={(e) => setApplyLeaveType(e.target.value as any)}
                    className="w-full bg-card border border-border rounded p-1 text-muted text-[10px]"
                  >
                    <option value="Paid Leave">Paid Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-subtle text-[8px]">Start Date</label>
                  <input
                    type="date"
                    required
                    value={applyStart}
                    onChange={(e) => setApplyStart(e.target.value)}
                    className="w-full bg-card border border-border rounded p-1 text-muted text-[10px]"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-subtle text-[8px]">End Date</label>
                  <input
                    type="date"
                    required
                    value={applyEnd}
                    onChange={(e) => setApplyEnd(e.target.value)}
                    className="w-full bg-card border border-border rounded p-1 text-muted text-[10px]"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-subtle text-[8px]">Reason</label>
                <input
                  type="text"
                  required
                  placeholder="Reason for taking leave..."
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  className="w-full bg-card border border-border rounded p-1 text-muted outline-none text-[10px]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-1.5 rounded-lg text-[9px] uppercase transition"
              >
                DISPATCH LEAVE APPLICATION
              </button>
            </form>

            {/* Leave applications pending */}
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {leaveRequests.map((lr) => (
                <div key={lr.id} className="bg-surface/60 p-2.5 border border-border rounded-lg flex items-center justify-between text-[10px]">
                  <div>
                    <span className="font-extrabold text-muted block">{lr.employeeName} • {lr.type}</span>
                    <span className="text-[9px] text-subtle block">{lr.startDate} to {lr.endDate} ({lr.days} days)</span>
                    <span className="text-[9px] text-subtle italic block mt-0.5">Reason: "{lr.reason}"</span>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {lr.status === 'pending' ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLeaveAction(lr.id, 'approved')}
                          className="p-1 bg-success/10 border border-success/20 hover:bg-success/25 rounded text-success"
                          title="Approve leave"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleLeaveAction(lr.id, 'rejected')}
                          className="p-1 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/25 rounded text-rose-400"
                          title="Reject leave"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        lr.status === 'approved' ? 'bg-success/10 text-success' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {lr.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HR Documents Vault */}
          <div className="bg-card/15 border border-border p-4 rounded-2xl space-y-4 font-mono text-xs">
            <div className="border-b border-border pb-2">
              <span className="text-[10px] text-subtle font-bold uppercase tracking-wider block">Verified Document Vault</span>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {selectedEmp.documents.map((doc, idx) => (
                <div key={idx} className="bg-surface/60 p-3 border border-border rounded-xl flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-muted block text-[10px] truncate max-w-[150px]">{doc.name}</strong>
                      <span className="text-[9px] text-subtle block">{doc.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      doc.status === 'verified' ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {doc.status}
                    </span>
                    <button
                      className="p-1 hover:bg-card rounded text-subtle hover:text-muted transition"
                      title="Download PDF Document"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Mock upload */}
              <div className="border border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-card/10 transition">
                <span className="text-[9px] text-subtle uppercase font-black tracking-wider block">DRAG & DROP STAFF DOCUMENTS</span>
                <span className="text-[8px] text-subtle block mt-0.5">Upload verified NID, contract, or academic degree certificates</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
