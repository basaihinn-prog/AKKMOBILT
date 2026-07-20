import React, { useState, useEffect } from 'react';
import { UserCheck, Sliders, CalendarDays, Plus, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { Employee, BranchId } from '../types';

interface HRSubTabProps {
  activeBranchId: BranchId;
}

export default function HRSubTab({ activeBranchId }: HRSubTabProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [newTargetVal, setNewTargetVal] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/hr');
      if (res.ok) setEmployees(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleToggleAttendance = async (empId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'checked_in' ? 'checked_out' : 'checked_in';
    try {
      const res = await fetch('/api/hr/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, status: nextStatus })
      });
      if (res.ok) fetchEmployees();
    } catch (e) { console.error(e); }
  };

  const handleUpdateTarget = async (empId: string) => {
    if (!newTargetVal) return;
    try {
      const res = await fetch('/api/hr/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, target: parseFloat(newTargetVal) })
      });
      if (res.ok) {
        setTargetId(null);
        setNewTargetVal('');
        fetchEmployees();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6" id="hr-sub-tab">
      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-900 flex items-center justify-between flex-wrap gap-2">
          <h4 className="font-bold text-sm text-slate-100 font-mono uppercase tracking-wider flex items-center space-x-2">
            <CalendarDays className="w-4 h-4 text-sky-400" />
            <span>Myanmar Retail HR Attendance & Performance Console</span>
          </h4>
          <span className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-3 py-1 rounded font-mono font-bold">
            {employees.length} Staff Enrolled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] border-b border-slate-900">
                <th className="px-5 py-3 font-extrabold">STAFF NAME / ROLE</th>
                <th className="px-5 py-3 font-extrabold">BRANCH LOCATION</th>
                <th className="px-5 py-3 font-extrabold text-center">SHIFT ATTENDANCE</th>
                <th className="px-5 py-3 font-extrabold">SALES TARGET METRICS (MMK)</th>
                <th className="px-5 py-3 font-extrabold">EARNED COMMISSION</th>
                <th className="px-5 py-3 font-extrabold text-right">OPERATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {employees.map((emp) => {
                const commissionMMK = emp.currentSales * emp.commissionRate;
                const achievementRate = emp.salesTarget > 0 ? (emp.currentSales / emp.salesTarget) * 100 : 0;

                return (
                  <tr key={emp.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white text-sm">{emp.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{emp.role}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-300 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-sky-500" />
                        <span>{emp.branchId.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        emp.attendanceStatus === 'checked_in'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {emp.attendanceStatus === 'checked_in' ? `In [${emp.attendanceTime || '08:00 AM'}]` : 'Checked Out'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>Target: <strong>{emp.salesTarget.toLocaleString()}</strong></span>
                        <span className="text-slate-400">Achieved: <strong>{emp.currentSales.toLocaleString()} ({Math.round(achievementRate)}%)</strong></span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, achievementRate)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-400">
                      {commissionMMK.toLocaleString()} MMK
                      <span className="block text-[9px] text-slate-500 font-normal">Rate: {emp.commissionRate * 100}%</span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-y-1">
                      {targetId === emp.id ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <input
                            type="number"
                            value={newTargetVal}
                            onChange={(e) => setNewTargetVal(e.target.value)}
                            placeholder="Target"
                            className="bg-slate-950 border border-slate-800 text-center rounded w-20 py-1 font-bold text-[10px]"
                          />
                          <button
                            onClick={() => handleUpdateTarget(emp.id)}
                            className="bg-emerald-500 text-slate-950 p-1.5 rounded"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setTargetId(emp.id);
                              setNewTargetVal(String(emp.salesTarget));
                            }}
                            className="text-[10px] text-slate-400 hover:text-white bg-slate-950 border border-slate-800 px-2 py-1 rounded"
                          >
                            Set Target
                          </button>
                          <button
                            onClick={() => handleToggleAttendance(emp.id, emp.attendanceStatus)}
                            className={`text-[10px] px-2 py-1 rounded border ${
                              emp.attendanceStatus === 'checked_in'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/25'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
                            }`}
                          >
                            {emp.attendanceStatus === 'checked_in' ? 'Check Out' : 'Check In'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
