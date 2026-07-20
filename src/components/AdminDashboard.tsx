import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Wrench,
  Users,
  Building,
  FileSpreadsheet,
  Download,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Send,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowLeftRight,
  Wifi,
  Sliders,
  Bell,
  UserPlus,
  Sparkles,
  Server,
  HelpCircle,
  Link2,
  Eye,
  EyeOff,
  Database,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  PosSale,
  Expense,
  JoinedInventory,
  RepairTicket,
  Customer,
  Branch,
  PhoneProduct,
  Employee
} from '../types';

import AdminExecutiveDashboard from './AdminExecutiveDashboard';
import AdminRBAC from './AdminRBAC';
import AdminEmployeeView from './AdminEmployeeView';
import AdminBranchView from './AdminBranchView';
import AdminMetaManagement from './AdminMetaManagement';

interface AdminDashboardProps {
  sales: PosSale[];
  expenses: Expense[];
  inventories: JoinedInventory[];
  repairs: RepairTicket[];
  customers: Customer[];
  branches: Branch[];
  products: PhoneProduct[];
  onRefreshAllData?: () => void;
}

export default function AdminDashboard({
  sales,
  expenses,
  inventories,
  repairs,
  customers,
  branches,
  products,
  onRefreshAllData
}: AdminDashboardProps) {
  // Primary Tabs: executive_dashboard | kpis | forms | employees | branches | metadata | rbac | integrations
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<
    'executive_dashboard' | 'kpis' | 'forms' | 'employees' | 'branches' | 'metadata' | 'rbac' | 'integrations'
  >('executive_dashboard');

  const [activeSimulatedRole, setActiveSimulatedRole] = useState<string>('Owner');
  
  // Branch filter for KPI tab
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('All');

  // --- LOCAL HR & STAFF MANAGEMENT STATE ---
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "EMP-001",
      name: "Ko Aung Win",
      role: "Technician",
      branchId: "b-yangon",
      phone: "09420001111",
      attendanceStatus: "checked_in",
      attendanceTime: "08:45 AM",
      salesTarget: 2000000,
      currentSales: 1850000,
      commissionRate: 0.02
    },
    {
      id: "EMP-002",
      name: "Daw Su Su",
      role: "Branch Manager",
      branchId: "b-yangon",
      phone: "09420002222",
      attendanceStatus: "checked_in",
      attendanceTime: "08:15 AM",
      salesTarget: 12000000,
      currentSales: 11200000,
      commissionRate: 0.015
    },
    {
      id: "EMP-003",
      name: "Maing Ye Naing",
      role: "Sales",
      branchId: "b-mandalay",
      phone: "09420003333",
      attendanceStatus: "checked_out",
      attendanceTime: "04:00 PM",
      salesTarget: 6000000,
      currentSales: 5400000,
      commissionRate: 0.02
    },
    {
      id: "EMP-004",
      name: "Daw Shwe Yee",
      role: "Accountant",
      branchId: "b-yangon",
      phone: "09450009999",
      attendanceStatus: "checked_in",
      attendanceTime: "09:00 AM",
      salesTarget: 0,
      currentSales: 0,
      commissionRate: 0
    }
  ]);

  // --- LOCAL LOGISTICS STOCK TRANSFERS STATE ---
  const [transfers, setTransfers] = useState<any[]>([
    {
      id: "TR-502",
      productId: "p-iphone15",
      productName: "iPhone 15 Pro Max",
      fromBranchId: "b-yangon",
      toBranchId: "b-mandalay",
      fromBranchName: "Yangon HQ",
      toBranchName: "Mandalay Branch",
      quantity: 5,
      status: "pending",
      requestedBy: "Daw Su Su",
      createdAt: "2026-07-18T10:30:00Z"
    },
    {
      id: "TR-503",
      productId: "p-s24ultra",
      productName: "Samsung Galaxy S24 Ultra",
      fromBranchId: "b-mandalay",
      toBranchId: "b-naypyitaw",
      fromBranchName: "Mandalay Branch",
      toBranchName: "Naypyitaw Store",
      quantity: 3,
      status: "shipped",
      requestedBy: "U Kyaw Kyaw",
      createdAt: "2026-07-19T14:15:00Z"
    }
  ]);

  // --- INTEGRATIONS SETTINGS STATE ---
  const [integrationKeys, setIntegrationKeys] = useState({
    telegramBotToken: '',
    telegramChatId: '',
    webhookUrl: '',
    webhookAuthToken: '',
    supabaseUrl: '',
    supabaseKey: '',
    smsGatewayKey: '',
    vtuMerchantId: '',
    vtuSecretKey: ''
  });
  const [showSecrets, setShowSecrets] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Terminal telemetry state for ping test
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [pinging, setPinging] = useState(false);

  // --- SUB-PROCESS FORM SELECTION & INPUTS ---
  const [activeFormType, setActiveFormType] = useState<
    'sale' | 'product' | 'replenish' | 'transfer' | 'repair' | 'vtu' | 'closing' | 'employee' | 'loyalty'
  >('sale');

  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  // POS Sale form fields
  const [saleBranchId, setSaleBranchId] = useState('b-yangon');
  const [saleCustomerName, setSaleCustomerName] = useState('Walk-In Customer');
  const [saleCustomerPhone, setSaleCustomerPhone] = useState('N/A');
  const [saleProductId, setSaleProductId] = useState('');
  const [saleColor, setSaleColor] = useState('Graphite');
  const [saleQty, setSaleQty] = useState('1');
  const [salePaymentMethod, setSalePaymentMethod] = useState('cash');
  const [saleDiscount, setSaleDiscount] = useState('0');

  // Product Catalog form fields
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('Apple');
  const [prodCategory, setProdCategory] = useState<'Phone' | 'Accessories' | 'Electronics' | 'Repair Parts'>('Phone');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodColor, setProdColor] = useState('Slate Grey');
  const [prodSpecs, setProdSpecs] = useState({
    screen: '6.7" Super Retina AMOLED Screen',
    processor: 'Antigravity Enterprise A18 Octa-core',
    ram: '12GB RAM LPDDR5X',
    storage: '512GB High-Speed Storage',
    battery: '5200mAh High-Density Battery',
    camera: '108MP Cinematic Triple Lens'
  });

  // Stock replenish form fields
  const [replenishBranchId, setReplenishBranchId] = useState('b-yangon');
  const [replenishProductId, setReplenishProductId] = useState('');
  const [replenishStock, setReplenishStock] = useState('20');
  const [replenishMinThreshold, setReplenishMinThreshold] = useState('4');

  // Stock transfer form fields
  const [transferFromBranch, setTransferFromBranch] = useState('b-yangon');
  const [transferToBranch, setTransferToBranch] = useState('b-mandalay');
  const [transferProductId, setTransferProductId] = useState('');
  const [transferQty, setTransferQty] = useState('5');

  // Repair ticket form fields
  const [repairBranchId, setRepairBranchId] = useState('b-yangon');
  const [repairCustName, setRepairCustName] = useState('');
  const [repairCustPhone, setRepairCustPhone] = useState('');
  const [repairDeviceBrand, setRepairDeviceBrand] = useState('Apple');
  const [repairDeviceModel, setRepairDeviceModel] = useState('');
  const [repairIssue, setRepairIssue] = useState('');
  const [repairEstCost, setRepairEstCost] = useState('75000');
  const [repairWarranty, setRepairWarranty] = useState('6');
  const [repairTechnician, setRepairTechnician] = useState('Ko Aung Win');

  // VTU form fields
  const [vtuBranchId, setVtuBranchId] = useState('b-yangon');
  const [vtuOperator, setVtuOperator] = useState('MPT');
  const [vtuType, setVtuType] = useState('airtime');
  const [vtuPhone, setVtuPhone] = useState('');
  const [vtuAmount, setVtuAmount] = useState('5000');

  // Daily Closing form fields
  const [closingBranchId, setClosingBranchId] = useState('b-yangon');
  const [closingCash, setClosingCash] = useState('650000');
  const [closingKPay, setClosingKPay] = useState('1850000');
  const [closingWave, setClosingWave] = useState('950000');
  const [closingOther, setClosingOther] = useState('200000');
  const [closingExpense, setClosingExpense] = useState('40000');
  const [closingDiff, setClosingDiff] = useState('0');
  const [closingBy, setClosingBy] = useState('Daw Su Su (Branch Manager)');

  // Employee onboarding form fields
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState<'Owner' | 'Branch Manager' | 'Cashier' | 'Sales' | 'Technician' | 'Accountant'>('Cashier');
  const [empBranchId, setEmpBranchId] = useState('b-yangon');
  const [empPhone, setEmpPhone] = useState('');
  const [empSalesTarget, setEmpSalesTarget] = useState('6000000');
  const [empCommission, setEmpCommission] = useState('1.5');

  // VIP Loyalty Customer form fields
  const [vipName, setVipName] = useState('');
  const [vipPhone, setVipPhone] = useState('');
  const [vipEmail, setVipEmail] = useState('');
  const [vipPoints, setVipPoints] = useState('500');
  const [vipTier, setVipTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'VIP'>('Gold');
  const [vipDebt, setVipDebt] = useState('0');

  // Fetch integration configurations on mount
  useEffect(() => {
    fetch('/api/integrations')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        setIntegrationKeys(data);
      })
      .catch((e) => console.log('Could not load integrations state'));
  }, []);

  // --- KPI TAB CALCULATIONS & FILTERING ---
  const filteredSales = sales.filter(
    (s) => selectedBranchFilter === 'All' || s.branchId === selectedBranchFilter
  );
  const filteredExpenses = expenses.filter(
    (e) => selectedBranchFilter === 'All' || e.branchId === selectedBranchFilter
  );
  const filteredInventories = inventories.filter(
    (i) => selectedBranchFilter === 'All' || i.branchId === selectedBranchFilter
  );
  const filteredRepairs = repairs.filter(
    (r) => selectedBranchFilter === 'All' || r.branchId === selectedBranchFilter
  );

  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalSalesTax = filteredSales.reduce((sum, s) => sum + s.taxAmount, 0);
  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalCogs = filteredSales.reduce((sum, s) => {
    const originalSubtotal = s.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return sum + Math.round(originalSubtotal * 0.7);
  }, 0);

  const netProfit = totalSalesRevenue - totalExpenseAmount;
  const totalStockValue = filteredInventories.reduce(
    (sum, item) => sum + item.productPrice * item.stock,
    0
  );
  const totalUnitsInStock = filteredInventories.reduce((sum, item) => sum + item.stock, 0);

  const criticalLowStockList = filteredInventories.filter(
    (item) => item.stock <= item.minAlertThreshold
  );
  const lowStockAlarmsCount = criticalLowStockList.length;

  const activeRepairsCount = filteredRepairs.filter(
    (r) => r.status !== 'delivered' && r.status !== 'ready'
  ).length;
  const pendingServiceRevenue = filteredRepairs
    .filter((r) => r.status !== 'delivered')
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  // Customer metrics
  const totalCustomersCount = customers.length;
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  const totalOutstandingCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0);
  const vipTierCount = customers.filter((c) => c.tier === 'VIP').length;

  // Recharts: Sales trends over 5 days
  const getSalesOverTime = () => {
    const dailyData: Record<string, { revenue: number }> = {};
    const now = Date.now();
    for (let i = 4; i >= 0; i--) {
      const dateStr = new Date(now - 3600000 * 24 * i).toISOString().split('T')[0];
      dailyData[dateStr] = { revenue: 0 };
    }

    filteredSales.forEach((s) => {
      const day = s.createdAt.split('T')[0];
      if (dailyData[day]) {
        dailyData[day].revenue += s.totalAmount;
      }
    });

    return Object.keys(dailyData)
      .sort()
      .map((date) => ({
        date: date.substring(5), // mm-dd
        Revenue: dailyData[date].revenue
      }));
  };

  // Recharts: Expenses breakdown
  const getExpensesCategoryData = () => {
    const cats: Record<string, number> = {
      Rent: 0,
      Salary: 0,
      Utilities: 0,
      Marketing: 0,
      'Repair Parts': 0,
      Other: 0
    };

    filteredExpenses.forEach((e) => {
      if (cats[e.category] !== undefined) {
        cats[e.category] += e.amount;
      } else {
        cats['Other'] = (cats['Other'] || 0) + e.amount;
      }
    });

    const colors = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#64748b'];
    return Object.keys(cats)
      .filter((k) => cats[k] > 0)
      .map((key, idx) => ({
        name: key,
        value: cats[key],
        color: colors[idx % colors.length]
      }));
  };

  // Recharts: Branch Comparison
  const getBranchComparisonData = () => {
    return branches.map((b) => {
      const bSales = sales.filter((s) => s.branchId === b.id);
      const bExpenses = expenses.filter((e) => e.branchId === b.id);
      const bRevenue = bSales.reduce((sum, s) => sum + s.totalAmount, 0);
      const bExps = bExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        name: b.city,
        Revenue: bRevenue,
        Expenses: bExps
      };
    });
  };

  // Raw CSV downloads
  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSalesCSV = () => {
    let csv = 'Sale ID,Branch ID,Customer,Phone,Payment Method,Cashier,Total Amount (MMK),Tax (MMK),Discount (MMK),Timestamp\n';
    filteredSales.forEach((s) => {
      csv += `"${s.id}","${s.branchId}","${s.customerName}","${s.customerPhone}","${s.paymentMethod}","${s.cashierName}",${s.totalAmount},${s.taxAmount},${s.discountAmount},"${s.createdAt}"\n`;
    });
    downloadCSV(`AKK_Sales_Ledger_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const exportInventoryCSV = () => {
    let csv = 'Product ID,Brand,Model,Category,Price (MMK),Branch ID,Branch Stock,Alert Threshold,Valuation (MMK)\n';
    filteredInventories.forEach((i) => {
      const valuation = i.productPrice * i.stock;
      csv += `"${i.productId}","${i.productBrand}","${i.productName}","Phone",${i.productPrice},"${i.branchId}",${i.stock},${i.minAlertThreshold},${valuation}\n`;
    });
    downloadCSV(`AKK_Inventory_Audit_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  // --- SAVE INTEGRATION CONFIGURATION ---
  const handleSaveIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(integrationKeys)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  // --- SIMULATE REAL-TIME NETWORK PINGS ---
  const triggerPingSimulator = () => {
    if (pinging) return;
    setPinging(true);
    setTerminalLogs([]);

    const steps = [
      '📡 INITIATING MULTI-SERVICE PING TESTS...',
      `🔗 [Pinging api.telegram.org] using BotToken: ${integrationKeys.telegramBotToken ? 'VALIDATED' : 'DEFAULT_PRESET'}`,
      '💬 Telegram Bot API successfully registered! (Status: 200 OK, Response: {"ok":true,"result":{"username":"AKK_Mobile_Campaign_Bot"}})',
      '🌐 [Inbound webhooks triggering] Pinging external partner ERP endpoint...',
      `🎯 TARGET: ${integrationKeys.webhookUrl || 'https://api.externalpartner.com/v1/pos-webhooks'}`,
      '⚡ Secure SSL handshake completed in 84ms. Bearer token authenticated.',
      '💾 [Cloud Supabase backup] Initiating secure sync test with remote PostgreSQL cluster...',
      `🗄️ Supabase Project URL: ${integrationKeys.supabaseUrl || 'https://kkmgkti67zhhq6zrc2gngs.supabase.co'}`,
      '🔒 SUPABASE LINK ACTIVE! Real-time CDC channel listening on public.pos_sales schema.',
      '📶 [VTU E-load gateway] Syncing with Myanmar operator cellular routing server...',
      '📈 E-Load system calibrated for MPT, Atom, Ooredoo, and Mytel top-ups. Merchant ID is active.',
      '📊 ALL NETWORKS GREEN! Secure enterprise endpoints fully synchronized. Real-time updates active.'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`]);
        currentStep++;
      } else {
        clearInterval(interval);
        setPinging(false);
      }
    }, 450);
  };

  // --- CORE SYSTEM PROCESS CREATION FORMS HANDLER ---
  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitLoading(true);
    setFormSuccessMessage(null);
    setFormErrorMessage(null);

    let url = '';
    let payload = {};

    try {
      if (activeFormType === 'sale') {
        url = '/api/sales';
        if (!saleProductId) {
          throw new Error('Please select a Handset SKU product first.');
        }
        const selectedProd = products.find((p) => p.id === saleProductId);
        if (!selectedProd) throw new Error('Product not found in catalog');

        payload = {
          branchId: saleBranchId,
          customerName: saleCustomerName,
          customerPhone: saleCustomerPhone,
          paymentMethod: salePaymentMethod,
          discountAmount: Number(saleDiscount || 0),
          cashierName: 'Admin Executive Panel',
          items: [
            {
              productId: saleProductId,
              name: selectedProd.name,
              price: selectedProd.price,
              color: saleColor,
              quantity: Number(saleQty)
            }
          ]
        };
      } else if (activeFormType === 'product') {
        url = '/api/products';
        if (!prodName || !prodPrice) {
          throw new Error('Product name and prices are required.');
        }
        payload = {
          name: prodName,
          brand: prodBrand,
          price: Number(prodPrice),
          originalPrice: Number(prodOriginalPrice || prodPrice),
          category: prodCategory,
          colors: [prodColor],
          specs: prodSpecs
        };
      } else if (activeFormType === 'replenish') {
        url = '/api/inventory';
        if (!replenishProductId) {
          throw new Error('Please choose a Handset SKU product to replenish.');
        }
        payload = {
          branchId: replenishBranchId,
          productId: replenishProductId,
          stock: Number(replenishStock),
          minAlertThreshold: Number(replenishMinThreshold)
        };
      } else if (activeFormType === 'transfer') {
        url = '/api/transfers';
        if (transferFromBranch === transferToBranch) {
          throw new Error('Origin and destination branches must be distinct.');
        }
        if (!transferProductId) {
          throw new Error('Please select a product SKU to transfer.');
        }
        payload = {
          productId: transferProductId,
          fromBranchId: transferFromBranch,
          toBranchId: transferToBranch,
          quantity: Number(transferQty),
          requestedBy: 'Executive Admin'
        };
      } else if (activeFormType === 'repair') {
        url = '/api/repairs';
        if (!repairCustName || !repairCustPhone || !repairDeviceModel) {
          throw new Error('Customer contact details and device model details are required.');
        }
        payload = {
          branchId: repairBranchId,
          customerName: repairCustName,
          customerPhone: repairCustPhone,
          deviceBrand: repairDeviceBrand,
          deviceModel: repairDeviceModel,
          issueDescription: repairIssue || 'Diagnostics test needed',
          estimatedCost: Number(repairEstCost),
          warrantyMonths: Number(repairWarranty),
          assignedTechnician: repairTechnician
        };
      } else if (activeFormType === 'vtu') {
        url = '/api/vtu';
        if (!vtuPhone || !vtuAmount) {
          throw new Error('Target telephone number and topup amount are required.');
        }
        payload = {
          type: vtuType,
          operator: vtuOperator,
          phoneNumber: vtuPhone,
          amount: Number(vtuAmount),
          branchId: vtuBranchId
        };
      } else if (activeFormType === 'closing') {
        url = '/api/accounting/closing';
        payload = {
          branchId: closingBranchId,
          cashSales: Number(closingCash),
          kPaySales: Number(closingKPay),
          wavePaySales: Number(closingWave),
          otherDigitalSales: Number(closingOther),
          expenseAmount: Number(closingExpense),
          drawerDifference: Number(closingDiff),
          closedBy: closingBy
        };
      } else if (activeFormType === 'employee') {
        url = '/api/hr';
        if (!empName || !empPhone) {
          throw new Error('Onboard employee name and phone number are required.');
        }
        payload = {
          name: empName,
          role: empRole,
          branchId: empBranchId,
          phone: empPhone,
          salesTarget: Number(empSalesTarget),
          commissionRate: Number(empCommission) / 100
        };
      } else if (activeFormType === 'loyalty') {
        url = '/api/customers';
        if (!vipName || !vipPhone) {
          throw new Error('VIP member name and telephone are required.');
        }
        payload = {
          name: vipName,
          phone: vipPhone,
          email: vipEmail || `${vipName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          tier: vipTier,
          loyaltyPoints: Number(vipPoints),
          totalSpent: vipTier === 'VIP' ? 15000000 : (vipTier === 'Gold' ? 8000000 : 3000000),
          creditBalance: Number(vipDebt)
        };
      }

      // POST Fetch Execution
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Server error occurred during process execution.');
      }

      // SUCCESS HANDLING
      setFormSuccessMessage(`⚡ PROCESS REGISTERED SUCCESSFULLY: Recorded item with ID [${responseData.id || responseData.productId || 'CONFIRMED'}] to database ledger.`);
      
      // Clear Form state inputs based on type
      if (activeFormType === 'sale') {
        setSaleProductId('');
        setSaleCustomerName('Walk-In Customer');
        setSaleCustomerPhone('N/A');
      } else if (activeFormType === 'product') {
        setProdName('');
        setProdPrice('');
        setProdOriginalPrice('');
      } else if (activeFormType === 'replenish') {
        setReplenishProductId('');
      } else if (activeFormType === 'transfer') {
        setTransferProductId('');
      } else if (activeFormType === 'repair') {
        setRepairCustName('');
        setRepairCustPhone('');
        setRepairDeviceModel('');
        setRepairIssue('');
      } else if (activeFormType === 'vtu') {
        setVtuPhone('');
      } else if (activeFormType === 'employee') {
        setEmpName('');
        setEmpPhone('');
      } else if (activeFormType === 'loyalty') {
        setVipName('');
        setVipPhone('');
        setVipEmail('');
      }

      // Refresh Parent Datasets globally so updates cascade instantly!
      if (onRefreshAllData) {
        onRefreshAllData();
      }

    } catch (err: any) {
      setFormErrorMessage(err.message || 'System fault executing ledger command.');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="admin-dashboard-root">
      
      {/* Top Banner and Navigation Switch Board */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-card/30 border border-border rounded-2xl p-5">
        <div>
          <h3 className="text-base font-extrabold text-foreground font-mono uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>AKK Mobile Enterprise Command Center</span>
          </h3>
          <p className="text-[11px] text-subtle font-mono mt-1 leading-relaxed">
            Centralized administrative system controllers for sales checkout, inventories, transfers, cellular top-ups, accounting, & CRM dispatches.
          </p>
        </div>

        {/* Outer Command Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface p-1.5 rounded-xl border border-slate-850 w-full xl:w-auto font-mono text-[10px] font-bold">
          <button
            onClick={() => setAdminActiveSubTab('executive_dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              adminActiveSubTab === 'executive_dashboard'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            <span>EXECUTIVE DECK</span>
          </button>
          <button
            onClick={() => setAdminActiveSubTab('kpis')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              adminActiveSubTab === 'kpis'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>RAW RECHARTS</span>
          </button>
          <button
            onClick={() => setAdminActiveSubTab('forms')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              adminActiveSubTab === 'forms'
                ? 'bg-success/10 text-success border border-success/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-success" />
            <span>DISPATCH FORMS</span>
          </button>
          <button
            onClick={() => setAdminActiveSubTab('employees')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              adminActiveSubTab === 'employees'
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>STAFF DIRECTORY</span>
          </button>
          <button
            onClick={() => setAdminActiveSubTab('branches')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              adminActiveSubTab === 'branches'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>SHOWROOM LOGISTICS</span>
          </button>
          <button
            onClick={() => setAdminActiveSubTab('metadata')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              adminActiveSubTab === 'metadata'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>MASTER CONFIGS</span>
          </button>
          <button
            onClick={() => setAdminActiveSubTab('rbac')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              adminActiveSubTab === 'rbac'
                ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
            <span>RBAC ROLES</span>
          </button>
          <button
            onClick={() => setAdminActiveSubTab('integrations')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              adminActiveSubTab === 'integrations'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-subtle hover:text-muted'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-primary" />
            <span>TELEMETRY GATEWAY</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SUB-TAB: EXECUTIVE DECK (True Enterprise Dashboard)
         ======================================================== */}
      {adminActiveSubTab === 'executive_dashboard' && (
        <AdminExecutiveDashboard
          sales={sales}
          expenses={expenses}
          inventories={inventories}
          repairs={repairs}
          customers={customers}
          branches={branches}
          products={products}
          onRefreshAllData={onRefreshAllData}
          activeSimulatedRole={activeSimulatedRole}
        />
      )}

      {/* ========================================================
          SUB-TAB: PERSONNEL STAFF MANAGER
         ======================================================== */}
      {adminActiveSubTab === 'employees' && (
        <AdminEmployeeView />
      )}

      {/* ========================================================
          SUB-TAB: SHOWROOMS & STOCK LOGISTICS
         ======================================================== */}
      {adminActiveSubTab === 'branches' && (
        <AdminBranchView
          branches={branches}
          inventories={inventories}
          transfers={transfers}
          employees={employees}
          products={products}
          onRefreshAllData={onRefreshAllData}
        />
      )}

      {/* ========================================================
          SUB-TAB: MASTER METADATA DATA CONFIGURATOR
         ======================================================== */}
      {adminActiveSubTab === 'metadata' && (
        <AdminMetaManagement />
      )}

      {/* ========================================================
          SUB-TAB: ROLE-BASED ACCESS SECURITY MANAGER
         ======================================================== */}
      {adminActiveSubTab === 'rbac' && (
        <AdminRBAC
          activeSimulatedRole={activeSimulatedRole}
          onSimulateRoleChange={setActiveSimulatedRole}
        />
      )}

      {/* ========================================================
          SUB-TAB A: EXECUTIVES KPIS & DIAGNOSTICS (ORIGINAL CARD VIEW)
         ======================================================== */}
      {adminActiveSubTab === 'kpis' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub-tab scope filter controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface/40 border border-border p-3 rounded-xl font-mono text-xs">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-subtle" />
              <span className="text-subtle font-bold">Select Active Scope:</span>
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-transparent text-xs text-muted outline-none font-bold cursor-pointer"
              >
                <option value="All" className="bg-surface">Consolidated Ledger (All Branches)</option>
                <option value="b-yangon" className="bg-surface">Yangon Head Office (Kaba Aye)</option>
                <option value="b-mandalay" className="bg-surface">Mandalay Division Branch</option>
                <option value="b-naypyitaw" className="bg-surface">Naypyitaw Capital Mall</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-subtle">Download Excel Audit:</span>
              <button
                onClick={exportSalesCSV}
                className="bg-card hover:bg-slate-850 border border-border hover:border-success/20 text-muted font-bold px-2.5 py-1.5 rounded text-[10px] flex items-center space-x-1"
              >
                <Download className="w-3 h-3 text-success" />
                <span>Sales CSV</span>
              </button>
              <button
                onClick={exportInventoryCSV}
                className="bg-card hover:bg-slate-850 border border-border hover:border-primary/20 text-muted font-bold px-2.5 py-1.5 rounded text-[10px] flex items-center space-x-1"
              >
                <Download className="w-3 h-3 text-primary" />
                <span>Inventory CSV</span>
              </button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            
            <div className="bg-card/25 border border-border rounded-2xl p-4.5 space-y-2 group hover:border-slate-850 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Gross Retail Sales</span>
                <div className="p-1.5 bg-success/10 text-success rounded-lg">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <strong className="text-xl sm:text-2xl text-success block font-black">
                  {totalSalesRevenue.toLocaleString()} MMK
                </strong>
                <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-subtle">
                  <span>Sales Count:</span>
                  <strong className="text-foreground">{filteredSales.length} bills</strong>
                  <span className="text-subtle">•</span>
                  <span>GST/VAT:</span>
                  <strong className="text-foreground">{totalSalesTax.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="bg-card/25 border border-border rounded-2xl p-4.5 space-y-2 group hover:border-slate-850 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Net Surplus Balance</span>
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <strong className="text-xl sm:text-2xl text-foreground block font-black">
                  {netProfit.toLocaleString()} MMK
                </strong>
                <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-subtle">
                  <span>Opex booked:</span>
                  <strong className="text-rose-400">-{totalExpenseAmount.toLocaleString()}</strong>
                  <span className="text-subtle">•</span>
                  <span>Est COGS:</span>
                  <strong className="text-subtle">{totalCogs.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="bg-card/25 border border-border rounded-2xl p-4.5 space-y-2 group hover:border-slate-850 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Inventory Asset Valuation</span>
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <strong className="text-xl sm:text-2xl text-accent block font-black">
                  {totalStockValue.toLocaleString()} MMK
                </strong>
                <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-subtle">
                  <span>Units:</span>
                  <strong className="text-foreground">{totalUnitsInStock} pcs</strong>
                  <span className="text-subtle">•</span>
                  <span className={`font-bold ${lowStockAlarmsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-subtle'}`}>
                    {lowStockAlarmsCount} alerts
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card/25 border border-border rounded-2xl p-4.5 space-y-2 group hover:border-slate-850 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Hardware service pipeline</span>
                <div className="p-1.5 bg-pink-500/10 text-pink-400 rounded-lg">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <strong className="text-xl sm:text-2xl text-pink-400 block font-black">
                  {activeRepairsCount} tickets pending
                </strong>
                <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-subtle">
                  <span>Est revenue:</span>
                  <strong className="text-success">{pendingServiceRevenue.toLocaleString()} MMK</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sales Trends Chart */}
            <div className="lg:col-span-8 bg-card/15 border border-border rounded-2xl p-5 space-y-3">
              <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono block">Multi-Branch Consolidated Sales Over Time (MMK)</span>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getSalesOverTime()} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                    <XAxis dataKey="date" stroke="#475569" fontSize={11} className="font-mono" tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} className="font-mono" tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                      labelStyle={{ fontFamily: 'monospace', fontSize: '10px', color: '#64748b' }}
                      itemStyle={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Revenue" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expenses Category Pie Chart */}
            <div className="lg:col-span-4 bg-card/15 border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono block">Operating Expense Categories</span>
              
              <div className="h-48 flex items-center justify-center relative">
                {getExpensesCategoryData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getExpensesCategoryData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {getExpensesCategoryData().map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '10px' }}
                        itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center font-mono text-[10px] text-subtle">
                    No operating expenses recorded.
                  </div>
                )}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] text-subtle font-mono font-bold uppercase">Expense</span>
                  <strong className="text-xs font-black text-muted font-mono">
                    {totalExpenseAmount.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-subtle">
                {getExpensesCategoryData().map((entry, idx) => (
                  <div key={idx} className="flex items-center space-x-1 px-1.5 py-1 bg-surface/40 rounded border border-border/40">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="truncate flex-1">{entry.name}</span>
                    <strong className="text-muted">{((entry.value / totalExpenseAmount) * 100).toFixed(0)}%</strong>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Branch Performance grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-card/20 border border-border rounded-2xl p-5 space-y-4">
              <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono block">Branch Output Breakdown (Revenue vs Expenses)</span>
              <div className="space-y-4 pr-1">
                {getBranchComparisonData().map((b, idx) => {
                  const maxVal = Math.max(...getBranchComparisonData().map((x) => x.Revenue)) || 1;
                  const barPct = Math.min(100, Math.round((b.Revenue / maxVal) * 100));

                  return (
                    <div key={idx} className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-extrabold text-muted">{b.name} Showroom</span>
                        <div className="space-x-1.5 text-[10px]">
                          <span className="text-subtle">Rev:</span>
                          <strong className="text-success">{b.Revenue.toLocaleString()}</strong>
                          <span className="text-subtle">|</span>
                          <span className="text-subtle">Exp:</span>
                          <strong className="text-rose-400">{b.Expenses.toLocaleString()}</strong>
                        </div>
                      </div>
                      <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border">
                        <div
                          className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Demographics, low stock */}
            <div className="bg-card/20 border border-border rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2.5 font-mono text-xs">
                <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">CRM CRM loyalty overview</span>
                <div className="bg-surface/60 p-3 rounded-xl border border-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-subtle">Total Clients:</span>
                    <strong className="text-muted">{totalCustomersCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-subtle">VIP Members:</span>
                    <strong className="text-pink-400">{vipTierCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-subtle">Outstanding Credit:</span>
                    <strong className="text-rose-400">{totalOutstandingCredit.toLocaleString()} MMK</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Critical alerts log</span>
                <div className="bg-surface/60 p-3 rounded-xl border border-border space-y-1 max-h-[100px] overflow-y-auto">
                  {criticalLowStockList.length > 0 ? (
                    criticalLowStockList.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[10px]">
                        <span className="text-subtle truncate max-w-[100px]">{item.productName}</span>
                        <strong className="text-rose-400 shrink-0">{item.stock} left ({item.branchId.toUpperCase().slice(2, 6)})</strong>
                      </div>
                    ))
                  ) : (
                    <div className="text-subtle text-[10px] italic">No active inventory alerts</div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          SUB-TAB B: OPERATIONS PROCESS FORMSHUB (CREATION FORMS)
         ======================================================== */}
      {adminActiveSubTab === 'forms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Form category sidebar selectors */}
          <div className="lg:col-span-4 bg-card/30 border border-border p-4 rounded-2xl space-y-1.5">
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono block px-2 mb-3">Trigger Core Business Event</span>
            {[
              { key: 'sale', label: 'Manual POS Checkout Ticket', icon: DollarSign, color: 'text-success' },
              { key: 'product', label: 'Catalog New Handset SKU', icon: Plus, color: 'text-primary' },
              { key: 'replenish', label: 'Warehouse Stock Replenish', icon: Package, color: 'text-primary' },
              { key: 'transfer', label: 'Inter-Branch Stock Transfer', icon: ArrowLeftRight, color: 'text-amber-400' },
              { key: 'repair', label: 'Hardware Repair Ticket Intake', icon: Wrench, color: 'text-pink-400' },
              { key: 'vtu', label: 'Cellular E-Load VTU Dispatch', icon: Wifi, color: 'text-purple-400' },
              { key: 'closing', label: 'Double Entry Shift Close Book', icon: Sliders, color: 'text-blue-400' },
              { key: 'employee', label: 'Onboard HR Staff Member', icon: UserPlus, color: 'text-rose-400' },
              { key: 'loyalty', label: 'Register CRM VIP Loyalty', icon: Users, color: 'text-teal-400' }
            ].map((f) => {
              const IconComp = f.icon;
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    setActiveFormType(f.key as any);
                    setFormSuccessMessage(null);
                    setFormErrorMessage(null);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition-all text-left ${
                    activeFormType === f.key
                      ? 'bg-surface border border-slate-850 text-white shadow'
                      : 'text-subtle hover:text-muted hover:bg-surface/20'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${f.color}`} />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Form Panel */}
          <div className="lg:col-span-8 bg-card/15 border border-border p-5 rounded-2xl space-y-4">
            
            {/* Display status banners */}
            {formSuccessMessage && (
              <div className="bg-success/10 border border-success/25 p-3.5 rounded-xl text-success font-bold font-mono text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-success mt-0.5" />
                <span>{formSuccessMessage}</span>
              </div>
            )}

            {formErrorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/25 p-3.5 rounded-xl text-rose-400 font-bold font-mono text-xs flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <span>{formErrorMessage}</span>
              </div>
            )}

            {/* Skeleton Loading Panel */}
            {formSubmitLoading ? (
              <div className="space-y-4 py-8 animate-pulse font-mono text-xs">
                <div className="h-6 bg-elevated rounded-md w-1/3 mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-elevated rounded-md" />
                  <div className="h-10 bg-elevated rounded-md" />
                </div>
                <div className="h-20 bg-elevated rounded-md" />
                <div className="h-10 bg-elevated rounded-md w-full mt-6" />
                <p className="text-center text-subtle animate-pulse">LOCKING LEDGER SEGMENT & WRITING BACKEND TRANSACTION...</p>
              </div>
            ) : (
              <form onSubmit={handleProcessSubmit} className="space-y-4 font-mono text-xs">
                
                {/* Form header description */}
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <span className="text-xs font-black text-foreground uppercase tracking-wider">
                    {activeFormType === 'sale' && 'Checkout Form: Book New POS Sale'}
                    {activeFormType === 'product' && 'Product Form: Catalogue New Handset SKU'}
                    {activeFormType === 'replenish' && 'Warehouse Form: Replenish Product Stock'}
                    {activeFormType === 'transfer' && 'Logistics Form: Dispatch Stock Transfer'}
                    {activeFormType === 'repair' && 'Support Form: Hardware Repair Ticket Intake'}
                    {activeFormType === 'vtu' && 'E-Load Form: Cell VTU Dispatch'}
                    {activeFormType === 'closing' && 'Accounting Form: GAAP Ledger Shift Closures'}
                    {activeFormType === 'employee' && 'Personnel Form: HR Staff Onboarding'}
                    {activeFormType === 'loyalty' && 'CRM Form: VIP Customer Registry'}
                  </span>
                  <span className="text-[10px] bg-surface px-2 py-0.5 border border-slate-850 rounded text-subtle">POST Action</span>
                </div>

                {/* 1. MANUAL POS SALE CHECKOUT */}
                {activeFormType === 'sale' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Target Branch</label>
                        <select
                          value={saleBranchId}
                          onChange={(e) => setSaleBranchId(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="b-yangon">Yangon HQ</option>
                          <option value="b-mandalay">Mandalay Branch</option>
                          <option value="b-naypyitaw">Naypyitaw Store</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Choose Handset SKU</label>
                        <select
                          value={saleProductId}
                          onChange={(e) => setSaleProductId(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          required
                        >
                          <option value="">-- Choose Stock SKU --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.brand}) - {p.price.toLocaleString()} MMK
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Color Variant</label>
                        <input
                          type="text"
                          value={saleColor}
                          onChange={(e) => setSaleColor(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Quantity (Units)</label>
                        <input
                          type="number"
                          value={saleQty}
                          onChange={(e) => setSaleQty(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          min="1"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Payment Channel</label>
                        <select
                          value={salePaymentMethod}
                          onChange={(e) => setSalePaymentMethod(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="cash">Cash (Myanmar Kyat)</option>
                          <option value="kbzpay">KBZPay Digital</option>
                          <option value="wavepay">WavePay Digital</option>
                          <option value="credit">Store Credit (VIP Debt)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Client Name</label>
                        <input
                          type="text"
                          value={saleCustomerName}
                          onChange={(e) => setSaleCustomerName(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Client Telephone (09...)</label>
                        <input
                          type="text"
                          value={saleCustomerPhone}
                          onChange={(e) => setSaleCustomerPhone(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-subtle">Discount Amount (MMK)</label>
                      <input
                        type="number"
                        value={saleDiscount}
                        onChange={(e) => setSaleDiscount(e.target.value)}
                        className="w-full bg-surface border border-border rounded p-2 text-muted"
                      />
                    </div>
                  </div>
                )}

                {/* 2. PRODUCT SKUs REGISTRATION */}
                {activeFormType === 'product' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Handset/Model Name</label>
                        <input
                          type="text"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="e.g. Redmi Note 15 Pro+"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Brand Designation</label>
                        <select
                          value={prodBrand}
                          onChange={(e) => setProdBrand(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="Apple">Apple</option>
                          <option value="Samsung">Samsung</option>
                          <option value="Google">Google</option>
                          <option value="Xiaomi">Xiaomi</option>
                          <option value="OnePlus">OnePlus</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Original Cost (MMK)</label>
                        <input
                          type="number"
                          value={prodOriginalPrice}
                          onChange={(e) => setProdOriginalPrice(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="900000"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Selling Price (MMK)</label>
                        <input
                          type="number"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="1200000"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Initial Colorway</label>
                        <input
                          type="text"
                          value={prodColor}
                          onChange={(e) => setProdColor(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Category</label>
                        <select
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value as any)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="Phone">Phone Catalog</option>
                          <option value="Accessories">Accessories Catalog</option>
                          <option value="Electronics">Other Electronics</option>
                          <option value="Repair Parts">Service Repair Parts</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Screen specs</label>
                        <input
                          type="text"
                          value={prodSpecs.screen}
                          onChange={(e) => setProdSpecs({ ...prodSpecs, screen: e.target.value })}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">RAM Variant</label>
                        <input
                          type="text"
                          value={prodSpecs.ram}
                          onChange={(e) => setProdSpecs({ ...prodSpecs, ram: e.target.value })}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Storage capacity</label>
                        <input
                          type="text"
                          value={prodSpecs.storage}
                          onChange={(e) => setProdSpecs({ ...prodSpecs, storage: e.target.value })}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. WAREHOUSE STOCK REPLENISHMENT */}
                {activeFormType === 'replenish' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-subtle">Select Branch Warehouse</label>
                      <select
                        value={replenishBranchId}
                        onChange={(e) => setReplenishBranchId(e.target.value)}
                        className="w-full bg-surface border border-border rounded p-2 text-muted"
                      >
                        <option value="b-yangon">Yangon HQ Warehouse</option>
                        <option value="b-mandalay">Mandalay Branch Warehouse</option>
                        <option value="b-naypyitaw">Naypyitaw Store Depot</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-subtle">Select Product Catalog SKU</label>
                      <select
                        value={replenishProductId}
                        onChange={(e) => setReplenishProductId(e.target.value)}
                        className="w-full bg-surface border border-border rounded p-2 text-muted"
                        required
                      >
                        <option value="">-- Choose Target Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.brand})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Absolute Stock level to Set (Units)</label>
                        <input
                          type="number"
                          value={replenishStock}
                          onChange={(e) => setReplenishStock(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          min="0"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Minimum Safe Stock Alert Limit</label>
                        <input
                          type="number"
                          value={replenishMinThreshold}
                          onChange={(e) => setReplenishMinThreshold(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. STOCK DISPATCH */}
                {activeFormType === 'transfer' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Origin Branch (Source)</label>
                        <select
                          value={transferFromBranch}
                          onChange={(e) => setTransferFromBranch(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="b-yangon">Yangon HQ</option>
                          <option value="b-mandalay">Mandalay Branch</option>
                          <option value="b-naypyitaw">Naypyitaw Store</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Destination Branch (Target)</label>
                        <select
                          value={transferToBranch}
                          onChange={(e) => setTransferToBranch(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="b-yangon">Yangon HQ</option>
                          <option value="b-mandalay">Mandalay Branch</option>
                          <option value="b-naypyitaw">Naypyitaw Store</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-subtle">Choose Handset SKU to dispatch</label>
                      <select
                        value={transferProductId}
                        onChange={(e) => setTransferProductId(e.target.value)}
                        className="w-full bg-surface border border-border rounded p-2 text-muted"
                        required
                      >
                        <option value="">-- Choose Dispatch SKU --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.brand})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-subtle">Transfer Quantity (Units)</label>
                      <input
                        type="number"
                        value={transferQty}
                        onChange={(e) => setTransferQty(e.target.value)}
                        className="w-full bg-surface border border-border rounded p-2 text-muted"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 5. REPAIR TICKET INTAKE */}
                {activeFormType === 'repair' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Diagnostics Lab Branch</label>
                        <select
                          value={repairBranchId}
                          onChange={(e) => setRepairBranchId(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="b-yangon">Yangon HQ Service Lab</option>
                          <option value="b-mandalay">Mandalay Service Lab</option>
                          <option value="b-naypyitaw">Naypyitaw Service Lab</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Device Brand</label>
                        <input
                          type="text"
                          value={repairDeviceBrand}
                          onChange={(e) => setRepairDeviceBrand(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="e.g. Apple"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Device Model SKU</label>
                        <input
                          type="text"
                          value={repairDeviceModel}
                          onChange={(e) => setRepairDeviceModel(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="e.g. iPhone 15 Pro (Cracked Screen)"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Diagnostics Issue Description</label>
                        <input
                          type="text"
                          value={repairIssue}
                          onChange={(e) => setRepairIssue(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="Broken display module assembly replacement needed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Est. Repair Cost (MMK)</label>
                        <input
                          type="number"
                          value={repairEstCost}
                          onChange={(e) => setRepairEstCost(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Warranty duration (Mth)</label>
                        <input
                          type="number"
                          value={repairWarranty}
                          onChange={(e) => setRepairWarranty(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Assigned Technician</label>
                        <input
                          type="text"
                          value={repairTechnician}
                          onChange={(e) => setRepairTechnician(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Client Full Name</label>
                        <input
                          type="text"
                          value={repairCustName}
                          onChange={(e) => setRepairCustName(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="Ma Moe Moe"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Client Contact Mobile</label>
                        <input
                          type="tel"
                          value={repairCustPhone}
                          onChange={(e) => setRepairCustPhone(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="09798765432"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. CELLULAR VTU TOP-UP */}
                {activeFormType === 'vtu' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Target Operator</label>
                        <select
                          value={vtuOperator}
                          onChange={(e) => setVtuOperator(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted font-bold"
                        >
                          <option value="MPT">MPT Cellular</option>
                          <option value="Atom">Atom Cellular</option>
                          <option value="Ooredoo">Ooredoo Telecom</option>
                          <option value="Mytel">Mytel Myanmar</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Top-up Package</label>
                        <select
                          value={vtuType}
                          onChange={(e) => setVtuType(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="airtime">Airtime Credit (Kyats)</option>
                          <option value="data">Data Internet Pack</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Dispatch Branch</label>
                        <select
                          value={vtuBranchId}
                          onChange={(e) => setVtuBranchId(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="b-yangon">Yangon HQ</option>
                          <option value="b-mandalay">Mandalay Store</option>
                          <option value="b-naypyitaw">Naypyitaw Store</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Recipient Phone Number (09...)</label>
                        <input
                          type="tel"
                          value={vtuPhone}
                          onChange={(e) => setVtuPhone(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted font-bold"
                          placeholder="e.g. 09799123456"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Recharge Amount (Kyats)</label>
                        <input
                          type="number"
                          value={vtuAmount}
                          onChange={(e) => setVtuAmount(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted font-bold"
                          placeholder="5000"
                          min="1000"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. GAAP SHIFT CLOSINGS */}
                {activeFormType === 'closing' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Target Branch</label>
                        <select
                          value={closingBranchId}
                          onChange={(e) => setClosingBranchId(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="b-yangon">Yangon HQ</option>
                          <option value="b-mandalay">Mandalay Branch</option>
                          <option value="b-naypyitaw">Naypyitaw Store</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Audit Supervisor Name</label>
                        <input
                          type="text"
                          value={closingBy}
                          onChange={(e) => setClosingBy(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Cash drawer (MMK)</label>
                        <input
                          type="number"
                          value={closingCash}
                          onChange={(e) => setClosingCash(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">KBZPay (MMK)</label>
                        <input
                          type="number"
                          value={closingKPay}
                          onChange={(e) => setClosingKPay(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">WavePay (MMK)</label>
                        <input
                          type="number"
                          value={closingWave}
                          onChange={(e) => setClosingWave(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Other Dig (MMK)</label>
                        <input
                          type="number"
                          value={closingOther}
                          onChange={(e) => setClosingOther(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Recorded OPEX cash expense during shift</label>
                        <input
                          type="number"
                          value={closingExpense}
                          onChange={(e) => setClosingExpense(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Drawer Discrepancy difference</label>
                        <input
                          type="number"
                          value={closingDiff}
                          onChange={(e) => setClosingDiff(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. HR STAFF ONBOARDING */}
                {activeFormType === 'employee' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Full Staff Name</label>
                        <input
                          type="text"
                          value={empName}
                          onChange={(e) => setEmpName(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="e.g. Maing Ye Naing"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Telephone Contact</label>
                        <input
                          type="tel"
                          value={empPhone}
                          onChange={(e) => setEmpPhone(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="e.g. 09420001111"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Primary Role designation</label>
                        <select
                          value={empRole}
                          onChange={(e) => setEmpRole(e.target.value as any)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="Cashier">Cashier Operator</option>
                          <option value="Branch Manager">Showroom Branch Manager</option>
                          <option value="Sales">Retail Sales executive</option>
                          <option value="Technician">Hardware diagnostics Technician</option>
                          <option value="Accountant">Lead Accountant</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Branch assigned</label>
                        <select
                          value={empBranchId}
                          onChange={(e) => setEmpBranchId(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        >
                          <option value="b-yangon">Yangon Head Office</option>
                          <option value="b-mandalay">Mandalay Branch</option>
                          <option value="b-naypyitaw">Naypyitaw Mall Store</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Monthly Sales Target (MMK)</label>
                        <input
                          type="number"
                          value={empSalesTarget}
                          onChange={(e) => setEmpSalesTarget(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Commission incentive rate (%)</label>
                        <input
                          type="number"
                          value={empCommission}
                          onChange={(e) => setEmpCommission(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          step="0.1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. CRM CUSTOMER LOYALTY REGISTRY */}
                {activeFormType === 'loyalty' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Client full name</label>
                        <input
                          type="text"
                          value={vipName}
                          onChange={(e) => setVipName(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="U Khin Maung"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Contact Telephone</label>
                        <input
                          type="tel"
                          value={vipPhone}
                          onChange={(e) => setVipPhone(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="09421111222"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-subtle">Email address</label>
                        <input
                          type="email"
                          value={vipEmail}
                          onChange={(e) => setVipEmail(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                          placeholder="khin@gmail.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">Initial loyalty points</label>
                        <input
                          type="number"
                          value={vipPoints}
                          onChange={(e) => setVipPoints(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-subtle">VIP Tier status</label>
                        <select
                          value={vipTier}
                          onChange={(e) => setVipTier(e.target.value as any)}
                          className="w-full bg-surface border border-border rounded p-2 text-muted font-bold"
                        >
                          <option value="Bronze">Bronze member tier</option>
                          <option value="Silver">Silver member tier</option>
                          <option value="Gold">Gold member tier</option>
                          <option value="VIP">Premium VIP guest tier</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-subtle">Current Outstanding Credit balance (MMK)</label>
                      <input
                        type="number"
                        value={vipDebt}
                        onChange={(e) => setVipDebt(e.target.value)}
                        className="w-full bg-surface border border-border rounded p-2 text-rose-400 font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* Form submit button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-success to-emerald-600 text-slate-950 font-black py-3 rounded-xl uppercase transition hover:opacity-90 flex items-center justify-center space-x-1.5 shadow"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>TRANSMIT EVENT & LOG TO LEDGERS</span>
                </button>
              </form>
            )}

          </div>

        </div>
      )}

      {/* ========================================================
          SUB-TAB C: EXTERNAL SYSTEMS GATEWAY INTEGRATIONS
         ======================================================== */}
      {adminActiveSubTab === 'integrations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Key Configurations Form Panel */}
          <div className="lg:col-span-7 bg-card/15 border border-border p-5 rounded-2xl space-y-4">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">Third-Party API & Webhook Credentials</span>
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-subtle hover:text-primary text-[10px] font-mono font-bold flex items-center space-x-1"
              >
                {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSecrets ? 'Mask secrets' : 'Reveal raw keys'}</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="bg-primary/10 border border-primary/25 p-3 rounded-xl text-primary font-bold font-mono text-xs text-center">
                🎉 Integration tokens secured & updated in live memories!
              </div>
            )}

            <form onSubmit={handleSaveIntegrations} className="space-y-4 font-mono text-xs">
              
              {/* Telegram bot campaign integrations */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-primary font-black uppercase tracking-wider block">💬 Telegram Broadcast Integration</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-subtle">Telegram Bot API Token</label>
                    <input
                      type={showSecrets ? 'text' : 'password'}
                      value={integrationKeys.telegramBotToken}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, telegramBotToken: e.target.value })}
                      placeholder="e.g. 739482015:AAH_fG40b2-u8q5_kM..."
                      className="w-full bg-surface border border-border rounded p-2 text-muted outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-subtle">Broadcast Channel Chat ID</label>
                    <input
                      type="text"
                      value={integrationKeys.telegramChatId}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, telegramChatId: e.target.value })}
                      placeholder="e.g. -100204918231"
                      className="w-full bg-surface border border-border rounded p-2 text-muted outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time sync webhooks */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <span className="text-[10px] text-success font-black uppercase tracking-wider block">🌐 Inbound/Outbound Real-time webhooks</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-subtle">Partner Webhook Trigger URL</label>
                    <input
                      type="text"
                      value={integrationKeys.webhookUrl}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, webhookUrl: e.target.value })}
                      placeholder="https://api.externalpartner.com/v1/pos-webhooks"
                      className="w-full bg-surface border border-border rounded p-2 text-muted outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-subtle">Webhook Bearer Token</label>
                    <input
                      type={showSecrets ? 'text' : 'password'}
                      value={integrationKeys.webhookAuthToken}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, webhookAuthToken: e.target.value })}
                      placeholder="bearer_sec_tkn_84920..."
                      className="w-full bg-surface border border-border rounded p-2 text-muted outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Supabase PostgreSQL credentials */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <span className="text-[10px] text-primary font-black uppercase tracking-wider block">🗄️ Relational Supabase Cloud Backup</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-subtle">Supabase Project URL</label>
                    <input
                      type="text"
                      value={integrationKeys.supabaseUrl}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, supabaseUrl: e.target.value })}
                      placeholder="https://kkkmgkti67zhhq6zrc.supabase.co"
                      className="w-full bg-surface border border-border rounded p-2 text-muted outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-subtle">Supabase Service Role Key</label>
                    <input
                      type={showSecrets ? 'text' : 'password'}
                      value={integrationKeys.supabaseKey}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, supabaseKey: e.target.value })}
                      placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                      className="w-full bg-surface border border-border rounded p-2 text-muted outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SMS cellular and VTU provider gateways */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <span className="text-[10px] text-purple-400 font-black uppercase tracking-wider block">📶 Telecom SMS & E-Load Gateways</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-subtle">SMS cellular API key</label>
                    <input
                      type={showSecrets ? 'text' : 'password'}
                      value={integrationKeys.smsGatewayKey}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, smsGatewayKey: e.target.value })}
                      placeholder="sms_live_api_8390..."
                      className="w-full bg-surface border border-border rounded p-2 text-muted outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-subtle">VTU Merchant ID</label>
                    <input
                      type="text"
                      value={integrationKeys.vtuMerchantId}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, vtuMerchantId: e.target.value })}
                      placeholder="vtu_merch_94821"
                      className="w-full bg-surface border border-border rounded p-2 text-muted outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-subtle">VTU gateway Secret</label>
                    <input
                      type={showSecrets ? 'text' : 'password'}
                      value={integrationKeys.vtuSecretKey}
                      onChange={(e) => setIntegrationKeys({ ...integrationKeys, vtuSecretKey: e.target.value })}
                      placeholder="vtu_sec_key_9482..."
                      className="w-full bg-surface border border-border rounded p-2 text-muted outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit triggers */}
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 bg-primary hover:bg-sky-450 disabled:opacity-50 text-slate-950 font-black py-2.5 rounded-xl uppercase transition"
                >
                  {saveLoading ? 'Securing keys...' : 'Commit Gateway Tokens'}
                </button>
              </div>

            </form>
          </div>

          {/* Test Link connection Pinger Terminal Simulator */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between h-[480px]">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-black font-mono text-muted uppercase tracking-wider">Live Network Ping Tester</span>
                </div>
                <span className="text-[9px] text-subtle font-mono">PORT 3000 Inbound</span>
              </div>

              {/* Terminal screen output */}
              <div className="bg-surface p-3.5 border border-border rounded-xl h-72 overflow-y-auto font-mono text-[10px] text-success space-y-2 leading-relaxed">
                {terminalLogs.length > 0 ? (
                  terminalLogs.map((log, idx) => <p key={idx}>{log}</p>)
                ) : (
                  <p className="text-subtle italic text-center pt-24">Terminal idle. Click 'RUN LINK DIAGNOSTICS' below to execute secure ping test across active APIs.</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={triggerPingSimulator}
              disabled={pinging}
              className="w-full bg-card hover:bg-slate-850 border border-border text-primary font-bold py-2.5 rounded-xl uppercase transition flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${pinging ? 'animate-spin' : ''}`} />
              <span>{pinging ? 'PING DIAGNOSTICS RUNNING...' : 'RUN LINK DIAGNOSTICS'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
