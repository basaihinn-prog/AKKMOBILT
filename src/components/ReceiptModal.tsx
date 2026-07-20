import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard, Award, Printer, ArrowLeft, FileText, Wrench, ShieldCheck } from 'lucide-react';
import { PosSale, Branch, RepairTicket, BranchId } from '../types';

interface ReceiptModalProps {
  sale?: PosSale;
  repair?: RepairTicket;
  branches?: Branch[];
  onClose: () => void;
  className?: string;
}

export default function ReceiptModal({ sale, repair, branches = [], onClose, className = '' }: ReceiptModalProps) {
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');
  const [isPrinting, setIsPrinting] = useState(true);
  const [printProgress, setPrintProgress] = useState(0);

  useEffect(() => {
    // Dynamic countdown emulating inkless physical engraving speed
    const interval = setInterval(() => {
      setPrintProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsPrinting(false), 450);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);
  
  const branchId = sale?.branchId || repair?.branchId || 'b-yangon';
  const matchedBranch = branches.find(b => b.id === branchId) || {
    id: branchId,
    name: branchId === 'b-mandalay' ? 'Mandalay Branch' : 
          branchId === 'b-naypyitaw' ? 'Naypyitaw Store' : 'Yangon HQ (Kaba Aye)',
    city: branchId === 'b-mandalay' ? 'Mandalay' : 
          branchId === 'b-naypyitaw' ? 'Naypyitaw' : 'Yangon',
    manager: 'U Kyaw Swar',
    phone: '09-777123456'
  };

  // Format MMK values nicely
  const formatKyat = (val: number) => {
    return val.toLocaleString() + ' MMK';
  };

  const originalSubtotal = sale?.items.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172e]/80 backdrop-blur-sm overflow-y-auto" id="pos-receipt-modal">
      <div className={`bg-white text-slate-900 w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative flex flex-col transition-all duration-500 overflow-hidden border border-slate-100 ${
        className || 'animate-slide-down'
      } ${
        printFormat === 'a4' ? 'max-w-3xl p-8 my-8' : 'max-w-sm p-6'
      }`}>
        
        {/* Sweeping scanline emulating physical thermal head engraving */}
        {isPrinting && (
          <div className="absolute inset-0 bg-[#10b981]/[0.015] pointer-events-none overflow-hidden z-30">
            <div className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-scanline" />
          </div>
        )}
        
        {/* Toggle format header */}
        <div className={`flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0 font-sans transition-all duration-300 ${
          isPrinting ? 'opacity-40 pointer-events-none' : 'opacity-100'
        }`}>
          <div className="flex items-center space-x-1">
            <Printer className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Invoice Format Selector</span>
          </div>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setPrintFormat('thermal')}
              className={`px-3 py-1 text-[10px] font-extrabold rounded-md transition ${
                printFormat === 'thermal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              80mm Thermal
            </button>
            <button
              onClick={() => setPrintFormat('a4')}
              className={`px-3 py-1 text-[10px] font-extrabold rounded-md transition ${
                printFormat === 'a4' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              A4 Portrait Invoice
            </button>
          </div>
        </div>

        {/* Dynamic Hardware Printer Feeder Simulation */}
        <div className="relative w-full bg-[#0f172e] text-[#f0f4ff] rounded-xl p-3 border border-[#1a2554] shadow-xl overflow-hidden mb-4 font-mono text-[10px] flex flex-col gap-1.5 shrink-0 select-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/5 via-[#00d4ff]/5 to-[#10b981]/5 opacity-40" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isPrinting ? 'bg-amber-500 animate-ping' : 'bg-[#10b981]'} shrink-0`} />
              <span className="font-extrabold uppercase tracking-wider text-slate-300">
                {isPrinting ? 'SYSTEM DECK: PRINT FEED ACTIVE' : 'SYSTEM DECK: THERMAL FEED READY'}
              </span>
            </div>
            <span className="text-[#8891ac] font-black">
              {isPrinting ? `FEEDING ${printProgress}%` : 'READY TO TEAR'}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#1a2554] rounded-full overflow-hidden relative z-10 border border-[#222f5a]">
            <div 
              className={`h-full bg-gradient-to-r from-[#10b981] to-sky-400 transition-all duration-100 ${
                isPrinting ? 'shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''
              }`}
              style={{ width: `${printProgress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[9px] text-slate-500 relative z-10">
            <span>HEAD DEV: POS-80MM-THERMAL</span>
            <span>METHOD: {sale ? 'INKLESS DIE-CUT' : 'DIAG WORKSLIP'}</span>
          </div>
        </div>

        {/* PRINTABLE AREA CONTENT */}
        <div className={`flex-1 overflow-y-auto max-h-[75vh] pr-1 relative transition-all duration-500 ${
          isPrinting ? 'animate-paper-feed select-none overflow-hidden' : ''
        }`}>
          {printFormat === 'thermal' ? (
            /* ==========================================
               1. 80MM THERMAL RECEIPT
               ========================================== */
            <div className="font-mono text-xs space-y-4">
              <div className="flex items-center justify-center space-x-2 bg-emerald-100 text-emerald-800 p-2 rounded-xl font-bold font-sans text-[11px]">
                {repair ? <Wrench className="w-3.5 h-3.5 stroke-[2.5]" /> : <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{repair ? 'REPAIR WORKSLIP DISPENSE' : 'INVOICE DISPENSE SUCCESS'}</span>
              </div>

              {/* BRAND LOGO DESIGN (HIGH CONTRAST PRINT FRIENDLY) */}
              <div className="flex flex-col items-center justify-center space-y-1 pb-3 border-b border-dashed border-slate-300 text-center">
                <div className="bg-[#0f172e] text-white px-3 py-1 rounded-md border border-[#1a2554] flex items-center space-x-1.5 font-sans leading-none shadow-sm mb-1 select-none">
                  <span className="text-amber-400 font-black tracking-widest text-sm">A</span>
                  <span className="text-white font-black tracking-widest text-sm">K</span>
                  <span className="text-[#00d4ff] font-black tracking-widest text-sm">K</span>
                  <span className="h-3.5 w-[1px] bg-slate-700" />
                  <span className="text-[8px] uppercase tracking-widest font-extrabold text-slate-300">MOBILE</span>
                </div>
                <h4 className="font-black text-xs tracking-tight uppercase text-slate-950">AKK MOBILE ENTERPRISE</h4>
                <p className="text-[10px] text-slate-500 font-bold">
                  {matchedBranch.name}
                </p>
                <p className="text-[9px] text-[#8891ac]">Tel: {matchedBranch.phone}</p>
                <p className="text-[9px] text-[#8891ac]">{repair ? 'Repair Diagnostic Ticket' : 'Myanmar Kyat Receipt (MMK)'}</p>
              </div>

              {/* Metadata */}
              <div className="space-y-1 text-[10px] text-slate-600 border-b border-dashed border-slate-200 pb-3">
                <div className="flex justify-between">
                  <span>{repair ? 'TICKET ID:' : 'INVOICE ID:'}</span>
                  <strong className="text-slate-900">{repair ? repair.id : sale?.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span>TIMESTAMP:</span>
                  <span>{new Date(repair ? repair.createdAt : (sale?.createdAt || '')).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{repair ? 'TECHNICIAN:' : 'CASHIER:'}</span>
                  <span className="font-bold">{repair ? (repair.assignedTechnician || 'Lead Technician') : sale?.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">{repair ? repair.customerName : sale?.customerName}</span>
                </div>
                {(repair ? repair.customerPhone : sale?.customerPhone) !== 'N/A' && (
                  <div className="flex justify-between">
                    <span>PHONE LINK:</span>
                    <span>{repair ? repair.customerPhone : sale?.customerPhone}</span>
                  </div>
                )}
                {repair && (
                  <div className="flex justify-between">
                    <span>DIAGNOSIS STATUS:</span>
                    <span className="font-bold uppercase text-indigo-600 bg-indigo-50 px-1 rounded text-[9px]">{repair.status}</span>
                  </div>
                )}
              </div>

              {/* Items / Repair Services */}
              <div className="space-y-2 py-1 border-b border-dashed border-slate-200 pb-3">
                {repair ? (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="font-black text-slate-900">SERVICE DESCRIPTION</span>
                      <span className="font-bold text-slate-950 text-right">COST (MMK)</span>
                    </div>
                    <div className="text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <p className="font-bold text-slate-900">
                        📱 {repair.deviceBrand} {repair.deviceModel}
                      </p>
                      <p className="mt-1"><strong className="text-slate-500">Hardware Issue:</strong> {repair.issueDescription}</p>
                      {repair.technicianNotes && (
                        <p className="mt-1.5 text-[9px] text-slate-500 italic border-t border-slate-200 pt-1">
                          <strong className="text-slate-600 font-bold font-sans not-italic">Bench logs:</strong> {repair.technicianNotes}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  sale?.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="block text-[9px] text-slate-500">
                          Qty {item.quantity} x {item.price.toLocaleString()} ({item.color})
                        </span>
                      </div>
                      <span className="font-bold text-slate-950 text-right shrink-0">
                        {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Total block */}
              <div className="space-y-1 text-right text-[11px] border-b border-dashed border-slate-200 pb-3">
                {repair ? (
                  <>
                    <div className="flex justify-between">
                      <span>Service Quote & Parts:</span>
                      <span>{repair.estimatedCost.toLocaleString()} MMK</span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-slate-950 border-t border-slate-200 pt-2 mt-1">
                      <span>TOTAL ESTIMATE:</span>
                      <span className="text-sm">{formatKyat(repair.estimatedCost)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                      <span>Warranty policy:</span>
                      <span className="font-bold text-slate-900">{repair.warrantyMonths} Months</span>
                    </div>
                  </>
                ) : (
                  sale && (
                    <>
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{(sale.totalAmount - sale.taxAmount + (sale.discountAmount || 0)).toLocaleString()} MMK</span>
                      </div>
                      {sale.discountAmount > 0 && (
                        <div className="flex justify-between text-rose-600">
                          <span>Campaign Discount:</span>
                          <span>- {sale.discountAmount.toLocaleString()} MMK</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Commercial Tax (5%):</span>
                        <span>{sale.taxAmount.toLocaleString()} MMK</span>
                      </div>
                      <div className="flex justify-between text-xs font-black text-slate-950 border-t border-slate-200 pt-2 mt-1">
                        <span>TOTAL AMOUNT:</span>
                        <span className="text-sm">{formatKyat(sale.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Method of Pay:</span>
                        <span className="uppercase font-bold text-slate-900">{sale.paymentMethod}</span>
                      </div>
                    </>
                  )
                )}
              </div>

              {/* Loyalty Reward / Warranty Policy */}
              {!repair && sale && sale.customerPhone !== 'N/A' && (
                <div className="bg-slate-50 p-2 rounded-lg text-[9px] text-slate-600 flex items-center space-x-1.5 border border-slate-100">
                  <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Customer earned estimated <strong>{Math.floor(sale.totalAmount / 1000)} Points</strong>!</span>
                </div>
              )}
              {repair && (
                <div className="bg-slate-50 p-2.5 rounded-lg text-[9px] text-slate-600 leading-relaxed border border-slate-100 space-y-1">
                  <div className="flex items-center space-x-1 font-bold text-slate-800 text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>AKK Repair Warranty Policy</span>
                  </div>
                  <p>Covers parts & service repair defects for <strong>{repair.warrantyMonths} months</strong>. Water diagnostic trace or structural drop voids warranty.</p>
                </div>
              )}

              {/* Barcode Mockup */}
              <div className="pt-2 flex flex-col items-center justify-center space-y-1 border-t border-dashed border-slate-300">
                <div className="h-6 w-44 bg-[#0f172e] flex items-center justify-center tracking-[5px] text-white text-[8px] font-sans font-black select-none">
                  ||||| | ||||| || ||| | || ||||
                </div>
                <span className="text-[8px] text-[#8891ac] font-sans tracking-wide">ELECTRONIC FISCAL RECORD SYNCED</span>
                <p className="text-[7px] text-[#8891ac] font-mono">Thank you for trusting AKK Mobile Service!</p>
              </div>
            </div>
          ) : (
            /* ==========================================
               2. CORPORATE A4 PORTRAIT INVOICE
               ========================================== */
            <div className="font-sans text-xs space-y-6 p-2 text-slate-800">
              
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                {/* AKK CORPORATE BRAND LOGO DESIGN */}
                <div className="flex items-center space-x-3.5">
                  <div className="flex items-center justify-center bg-[#0f172e] text-white rounded-xl p-3.5 shadow-md border border-[#1a2554] shrink-0 select-none">
                    <div className="flex flex-col items-center justify-center font-mono leading-none">
                      <span className="text-amber-400 font-black text-xl tracking-widest">AKK</span>
                      <span className="text-[7px] text-[#8891ac] font-bold uppercase tracking-widest mt-1">Mobile</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-950 tracking-tight uppercase">
                      AKK MOBILE ENTERPRISE CO., LTD.
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 max-w-sm leading-relaxed">
                      Corporate Office: No. 124, Kaba Aye Pagoda Road, Bahan Township, Yangon, Myanmar.<br />
                      Licence No: YGN-ERP-94827-MMK • Service Hub Registration
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-black text-slate-950 uppercase tracking-widest">
                    {repair ? 'WORK ORDER / BILL' : 'INVOICE'}
                  </h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                    {repair ? 'SERVICE CENTER RECORD' : 'TAX REGISTRATION COMPLIANT'}
                  </span>
                </div>
              </div>

              {/* Vendor & Client Details Split Grid */}
              <div className="grid grid-cols-2 gap-8 border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <span className="text-[9px] text-[#8891ac] font-bold uppercase block tracking-wider">Service Branch Location</span>
                  <strong className="text-slate-950 block text-[11px] font-extrabold">{matchedBranch.name}</strong>
                  <p className="text-slate-500 text-[10px]">
                    City: {matchedBranch.city}<br />
                    Manager: {matchedBranch.manager}<br />
                    Phone: {matchedBranch.phone}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-[#8891ac] font-bold uppercase block tracking-wider">Billed To Customer</span>
                  <strong className="text-slate-950 block text-[11px] font-extrabold">{repair ? repair.customerName : (sale?.customerName || '')}</strong>
                  <p className="text-slate-500 text-[10px]">
                    Phone Link: {repair ? repair.customerPhone : (sale?.customerPhone || '')}<br />
                    Billed At: {new Date(repair ? repair.createdAt : (sale?.createdAt || '')).toLocaleDateString()}<br />
                    Time: {new Date(repair ? repair.createdAt : (sale?.createdAt || '')).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* General metadata header */}
              <div className="grid grid-cols-4 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[10px]">
                <div>
                  <span className="text-[#8891ac] block font-bold">{repair ? 'TICKET NO' : 'INVOICE NO'}</span>
                  <strong className="text-slate-950">{repair ? repair.id : (sale?.id || '')}</strong>
                </div>
                <div>
                  <span className="text-[#8891ac] block font-bold">{repair ? 'REPAIR STATE' : 'PAYMENT METHOD'}</span>
                  <strong className="text-slate-950 uppercase text-indigo-600">{repair ? repair.status : (sale?.paymentMethod || '')}</strong>
                </div>
                <div>
                  <span className="text-[#8891ac] block font-bold">{repair ? 'RESPONSIBLE TECH' : 'CASHIER TERM'}</span>
                  <strong className="text-slate-950">{repair ? (repair.assignedTechnician || 'Lead Technician') : (sale?.cashierName || '')}</strong>
                </div>
                <div>
                  <span className="text-[#8891ac] block font-bold">{repair ? 'WARRANTY PLAN' : 'TAX STATUS'}</span>
                  <strong className={repair ? 'text-indigo-600' : 'text-emerald-600'}>
                    {repair ? `${repair.warrantyMonths}m Warranty` : '5% COM. TAX'}
                  </strong>
                </div>
              </div>

              {/* Items Table / Repair Details */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="px-4 py-2.5 w-16">S.NO</th>
                      <th className="px-4 py-2.5">SERVICE DETAILS / DESCRIPTION</th>
                      <th className="px-4 py-2.5">DEVICE SPECIFICATION</th>
                      <th className="px-4 py-2.5 text-right w-36">UNIT PRICE</th>
                      <th className="px-4 py-2.5 text-center w-24">QTY</th>
                      <th className="px-4 py-2.5 text-right w-36">TOTAL (MMK)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {repair ? (
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-4 text-[#8891ac] font-mono">1</td>
                        <td className="px-4 py-4">
                          <strong className="text-slate-950 block">Hardware Diagnostics, Repair Labor & Parts Service</strong>
                          <span className="text-[10px] text-indigo-600 bg-indigo-50/60 px-1.5 py-0.5 rounded font-mono mt-1 inline-block">
                            Issue: {repair.issueDescription}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-bold text-slate-800">📱 {repair.deviceBrand} {repair.deviceModel}</span>
                          {repair.technicianNotes && (
                            <p className="text-[9px] text-[#8891ac] italic mt-0.5">Note: {repair.technicianNotes}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-slate-600">
                          {repair.estimatedCost.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-slate-800">1</td>
                        <td className="px-4 py-4 text-right font-bold text-slate-950 font-mono">
                          {repair.estimatedCost.toLocaleString()}
                        </td>
                      </tr>
                    ) : (
                      sale?.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-[#8891ac] font-mono">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <strong className="text-slate-950 block">{item.name}</strong>
                            <span className="text-[9px] text-[#8891ac] font-mono">SKU: {item.productId}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{item.color}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-600">
                            {item.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-800">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-950 font-mono">
                            {(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Ledger Summary Calculation Details */}
              <div className="flex justify-between items-start pt-2">
                
                {/* Bank / Myanmar Mobile wallets instructions */}
                <div className="space-y-1.5 max-w-xs font-mono text-[9px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700 uppercase font-black tracking-wider block">Official Payment Gateways:</strong>
                  <p>
                    • KBZPay Payee ID: <strong>94821039420</strong> (AKK Enterprise)<br />
                    • WavePay Merchant: <strong>AKKMOBILE.ERP</strong><br />
                    • CBPay Corporate: <strong>0094-1029-4820-2104</strong>
                  </p>
                  <p className="text-[8px] italic">
                    * Ensure the digital transaction ID matches the Invoice No displayed on the invoice. Keep screenshot for reference.
                  </p>
                </div>

                {/* Totals Box */}
                <div className="w-72 space-y-1.5 font-mono text-[10px] text-slate-600 text-right">
                  {repair ? (
                    <>
                      <div className="flex justify-between">
                        <span>Total Service Estimation:</span>
                        <span className="text-slate-800">{repair.estimatedCost.toLocaleString()} MMK</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 text-xs font-black text-slate-950">
                        <span>NET TOTAL:</span>
                        <span className="text-emerald-600 text-sm">{formatKyat(repair.estimatedCost)}</span>
                      </div>
                    </>
                  ) : (
                    sale && (
                      <>
                        <div className="flex justify-between">
                          <span>Subtotal before discount:</span>
                          <span className="text-slate-800">{originalSubtotal.toLocaleString()} MMK</span>
                        </div>
                        {sale.discountAmount > 0 && (
                          <div className="flex justify-between text-rose-600 font-bold">
                            <span>Promo Campaign Discount:</span>
                            <span>- {sale.discountAmount.toLocaleString()} MMK</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Myanmar Commercial Tax (5%):</span>
                          <span className="text-slate-800">{sale.taxAmount.toLocaleString()} MMK</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-xs font-black text-slate-950">
                          <span>NET TOTAL:</span>
                          <span className="text-emerald-600 text-sm">{formatKyat(sale.totalAmount)}</span>
                        </div>
                      </>
                    )
                  )}
                </div>
              </div>

              {/* Signature lines */}
              <div className="pt-8 flex justify-between items-center text-center font-mono text-[9px] text-[#8891ac] border-t border-slate-100">
                <div className="space-y-1">
                  <div className="h-9 w-32 border-b border-slate-200 mx-auto flex items-end justify-center">
                    <span className="text-[8px] italic font-sans text-slate-500 font-bold">e-Verified</span>
                  </div>
                  <span>{repair ? 'AUTHORISED TECHNICIAN' : 'AUTHORISED CASHIER SIGN'}</span>
                </div>
                <div>
                  <div className="h-6 w-32 bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center font-sans font-black tracking-wide text-[#8891ac] text-[8px] select-none">
                    AKK SYNCED
                  </div>
                  <span className="text-[8px]">DIGITAL SYSTEM AUDIT</span>
                </div>
                <div className="space-y-1">
                  <div className="h-9 w-32 border-b border-slate-200 mx-auto" />
                  <span>CUSTOMER RECEIPT SIGN</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Closing actions */}
        <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-3 mt-3 shrink-0 font-sans">
          {isPrinting ? (
            <div className="flex items-center space-x-2 text-[#8891ac] font-mono text-[10px] uppercase font-bold tracking-widest mr-2 py-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping mr-1" />
              <span>Engraving thermal plate...</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center justify-center space-x-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 animate-pulse" />
                <span>Send to Device Printer</span>
              </button>
              <button
                onClick={onClose}
                className="bg-[#0f172e] hover:bg-slate-850 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-1 hover:scale-[1.02] active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{repair ? 'Back to Repair Desk' : 'Back to POS Terminal'}</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
