import React, { useState, useEffect } from 'react';
import { TrendingUp, FileText, CheckCircle2, UserCheck, AlertCircle, Plus, BookOpen } from 'lucide-react';
import { ChartOfAccount, DailyClosing, BranchId } from '../types';

interface AccountingSubTabProps {
  activeBranchId: BranchId;
  cashierName: string;
}

export default function AccountingSubTab({ activeBranchId, cashierName }: AccountingSubTabProps) {
  const [coa, setCoa] = useState<ChartOfAccount[]>([]);
  const [closings, setClosings] = useState<DailyClosing[]>([]);
  
  // Closing form state
  const [cash, setCash] = useState('');
  const [kPay, setKPay] = useState('');
  const [wave, setWave] = useState('');
  const [otherDigital, setOtherDigital] = useState('');
  const [expense, setExpense] = useState('');
  const [drawerDiff, setDrawerDiff] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoa();
    fetchClosings();
  }, []);

  const fetchCoa = async () => {
    try {
      const res = await fetch('/api/accounting/coa');
      if (res.ok) setCoa(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchClosings = async () => {
    try {
      const res = await fetch('/api/accounting/closing');
      if (res.ok) setClosings(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleCloseDay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/accounting/closing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: activeBranchId,
          cashSales: parseFloat(cash) || 0,
          kPaySales: parseFloat(kPay) || 0,
          wavePaySales: parseFloat(wave) || 0,
          otherDigitalSales: parseFloat(otherDigital) || 0,
          expenseAmount: parseFloat(expense) || 0,
          drawerDifference: parseFloat(drawerDiff) || 0,
          closedBy: cashierName
        })
      });

      if (res.ok) {
        setCash('');
        setKPay('');
        setWave('');
        setOtherDigital('');
        setExpense('');
        setDrawerDiff('0');
        fetchCoa();
        fetchClosings();
        alert('📊 Daily shift closing ledger audited and posted to general journal!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="accounting-sub-tab">
      {/* Chart of Accounts */}
      <div className="xl:col-span-7 bg-[#1a2554]/20 border border-[#1a2554] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a2554] flex items-center justify-between">
          <h4 className="font-bold text-sm text-[#f0f4ff] font-mono uppercase tracking-wider flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#10b981]" />
            <span>AKK Mobile General Ledger Accounts (MMK)</span>
          </h4>
          <span className="text-[10px] bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-2 py-0.5 rounded font-mono font-bold">
            Double Entry GAAP
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-[#0f172e] text-[#8891ac] text-[10px] border-b border-[#1a2554]">
                <th className="px-5 py-3 font-extrabold">CODE</th>
                <th className="px-5 py-3 font-extrabold">ACCOUNT NAME</th>
                <th className="px-5 py-3 font-extrabold">CATEGORY</th>
                <th className="px-5 py-3 font-extrabold text-right">CURRENT BALANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {coa.map((acct) => (
                <tr key={acct.code} className="hover:bg-[#1a2554]/10 transition-colors">
                  <td className="px-5 py-3 text-[#8891ac] font-bold">{acct.code}</td>
                  <td className="px-5 py-3 text-[#b0b8d4] font-bold">{acct.name}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      acct.category === 'Asset' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/10' :
                      acct.category === 'Liability' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' :
                      acct.category === 'Equity' ? 'bg-[#3052a3]/10 text-[#3052a3] border border-[#3052a3]/10' :
                      acct.category === 'Revenue' ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/10' :
                      'bg-[#222f5a] text-[#8891ac]'
                    }`}>
                      {acct.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-black text-[#f0f4ff]">
                    {acct.balance.toLocaleString()} MMK
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Drawer Closing Form */}
      <div className="xl:col-span-5 bg-[#1a2554]/30 border border-[#1a2554] rounded-2xl p-5 space-y-4">
        <div className="border-b border-[#1a2554] pb-3 flex items-center justify-between">
          <span className="font-bold text-[#b0b8d4] uppercase font-mono tracking-wider text-xs">End-of-Day Shift Close</span>
          <span className="text-[10px] text-slate-500 font-mono">Location: {activeBranchId.toUpperCase()}</span>
        </div>

        <form onSubmit={handleCloseDay} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#8891ac] text-[11px]">Drawer Cash (MMK)</label>
              <input
                type="number"
                placeholder="450000"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-2.5 py-1.5 text-[#b0b8d4] font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#8891ac] text-[11px]">KBZPay Total (MMK)</label>
              <input
                type="number"
                placeholder="2450000"
                value={kPay}
                onChange={(e) => setKPay(e.target.value)}
                className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-2.5 py-1.5 text-[#b0b8d4] font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#8891ac] text-[11px]">WavePay Total (MMK)</label>
              <input
                type="number"
                placeholder="1200000"
                value={wave}
                onChange={(e) => setWave(e.target.value)}
                className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-2.5 py-1.5 text-[#b0b8d4] font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#8891ac] text-[11px]">Other Wallets (MMK)</label>
              <input
                type="number"
                placeholder="300000"
                value={otherDigital}
                onChange={(e) => setOtherDigital(e.target.value)}
                className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-2.5 py-1.5 text-[#b0b8d4] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#8891ac] text-[11px]">Shift Cash Expense (MMK)</label>
              <input
                type="number"
                placeholder="50000"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-2.5 py-1.5 text-rose-400 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#8891ac] text-[11px]">Drawer Discrepancy</label>
              <input
                type="number"
                placeholder="0"
                value={drawerDiff}
                onChange={(e) => setDrawerDiff(e.target.value)}
                className="w-full bg-[#0f172e] border border-[#222f5a] rounded px-2.5 py-1.5 text-amber-400 font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#10b981] hover:bg-emerald-450 disabled:opacity-50 text-slate-950 font-black py-2.5 rounded-xl uppercase transition font-sans text-xs flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{loading ? 'POSTING LEDGER AUDIT...' : 'POST CLOSING SHIFT'}</span>
          </button>
        </form>

        {/* Prior closings log */}
        <div className="space-y-2 pt-3 border-t border-[#1a2554]">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Recent Closed Audits</span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {closings.map((cls) => (
              <div key={cls.id} className="bg-[#0f172e] border border-[#1a2554] p-2.5 rounded-lg flex justify-between font-mono text-[10px] text-[#8891ac]">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <strong className="text-[#b0b8d4]">{cls.id}</strong>
                    <span className="text-slate-600">|</span>
                    <span className="text-[#10b981] font-black">{cls.branchId.toUpperCase()}</span>
                  </div>
                  <span>Audit by: {cls.closedBy}</span>
                </div>
                <div className="text-right space-y-0.5">
                  <strong className="text-white block">{cls.totalSales.toLocaleString()} MMK</strong>
                  <span className="text-slate-500 block">{cls.closingDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
