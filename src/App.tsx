import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Wrench,
  Wifi,
  Search,
  ShoppingCart,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  Phone,
  MapPin,
  FileText,
  User,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  X,
  CreditCard,
  ArrowRight,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Building2,
  ArrowLeftRight,
  TrendingUp,
  Users,
  Mail,
  FileSpreadsheet,
  Layers,
  Award,
  Sliders,
  Receipt,
  Layers3,
  CalendarDays,
  Target,
  Bell,
  Sun,
  Moon,
  LogOut
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
  Cell
} from 'recharts';

import {
  TabType,
  SubTabType,
  Branch,
  PhoneProduct,
  JoinedInventory,
  StockTransfer,
  Customer,
  PosSale,
  RepairTicket,
  VtuTransaction,
  CartItem,
  ChatMessage,
  BranchId,
  PaymentMethod,
  Expense,
  NotificationLog,
  OnlineOrder
} from './types';

// Import our decoupled sub-components
import AIPredictions from './components/AIPredictions';
import ReceiptModal from './components/ReceiptModal';
import RepairCenter from './components/RepairCenter';
import AccountingSubTab from './components/AccountingSubTab';
import HRSubTab from './components/HRSubTab';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './components/AuthGate';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  const auth = useAuth();
  // THEME MODE (UI only — persisted to localStorage, defaults to dark)
  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('akk-theme') === 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLightMode);
    localStorage.setItem('akk-theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  // CORE STATE
  const [activeTab, setActiveTab] = useState<TabType>('pos');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('inventory');
  const [activeBranchId, setActiveBranchId] = useState<BranchId>('b-yangon');

  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<PhoneProduct[]>([]);
  const [inventories, setInventories] = useState<JoinedInventory[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [sales, setSales] = useState<PosSale[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [repairsList, setRepairsList] = useState<RepairTicket[]>([]);
  const [vtuList, setVtuList] = useState<VtuTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // DATA LOADING STATES
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isLoadingSales, setIsLoadingSales] = useState(true);

  // CURRENT CASHIER PROFILE
  const [cashierName, setCashierName] = useState('U Nay Win (Cashier)');

  // POS CART & CUSTOMER LINK STATE
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posBrandFilter, setPosBrandFilter] = useState('All');
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // POS CUSTOMER CREATION
  const [isAddingPosCustomer, setIsAddingPosCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  // POS PAYMENT & COMPLETED INVOICE
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [posCheckoutSuccessReceipt, setPosCheckoutSuccessReceipt] = useState<PosSale | null>(null);

  // MANUALLY RECORDED CHARGE
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  // STOCK TRANSFERS
  const [selectedTransferProduct, setSelectedTransferProduct] = useState('');
  const [transferFromBranch, setTransferFromBranch] = useState<BranchId>('b-yangon');
  const [transferToBranch, setTransferToBranch] = useState<BranchId>('b-mandalay');
  const [transferQty, setTransferQty] = useState('2');
  const [transferLoading, setTransferLoading] = useState(false);

  // EDIT ALERT THRESHOLDS
  const [editingThresholdKey, setEditingThresholdKey] = useState<string | null>(null);
  const [editingThresholdVal, setEditingThresholdVal] = useState('3');

  // CUSTOMER CRM CONTROLS
  const [crmSearch, setCrmSearch] = useState('');
  const [crmNewName, setCrmNewName] = useState('');
  const [crmNewPhone, setCrmNewPhone] = useState('');
  const [crmNewEmail, setCrmNewEmail] = useState('');
  const [crmNewTier, setCrmNewTier] = useState<'Bronze' | 'Silver' | 'Gold'>('Bronze');
  const [crmSuccessMsg, setCrmSuccessMsg] = useState(false);

  // E-LOAD/VTU ELECTRONIC TOP-UP
  const [vtuPhone, setVtuPhone] = useState('');
  const [vtuAmount, setVtuAmount] = useState('5000');
  const [vtuOperator, setVtuOperator] = useState<'MPT' | 'Atom' | 'Ooredoo' | 'Mytel'>('MPT');
  const [vtuType, setVtuType] = useState<'airtime' | 'data'>('airtime');
  const [vtuLoading, setVtuLoading] = useState(false);

  // RECORD EXPENSES FORM STATE
  const [expCategory, setExpCategory] = useState<'Rent' | 'Salary' | 'Utilities' | 'Marketing' | 'Repair Parts' | 'Other'>('Utilities');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expLoading, setExpLoading] = useState(false);

  // BROADCAST CAMPAIGN STATE
  const [campaignTier, setCampaignTier] = useState<'All' | 'Bronze' | 'Silver' | 'Gold' | 'VIP'>('All');
  const [campaignChannel, setCampaignChannel] = useState<'Telegram' | 'SMS'>('Telegram');
  const [campaignMessage, setCampaignMessage] = useState('AKK Mobile VIP Promo! Get 15% off on Display screen panel repairs this week at our Yangon Kaba Aye Service Lab!');
  const [campaignSuccess, setCampaignSuccess] = useState(false);

  // CHAT ASSISTANT STATE
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Mingalaba! Welcome to **AKK Mobile Enterprise Brain** (Myanmar AI BI Director). I am synced with our multi-branch databases, general GAAP financial ledger, and repair diagnostics center. Ask me to:\n\n* Compare retail revenue against operating expenses across Yangon and Mandalay.\n* Propose a smart stock transfer from Yangon HQ to Naypyitaw to resolve low stock alerts.\n* Draft a custom Telegram broadcast announcement for our Gold loyalty tier members.",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // INITIAL LOAD
  useEffect(() => {
    fetchBranches();
    fetchProducts();
    fetchInventory();
    fetchTransfers();
    fetchSales();
    fetchCustomers();
    fetchRepairs();
    fetchVtu();
    fetchExpenses();
    fetchOnlineOrders();
    fetchNotifications();
  }, []);

  // CORE API RETRIEVALS
  const fetchBranches = async () => {
    setIsLoadingBranches(true);
    try {
      const res = await fetch('/api/branches');
      if (res.ok) setBranches(await res.json());
    } catch (e) { console.error('Branches fetch error', e); }
    finally { setIsLoadingBranches(false); }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
    } catch (e) { console.error('Products fetch error', e); }
    finally { setIsLoadingProducts(false); }
  };

  const fetchInventory = async () => {
    setIsLoadingInventory(true);
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) setInventories(await res.json());
    } catch (e) { console.error('Inventory fetch error', e); }
    finally { setIsLoadingInventory(false); }
  };

  const fetchTransfers = async () => {
    try {
      const res = await fetch('/api/transfers');
      if (res.ok) setTransfers(await res.json());
    } catch (e) { console.error('Transfers fetch error', e); }
  };

  const fetchSales = async () => {
    setIsLoadingSales(true);
    try {
      const res = await fetch('/api/sales');
      if (res.ok) setSales(await res.json());
    } catch (e) { console.error('Sales fetch error', e); }
    finally { setIsLoadingSales(false); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) setCustomersList(await res.json());
    } catch (e) { console.error('Customers fetch error', e); }
  };

  const fetchRepairs = async () => {
    try {
      const res = await fetch('/api/repairs');
      if (res.ok) setRepairsList(await res.json());
    } catch (e) { console.error('Repairs fetch error', e); }
  };

  const fetchVtu = async () => {
    try {
      const res = await fetch('/api/vtu');
      if (res.ok) setVtuList(await res.json());
    } catch (e) { console.error('VTU fetch error', e); }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) setExpenses(await res.json());
    } catch (e) { console.error('Expenses fetch error', e); }
  };

  const fetchOnlineOrders = async () => {
    try {
      const res = await fetch('/api/online-orders');
      if (res.ok) setOnlineOrders(await res.json());
    } catch (e) { console.error('Online orders fetch error', e); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) setNotifications(await res.json());
    } catch (e) { console.error('Notifications fetch error', e); }
  };

  // ==========================================
  // CARTS & TRANSACTIONS
  // ==========================================
  const activeBranchStock = inventories.filter(i => i.branchId === activeBranchId);

  const getStockInActiveBranch = (prodId: string) => {
    const matched = activeBranchStock.find(i => i.productId === prodId);
    return matched ? matched.stock : 0;
  };

  const addToCart = (product: PhoneProduct, color: string) => {
    const limitStock = getStockInActiveBranch(product.id);
    const existing = posCart.find(i => i.productId === product.id && i.color === color);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty >= limitStock) {
      alert(`⚠️ Selected branch only has ${limitStock} units in stock. Cannot allocate more.`);
      return;
    }

    if (existing) {
      setPosCart(posCart.map(i =>
        (i.productId === product.id && i.color === color) ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setPosCart([...posCart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        color,
        quantity: 1
      }]);
    }
  };

  const addCustomItemToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName || !customItemPrice) return;
    const priceVal = parseFloat(customItemPrice);
    if (isNaN(priceVal)) return;

    setPosCart([...posCart, {
      productId: `custom-${Math.floor(Math.random() * 1000)}`,
      name: customItemName,
      price: priceVal,
      color: 'Standard',
      quantity: 1,
      isCustom: true
    }]);

    setCustomItemName('');
    setCustomItemPrice('');
  };

  const updateCartQty = (prodId: string, color: string, delta: number) => {
    const item = posCart.find(i => i.productId === prodId && i.color === color);
    if (!item) return;

    const nextQty = item.quantity + delta;
    if (nextQty <= 0) {
      setPosCart(posCart.filter(i => !(i.productId === prodId && i.color === color)));
      return;
    }

    if (!item.isCustom) {
      const maxStock = getStockInActiveBranch(prodId);
      if (delta > 0 && item.quantity >= maxStock) {
        alert(`⚠️ Limited Warehouse allocation! Max ${maxStock} units of this device can be sold.`);
        return;
      }
    }

    setPosCart(posCart.map(i =>
      (i.productId === prodId && i.color === color) ? { ...i, quantity: nextQty } : i
    ));
  };

  const getSubtotal = () => posCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getTax = () => Math.round(getSubtotal() * 0.05); // 5% Commercial Tax
  const getTotal = () => getSubtotal() + getTax();

  const selectedCustomerObj = customersList.find(c => c.id === selectedCustomerId);

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) return;

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomerName,
          phone: newCustomerPhone,
          email: newCustomerEmail || undefined
        })
      });

      if (res.ok) {
        const added = await res.json();
        setCustomersList([...customersList, added]);
        setSelectedCustomerId(added.id);
        setIsAddingPosCustomer(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerEmail('');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (posCart.length === 0) return;

    const payload = {
      branchId: activeBranchId,
      customerName: selectedCustomerObj?.name || 'Walk-In Customer',
      customerPhone: selectedCustomerObj?.phone || 'N/A',
      customerEmail: selectedCustomerObj?.email || undefined,
      items: posCart,
      paymentMethod,
      cashierName
    };

    try {
      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const trsf = await res.json();
        setPosCheckoutSuccessReceipt(trsf);
        setPosCart([]);
        setSelectedCustomerId('');
        fetchInventory();
        fetchSales();
        fetchCustomers();
        fetchExpenses();
      } else {
        const err = await res.json();
        alert(`POS Checkout Blocked: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // ERP SYSTEMS & STOCK TRANSFERS
  // ==========================================
  const handleRequestTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransferProduct || !transferQty) return;
    const qty = parseInt(transferQty);
    if (isNaN(qty) || qty <= 0) return;

    if (transferFromBranch === transferToBranch) {
      alert('⚠️ Source and destination branches must be distinct.');
      return;
    }

    setTransferLoading(true);
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedTransferProduct,
          fromBranchId: transferFromBranch,
          toBranchId: transferToBranch,
          quantity: qty,
          requestedBy: cashierName
        })
      });

      if (res.ok) {
        setSelectedTransferProduct('');
        fetchTransfers();
        alert('📦 Inter-Branch Transfer request registered as PENDING.');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) { console.error(e); }
    finally { setTransferLoading(false); }
  };

  const handleProcessTransferStatus = async (id: string, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'pending') nextStatus = 'shipped';
    else if (currentStatus === 'shipped') nextStatus = 'delivered';
    if (!nextStatus) return;

    try {
      const res = await fetch(`/api/transfers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        fetchTransfers();
        fetchInventory();
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateThreshold = async (branchId: BranchId, productId: string, limit: number) => {
    try {
      const res = await fetch('/api/inventory/threshold', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId, productId, threshold: limit })
      });
      if (res.ok) {
        fetchInventory();
        setEditingThresholdKey(null);
      }
    } catch (e) { console.error(e); }
  };

  // ==========================================
  // EXPENSES BOOKING
  // ==========================================
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount) return;

    setExpLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: activeBranchId,
          category: expCategory,
          amount: parseFloat(expAmount),
          description: expDesc
        })
      });

      if (res.ok) {
        setExpAmount('');
        setExpDesc('');
        fetchExpenses();
        fetchSales();
        alert('💸 Cash expense successfully recorded in ledger.');
      }
    } catch (e) { console.error(e); }
    finally { setExpLoading(false); }
  };

  // ==========================================
  // E-LOAD / VTU RECHARGE
  // ==========================================
  const handleVtuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vtuPhone || !vtuAmount) return;

    setVtuLoading(true);
    try {
      const res = await fetch('/api/vtu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: vtuType,
          operator: vtuOperator,
          phoneNumber: vtuPhone,
          amount: parseFloat(vtuAmount),
          branchId: activeBranchId
        })
      });

      if (res.ok) {
        setVtuPhone('');
        fetchVtu();
        alert(`⚡ ${vtuOperator} Top-up successful! Load dispatched immediately.`);
      }
    } catch (e) { console.error(e); }
    finally { setVtuLoading(false); }
  };

  // ==========================================
  // BROADCAST CAMPAIGNS (CRM)
  // ==========================================
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignMessage.trim()) return;

    // Filter recipients based on loyalty tier
    const recipients = customersList.filter(c => campaignTier === 'All' || c.tier === campaignTier);
    if (recipients.length === 0) {
      alert('⚠️ No registered customers match the selected tier.');
      return;
    }

    try {
      // Post a broadcast for each matching customer
      for (const c of recipients) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: campaignChannel,
            recipient: campaignChannel === 'Telegram' ? (c.telegram || `@${c.name.toLowerCase().replace(/\s+/g, '')}`) : c.phone,
            message: campaignMessage
          })
        });
      }

      setCampaignSuccess(true);
      fetchNotifications();
      setTimeout(() => setCampaignSuccess(false), 5000);
    } catch (e) { console.error(e); }
  };

  // ==========================================
  // E-COMMERCE ONLINE ORDERS INCOMING
  // ==========================================
  const handleFulfillOnlineOrder = async (orderId: string, status: 'accepted' | 'shipped' | 'completed' | 'cancelled') => {
    try {
      const res = await fetch(`/api/online-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOnlineOrders();
        fetchInventory();
      }
    } catch (e) { console.error(e); }
  };

  // ==========================================
  // GEMINI AI INTEGRATION
  // ==========================================
  const handleSendAiMessage = async (msgText?: string) => {
    const query = msgText || userInput;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!msgText) setUserInput('');
    setAiTyping(true);

    const history = chatMessages.slice(-8).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          chatHistory: history
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'assistant',
            text: data.text,
            timestamp: new Date()
          }
        ]);
      }
    } catch (e) {
      console.error(e);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: 'System link failed. Please check network integrity and retry.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setAiTyping(false);
    }
  };

  // CALCULATE REVENUE & STATS (MMK)
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalVat = sales.reduce((sum, s) => sum + s.taxAmount, 0);
  const totalCost = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalCost;

  const lowStockCount = inventories.filter(i => i.stock <= i.minAlertThreshold).length;

  const getBranchSalesData = () => {
    const sums: Record<string, number> = { 'b-yangon': 0, 'b-mandalay': 0, 'b-naypyitaw': 0 };
    sales.forEach(s => {
      if (sums[s.branchId] !== undefined) {
        sums[s.branchId] += s.totalAmount;
      }
    });

    return [
      { name: 'Yangon HQ', Sales: sums['b-yangon'] },
      { name: 'Mandalay', Sales: sums['b-mandalay'] },
      { name: 'Naypyitaw', Sales: sums['b-naypyitaw'] }
    ];
  };

  const getProductPopularityData = () => {
    const counts: Record<string, number> = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.quantity;
      });
    });

    const colors = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899'];
    return Object.keys(counts).map((key, idx) => ({
      name: key,
      value: counts[key],
      color: colors[idx % colors.length]
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-primary relative overflow-x-hidden" id="akk-enterprise-app">
      {/* Background decoration - AKK Theme */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      {/* HEADER BAR - ENTERPRISE GLASS */}
      <header className="border-b border-border glass-card sticky top-0 z-40 px-4 sm:px-6 py-3 sm:py-4 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-primary via-accent to-success rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary via-accent to-success rounded-2xl blur group-hover:opacity-60 opacity-0 transition-opacity duration-300" />
            <Building2 className="w-6 h-6 text-white stroke-[2.5] relative z-10" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="font-display font-black text-xl sm:text-2xl tracking-tight brand-gradient-text">
                AKK MOBILE
              </h1>
              <span className="bg-primary/10 text-primary text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-primary/30 shadow-[0_0_15px_rgba(79,142,247,0.2)]">
                ENTERPRISE SUITE
              </span>
            </div>
            <p className="text-[10px] text-muted font-mono tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1 h-1 rounded-full bg-primary" />
              Yangon • Mandalay • Naypyitaw Cloud POS, Repair Lab & GAAP Accounts
            </p>
          </div>
        </div>

        {/* OPERATIONS CONTEXT - AKK THEME */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2.5 bg-card/50 border border-primary/30 px-4 py-2 rounded-xl focus-within:border-primary/60 transition-all duration-300">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-mono text-subtle mr-1 font-extrabold uppercase tracking-wider">POS Loc:</span>
            <select
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value as BranchId)}
              className="bg-transparent text-xs text-foreground outline-none font-extrabold font-mono cursor-pointer pr-1"
              id="branch-selector"
            >
              <option value="b-yangon" className="bg-surface text-foreground">Yangon HQ (Kaba Aye)</option>
              <option value="b-mandalay" className="bg-surface text-foreground">Mandalay (73rd St)</option>
              <option value="b-naypyitaw" className="bg-surface text-foreground">Naypyitaw Store</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center space-x-2.5 bg-card/30 border border-primary/20 px-4 py-2 rounded-xl text-xs font-mono focus-within:border-primary/50 transition-all duration-300">
            <User className="w-3.5 h-3.5 text-primary" />
            <span className="text-subtle uppercase tracking-wider text-[10px] font-bold">Cashier:</span>
            <input
              type="text"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              className="bg-transparent border-none text-foreground font-extrabold outline-none w-36 text-xs"
            />
          </div>

          <div className="hidden md:flex items-center space-x-1.5 bg-success/10 text-success border border-success/30 px-3.5 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping mr-1" />
            <span>CLOUD SYNCED</span>
          </div>

          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-muted hover:text-primary hover:border-primary/50 transition-all duration-300"
            aria-label={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
            title={isLightMode ? 'Dark mode' : 'Light mode'}
          >
            {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={() => auth.signOut()}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-muted hover:text-danger hover:border-danger/50 transition-all duration-300"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* WORKSPACE LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 gap-6 relative z-10" id="workspace-layout">
        
        {/* SIDEBAR NAVIGATION - ENTERPRISE GLASS */}
        <aside className="lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 p-2 glass-card rounded-2xl overflow-x-auto lg:overflow-x-visible">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-3.5 px-4.5 py-3.5 text-xs font-bold font-mono rounded-xl transition-all duration-300 border ${
              activeTab === 'pos'
                ? 'bg-gradient-to-r from-success/15 via-success/5 to-transparent text-success border-success/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                : 'text-subtle hover:text-muted border-transparent hover:bg-card/30'
            }`}
          >
            <ShoppingCart className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'pos' ? 'scale-110 text-success' : 'text-subtle'}`} />
            <span className="hidden sm:inline uppercase tracking-wider">POS CHECKOUT</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('erp');
              setActiveSubTab('inventory');
            }}
            className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-3.5 px-4.5 py-3.5 text-xs font-bold font-mono rounded-xl transition-all duration-300 border ${
              activeTab === 'erp'
                ? 'bg-gradient-to-r from-primary/15 via-accent/5 to-transparent text-primary border-primary/30 shadow-[0_0_20px_rgba(79,142,247,0.1)]'
                : 'text-subtle hover:text-muted border-transparent hover:bg-card/30'
            }`}
          >
            <Layers className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'erp' ? 'scale-110 text-primary' : 'text-subtle'}`} />
            <span className="hidden sm:inline uppercase tracking-wider">WAREHOUSE ERP</span>
          </button>

          <button
            onClick={() => setActiveTab('crm')}
            className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-3.5 px-4.5 py-3.5 text-xs font-bold font-mono rounded-xl transition-all duration-300 border ${
              activeTab === 'crm'
                ? 'bg-gradient-to-r from-primary/15 via-primary/5 to-transparent text-primary border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.05)]'
                : 'text-subtle hover:text-muted border-transparent hover:bg-card/30'
            }`}
          >
            <Wrench className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'crm' ? 'scale-110 text-primary' : 'text-subtle'}`} />
            <span className="hidden sm:inline uppercase tracking-wider">REPAIR & CRM</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-3.5 px-4.5 py-3.5 text-xs font-bold font-mono rounded-xl transition-all duration-300 border ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-pink-500/15 via-pink-500/5 to-transparent text-pink-400 border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.05)]'
                : 'text-subtle hover:text-muted border-transparent hover:bg-card/30'
            }`}
          >
            <Sparkles className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'ai' ? 'scale-110 text-pink-400' : 'text-subtle'}`} />
            <span className="hidden sm:inline uppercase tracking-wider">AI INSIGHTS</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-3.5 px-4.5 py-3.5 text-xs font-bold font-mono rounded-xl transition-all duration-300 border ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-purple-500/15 via-purple-500/5 to-transparent text-purple-400 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.05)]'
                : 'text-subtle hover:text-muted border-transparent hover:bg-card/30'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 transition-transform duration-300 ${activeTab === 'admin' ? 'scale-110 text-purple-400' : 'text-subtle'}`} />
            <span className="hidden sm:inline uppercase tracking-wider">ADMIN PANEL</span>
          </button>

          {/* Quick Stats Sidebar */}
          <div className="hidden lg:block mt-6 border-t border-border/80 pt-5 px-3 space-y-3 font-mono text-[11px] text-subtle">
            <span className="text-[10px] text-subtle font-bold uppercase tracking-wider block">Active POS Stats</span>
            <div className="space-y-2 bg-surface/40 border border-border p-4 rounded-xl shadow-inner">
              <div className="flex justify-between items-center">
                <span>Branch Stock:</span>
                {isLoadingInventory ? (
                  <div className="h-3.5 w-14 bg-elevated rounded animate-pulse" />
                ) : (
                  <strong className="text-foreground font-bold">
                    {activeBranchStock.reduce((sum, item) => sum + item.stock, 0)} Units
                  </strong>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span>POS Tickets:</span>
                {isLoadingSales ? (
                  <div className="h-3.5 w-10 bg-elevated rounded animate-pulse" />
                ) : (
                  <strong className="text-foreground font-bold">
                    {sales.filter(s => s.branchId === activeBranchId).length} items
                  </strong>
                )}
              </div>
              <div className="flex justify-between items-center border-t border-border/80 pt-2 mt-2">
                <span>Alert Flags:</span>
                {isLoadingInventory ? (
                  <div className="h-3.5 w-16 bg-elevated rounded animate-pulse" />
                ) : (
                  <strong className={`font-bold ${lowStockCount > 0 ? 'text-rose-400 animate-pulse' : 'text-subtle'}`}>
                    {lowStockCount} critical
                  </strong>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* PRIMARY SWITCHBOARD VIEW */}
        <section className="flex-1 min-w-0">
          
          {/* ==========================================
              TAB 1: POINT OF SALE (POS)
             ========================================== */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in animate-duration-300" id="pos-view">
              {/* Left Catalog column */}
              <div className="xl:col-span-7 space-y-6">
                <div className="bg-card/40 backdrop-blur-md border border-border/90 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 bg-surface border border-border/80 px-3.5 py-2.5 rounded-xl shrink-0 focus-within:border-success/30 transition-all duration-300">
                      <span className="text-[10px] text-subtle uppercase font-black font-mono tracking-wider">Brand:</span>
                      <select
                        value={posBrandFilter}
                        onChange={(e) => setPosBrandFilter(e.target.value)}
                        className="bg-transparent text-xs text-muted outline-none font-bold font-mono cursor-pointer pr-1"
                      >
                        <option value="All" className="bg-surface text-muted">All Brands</option>
                        <option value="Apple" className="bg-surface text-muted">Apple</option>
                        <option value="Samsung" className="bg-surface text-muted">Samsung</option>
                        <option value="Google" className="bg-surface text-muted">Google</option>
                        <option value="OnePlus" className="bg-surface text-muted">OnePlus</option>
                        <option value="Xiaomi" className="bg-surface text-muted">Xiaomi</option>
                      </select>
                    </div>

                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-subtle absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        placeholder="Search model specifications..."
                        value={posSearchQuery}
                        onChange={(e) => setPosSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-border/80 rounded-xl pl-10 pr-4 py-3 text-xs text-muted outline-none font-mono focus:border-success/40 focus:ring-4 focus:ring-emerald-500/5 placeholder-slate-600 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Custom billable Form */}
                  <form onSubmit={addCustomItemToCart} className="flex flex-col sm:flex-row items-stretch gap-3 pt-3 border-t border-border/60">
                    <div className="flex-1 flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-subtle shrink-0" />
                      <input
                        type="text"
                        placeholder="Custom charge (e.g. Screen Guard, VTU topup)"
                        value={customItemName}
                        onChange={(e) => setCustomItemName(e.target.value)}
                        className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2.5 text-xs text-muted outline-none font-mono focus:border-primary/40 focus:ring-4 focus:ring-sky-500/5 placeholder-slate-600 transition-all duration-300"
                      />
                    </div>
                    <div className="flex items-center space-x-2.5 w-full sm:w-60 shrink-0">
                      <input
                        type="number"
                        placeholder="Price (MMK)"
                        value={customItemPrice}
                        onChange={(e) => setCustomItemPrice(e.target.value)}
                        className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2.5 text-xs text-muted outline-none font-mono focus:border-primary/40 focus:ring-4 focus:ring-sky-500/5 placeholder-slate-600 transition-all duration-300"
                      />
                      <button
                        type="submit"
                        className="bg-elevated hover:bg-elevated text-muted font-extrabold px-4 py-2.5 rounded-xl text-xs font-mono border border-border/60 shrink-0 transition-all active:scale-95 shadow-md"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </form>
                </div>

                {/* Hardware Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLoadingProducts ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <div
                        key={`sku-skeleton-${idx}`}
                        className="bg-card/20 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-44 animate-pulse"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <div className="h-3 w-14 bg-elevated rounded-md" />
                            <div className="h-5 w-20 bg-elevated rounded-md" />
                          </div>
                          <div className="h-4 w-3/4 bg-elevated rounded-md mb-2" />
                          <div className="h-3 w-1/2 bg-elevated rounded-md mb-4" />
                          <div className="flex items-baseline space-x-2 mt-2">
                            <div className="h-4 w-24 bg-elevated rounded-md" />
                            <div className="h-3 w-12 bg-elevated rounded-md" />
                          </div>
                        </div>
                        <div className="border-t border-border/40 pt-3 mt-4 flex items-center justify-between">
                          <div className="h-3 w-16 bg-elevated rounded-md" />
                          <div className="flex space-x-1.5">
                            <div className="h-5.5 w-12 bg-elevated rounded" />
                            <div className="h-5.5 w-12 bg-elevated rounded" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    products
                      .filter(p => posBrandFilter === 'All' || p.brand === posBrandFilter)
                      .filter(p => p.name.toLowerCase().includes(posSearchQuery.toLowerCase()))
                      .map(p => {
                        const stockVal = getStockInActiveBranch(p.id);
                        const isLow = stockVal <= 3;

                        return (
                          <div
                            key={p.id}
                            className="bg-card/20 backdrop-blur-sm border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-border hover:bg-card/30 transition-all duration-300 group relative overflow-hidden shadow-lg hover:shadow-2xl"
                            id={`pos-item-${p.id}`}
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-success/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div>
                              <div className="flex justify-between items-center mb-2.5">
                                <span className="text-[10px] text-success font-mono font-black uppercase tracking-wider bg-success/5 border border-success/10 px-2 py-0.5 rounded-md">
                                  {p.brand}
                                </span>
                                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${
                                  stockVal === 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                  isLow ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                                  'bg-surface text-subtle border-border/80'
                                }`}>
                                  {stockVal === 0 ? 'Out of stock' : `${stockVal} Available`}
                                </span>
                              </div>

                              <h4 className="font-display font-bold text-sm text-foreground group-hover:text-emerald-300 transition-colors duration-300">
                                {p.name}
                              </h4>
                              <p className="text-[10px] text-subtle font-mono mt-1 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-elevated" />
                                {p.specs.storage} • {p.specs.ram} RAM
                              </p>

                              <div className="flex items-baseline space-x-2 mt-3 font-mono">
                                <span className="text-sm font-black text-white">
                                  {p.price.toLocaleString()} MMK
                                </span>
                                <span className="text-[10px] text-subtle line-through">
                                  {p.originalPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-border/60 pt-3 mt-4 flex items-center justify-between gap-1.5">
                              <span className="text-[10px] text-subtle font-mono font-bold uppercase tracking-wider">Select Color:</span>
                              <div className="flex items-center space-x-1.5">
                                {p.colors.map((col, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => addToCart(p, col)}
                                    disabled={stockVal === 0}
                                    className="text-[9px] bg-surface hover:bg-card disabled:opacity-30 border border-border hover:border-success/40 text-muted font-mono px-2 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                                  >
                                    {col.split(' ')[0]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Right cart column */}
              <div className="xl:col-span-5 bg-card/20 backdrop-blur-md border border-border rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-display font-black text-xs text-muted uppercase tracking-wider flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4 text-success" />
                      <span>Ticket Cart Entry</span>
                    </h3>
                    <span className="text-[10px] bg-success/10 text-success border border-success/20 px-2.5 py-0.5 rounded-full font-mono font-bold shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                      {posCart.reduce((sum, item) => sum + item.quantity, 0)} Items
                    </span>
                  </div>

                  {/* Customer link */}
                  <div className="bg-surface/60 border border-border/80 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-subtle font-mono font-black uppercase tracking-wider flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>CRM Customer Loyalty Link</span>
                      </span>
                      <button
                        onClick={() => setIsAddingPosCustomer(!isAddingPosCustomer)}
                        className="text-[10px] text-success hover:text-emerald-300 font-extrabold font-mono flex items-center space-x-0.5 transition"
                      >
                        {isAddingPosCustomer ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{isAddingPosCustomer ? 'Cancel' : 'Quick Create'}</span>
                      </button>
                    </div>

                    {!isAddingPosCustomer ? (
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full bg-card/60 border border-border rounded-xl p-2.5 text-xs text-muted outline-none font-mono cursor-pointer focus:border-primary/30 transition"
                      >
                        <option value="" className="bg-surface">Walk-In Guest Billing (No loyalty points accrued)</option>
                        {customersList.map(c => (
                          <option key={c.id} value={c.id} className="bg-surface text-muted">
                            {c.name} ({c.phone}) - [{c.tier} Tier, {c.loyaltyPoints} pts]
                          </option>
                        ))}
                      </select>
                    ) : (
                      <form onSubmit={handleQuickAddCustomer} className="space-y-3.5 text-xs font-mono pt-1">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                          className="w-full bg-card/60 border border-border rounded-xl px-3 py-2.5 text-xs text-muted outline-none focus:border-primary/40 transition"
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="tel"
                            placeholder="Phone (e.g. 09...)"
                            value={newCustomerPhone}
                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                            className="w-full bg-card/60 border border-border rounded-xl px-3 py-2.5 text-xs text-muted outline-none focus:border-primary/40 transition"
                            required
                          />
                          <input
                            type="email"
                            placeholder="Email address"
                            value={newCustomerEmail}
                            onChange={(e) => setNewCustomerEmail(e.target.value)}
                            className="w-full bg-card/60 border border-border rounded-xl px-3 py-2.5 text-xs text-muted outline-none focus:border-primary/40 transition"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-primary-strong hover:brightness-110 text-white font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-[0.98] shadow-md shadow-accent/5"
                        >
                          Confirm & Bind to Invoice
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Cart rows */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {posCart.length > 0 ? (
                      posCart.map((item, idx) => (
                        <div key={idx} className="bg-surface/40 border border-border p-3 rounded-xl flex items-center justify-between gap-3 font-mono text-xs">
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-muted truncate">{item.name}</h5>
                            <span className="text-[10px] text-subtle block mt-0.5">
                              Color: {item.color} • Unit: {item.price.toLocaleString()} MMK
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQty(item.productId, item.color, -1)}
                              className="p-1 bg-card border border-border rounded hover:bg-elevated text-subtle transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-muted min-w-[12px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQty(item.productId, item.color, 1)}
                              className="p-1 bg-card border border-border rounded hover:bg-elevated text-subtle transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setPosCart(posCart.filter(i => !(i.productId === item.productId && i.color === item.color)))}
                              className="text-subtle hover:text-rose-400 transition pl-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-bold text-muted shrink-0">
                            {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-14 text-center text-subtle space-y-2">
                        <ShoppingCart className="w-8 h-8 mx-auto text-subtle" />
                        <p className="text-xs font-mono">Terminal cart is empty. Click model color options to bill items.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtotal, Wallets */}
                {posCart.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border/80">
                    <div className="space-y-2 font-mono text-[11px] text-subtle">
                      <div className="flex justify-between">
                        <span>POS Sales Subtotal:</span>
                        <span className="text-muted font-bold">{getSubtotal().toLocaleString()} MMK</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commercial Tax (5%):</span>
                        <span className="text-muted font-bold">{getTax().toLocaleString()} MMK</span>
                      </div>
                      <div className="flex justify-between border-t border-border/60 pt-2.5 text-xs">
                        <span className="text-muted font-bold uppercase tracking-wider">TOTAL DUE:</span>
                        <strong className="text-success font-black text-sm">{getTotal().toLocaleString()} MMK</strong>
                      </div>
                    </div>

                    {/* Myanmar Wallets */}
                    <div className="space-y-2">
                      <label className="block text-[10px] text-subtle font-mono font-black uppercase tracking-wider">Myanmar Payment Gateways</label>
                      <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                        {[
                          { key: 'cash', label: 'CASH (Kyats)' },
                          { key: 'kbzpay', label: 'KBZPay Wallet' },
                          { key: 'wavepay', label: 'WavePay' },
                          { key: 'ayapay', label: 'AYAPay Wallet' },
                          { key: 'cbpay', label: 'CBPay' },
                          { key: 'credit', label: 'STORE CREDIT' }
                        ].map(pm => (
                          <button
                            key={pm.key}
                            type="button"
                            onClick={() => setPaymentMethod(pm.key as PaymentMethod)}
                            className={`py-2 px-1 text-center border rounded-lg font-extrabold transition-all duration-200 hover:scale-[1.02] ${
                              paymentMethod === pm.key
                                ? 'bg-success/10 border-success text-success shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                : 'bg-surface border-border text-subtle hover:text-muted hover:border-border'
                            }`}
                          >
                            {pm.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleCheckoutSubmit}
                      className="w-full bg-gradient-to-r from-success to-emerald-600 hover:from-emerald-400 hover:to-success text-white font-black text-xs py-4 rounded-xl transition-all duration-300 active:scale-[0.99] shadow-lg shadow-emerald-500/10 flex items-center justify-center space-x-1.5 uppercase tracking-wider"
                    >
                      <CreditCard className="w-4 h-4 stroke-[2.5]" />
                      <span>DISPENSE ORDER & INVOICE</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Receipt printing modal */}
              {posCheckoutSuccessReceipt && (
                <ReceiptModal
                  sale={posCheckoutSuccessReceipt}
                  branches={branches}
                  onClose={() => setPosCheckoutSuccessReceipt(null)}
                  className="animate-slide-down"
                />
              )}
            </div>
          )}

          {/* ==========================================
              TAB 2: ERP WAREHOUSE HUB
             ========================================== */}
          {activeTab === 'erp' && (
            <div className="space-y-6 animate-fade-in" id="erp-view">
              
              {/* INNER SUB-TABS */}
              <div className="flex items-center space-x-1.5 bg-card/40 p-1 rounded-xl border border-border w-full overflow-x-auto">
                {[
                  { key: 'inventory', label: 'Branch Inventory', icon: Layers3 },
                  { key: 'transfers', label: 'Stock Transfers', icon: ArrowLeftRight },
                  { key: 'finance', label: 'Financial Ledger', icon: TrendingUp },
                  { key: 'expenses', label: 'Cash Expenses', icon: Sliders },
                  { key: 'hr', label: 'HR & Commissions', icon: CalendarDays },
                  { key: 'online_orders', label: 'Online Storefront', icon: Building2 }
                ].map(tab => {
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveSubTab(tab.key as SubTabType)}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold font-mono rounded-lg transition-all whitespace-nowrap ${
                        activeSubTab === tab.key
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-subtle hover:text-muted'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SUBTAB A: INVENTORY LEVELS */}
              {activeSubTab === 'inventory' && (
                <div className="space-y-6">
                  {lowStockCount > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <p className="text-muted font-bold">ERP Core alert: {lowStockCount} stock items have breached safe limits!</p>
                          <p className="text-subtle text-[10px] mt-0.5">Recommend inter-branch dispatch balancing from Yangon HQ immediately.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-card/20 border border-border rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-bold text-sm text-foreground font-mono uppercase tracking-wider">Multi-Branch Telemetry Log</h4>
                      <span className="text-[10px] bg-surface border border-border text-subtle px-3 py-1 rounded font-mono font-bold">
                        {inventories.length} SKUs Monitored
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="bg-surface text-subtle text-[10px] border-b border-border">
                            <th className="px-5 py-3 font-extrabold">BRANCH LOCATION</th>
                            <th className="px-5 py-3 font-extrabold">HANDSET CATALOG</th>
                            <th className="px-5 py-3 font-extrabold">RETAIL VALUE</th>
                            <th className="px-5 py-3 font-extrabold">CURRENT STOCK</th>
                            <th className="px-5 py-3 font-extrabold text-center">ALERT LIMIT</th>
                            <th className="px-5 py-3 font-extrabold text-right">METRIC STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {isLoadingInventory ? (
                            Array.from({ length: 6 }).map((_, idx) => (
                              <tr key={`inv-skeleton-${idx}`} className="animate-pulse border-b border-border/40">
                                <td className="px-5 py-4">
                                  <div className="h-3.5 w-28 bg-elevated rounded-md" />
                                </td>
                                <td className="px-5 py-4">
                                  <div className="h-3.5 w-40 bg-elevated rounded-md mb-1.5" />
                                  <div className="h-2.5 w-20 bg-elevated rounded-md" />
                                </td>
                                <td className="px-5 py-4">
                                  <div className="h-3.5 w-24 bg-elevated rounded-md" />
                                </td>
                                <td className="px-5 py-4">
                                  <div className="h-3.5 w-16 bg-elevated rounded-md" />
                                </td>
                                <td className="px-5 py-4">
                                  <div className="h-3.5 w-24 bg-elevated rounded-md mx-auto" />
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <div className="h-5 w-20 bg-elevated rounded-md inline-block" />
                                </td>
                              </tr>
                            ))
                          ) : (
                            inventories.map((item, idx) => {
                              const isLow = item.stock <= item.minAlertThreshold;
                              const isCriticalEmpty = item.stock === 0;

                              return (
                                <tr key={idx} className="hover:bg-card/10 transition-colors">
                                  <td className="px-5 py-3.5 font-bold text-muted">
                                    {item.branchName}
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <div className="font-bold text-white">{item.productName}</div>
                                    <div className="text-[10px] text-subtle font-medium">{item.productBrand}</div>
                                  </td>
                                  <td className="px-5 py-3.5 font-bold text-success">
                                    {item.productPrice.toLocaleString()} MMK
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span className={`font-bold text-sm ${isCriticalEmpty ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-foreground'}`}>
                                      {item.stock} Units
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    {editingThresholdKey === `${item.branchId}-${item.productId}` ? (
                                      <div className="flex items-center justify-center space-x-1.5">
                                        <input
                                          type="number"
                                          value={editingThresholdVal}
                                          onChange={(e) => setEditingThresholdVal(e.target.value)}
                                          className="bg-surface border border-border text-center rounded w-12 text-xs py-0.5 text-muted font-bold outline-none"
                                          min="1"
                                        />
                                        <button
                                          onClick={() => handleUpdateThreshold(item.branchId, item.productId, parseInt(editingThresholdVal))}
                                          className="bg-success text-white p-1 rounded"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center space-x-1.5">
                                        <span>Alert limit: <strong>{item.minAlertThreshold}</strong></span>
                                        <button
                                          onClick={() => {
                                            setEditingThresholdKey(`${item.branchId}-${item.productId}`);
                                            setEditingThresholdVal(String(item.minAlertThreshold));
                                          }}
                                          className="text-subtle hover:text-primary text-[10px] underline cursor-pointer"
                                        >
                                          Edit
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5 text-right">
                                    {isCriticalEmpty ? (
                                      <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-black">CRITICAL VOID</span>
                                    ) : isLow ? (
                                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold animate-pulse">LOW LIMIT ALERT</span>
                                    ) : (
                                      <span className="text-[10px] bg-surface text-subtle border border-slate-850 px-2 py-0.5 rounded">STABLE</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB B: STOCK TRANSFERS */}
              {activeSubTab === 'transfers' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="erp-sub-transfers">
                  <div className="lg:col-span-4 bg-card/30 border border-border rounded-2xl p-5 space-y-4">
                    <div className="flex items-center space-x-2 border-b border-border pb-3">
                      <ArrowLeftRight className="w-5 h-5 text-primary" />
                      <h4 className="font-extrabold text-sm font-mono text-foreground uppercase tracking-wider">Inter-Branch Dispatch</h4>
                    </div>

                    <form onSubmit={handleRequestTransfer} className="space-y-4 font-mono text-xs">
                      <div className="space-y-1.5">
                        <label className="text-subtle">Handset Model</label>
                        <select
                          value={selectedTransferProduct}
                          onChange={(e) => setSelectedTransferProduct(e.target.value)}
                          className="w-full bg-surface border border-slate-850 rounded p-2 text-muted font-bold outline-none"
                          required
                        >
                          <option value="">-- Choose Handset SKU --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-subtle">Source</label>
                          <select
                            value={transferFromBranch}
                            onChange={(e) => setTransferFromBranch(e.target.value as BranchId)}
                            className="w-full bg-surface border border-slate-850 rounded p-2 text-muted outline-none"
                          >
                            <option value="b-yangon">Yangon HQ</option>
                            <option value="b-mandalay">Mandalay</option>
                            <option value="b-naypyitaw">Naypyitaw</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-subtle">Target</label>
                          <select
                            value={transferToBranch}
                            onChange={(e) => setTransferToBranch(e.target.value as BranchId)}
                            className="w-full bg-surface border border-slate-850 rounded p-2 text-muted outline-none"
                          >
                            <option value="b-yangon">Yangon HQ</option>
                            <option value="b-mandalay">Mandalay</option>
                            <option value="b-naypyitaw">Naypyitaw</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-subtle">Quantity (Units)</label>
                        <input
                          type="number"
                          value={transferQty}
                          onChange={(e) => setTransferQty(e.target.value)}
                          className="w-full bg-surface border border-slate-850 rounded p-2 text-muted outline-none font-bold text-center"
                          min="1"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={transferLoading || !selectedTransferProduct}
                        className="w-full bg-primary-strong hover:brightness-110 disabled:opacity-40 text-white font-black py-2.5 rounded-xl uppercase transition font-sans text-xs"
                      >
                        {transferLoading ? 'Transmitting request...' : 'Register Transfer'}
                      </button>
                    </form>
                  </div>

                  {/* Transfer Ledger */}
                  <div className="lg:col-span-8 bg-card/20 border border-border rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono">Pending & Historical Transmissions</span>
                    <div className="space-y-3">
                      {transfers.map((trsf) => (
                        <div key={trsf.id} className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white">{trsf.productName}</span>
                              <span className="text-[10px] bg-card text-subtle px-2 py-0.5 rounded">Qty: {trsf.quantity}</span>
                            </div>
                            <p className="text-[10px] text-subtle">
                              Route: <strong className="text-muted">{trsf.fromBranchName}</strong> → <strong className="text-muted">{trsf.toBranchName}</strong>
                            </p>
                          </div>

                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              trsf.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              trsf.status === 'shipped' ? 'bg-primary/10 text-primary border border-primary/20' :
                              'bg-success/10 text-success border border-success/20'
                            }`}>
                              {trsf.status.toUpperCase()}
                            </span>

                            {trsf.status !== 'delivered' && (
                              <button
                                onClick={() => handleProcessTransferStatus(trsf.id, trsf.status)}
                                className="bg-card hover:bg-elevated border border-border hover:border-primary/30 text-primary text-[10px] font-bold px-3 py-1.5 rounded transition"
                              >
                                {trsf.status === 'pending' ? 'Ship Stock' : 'Confirm Delivery'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB C: GAAP FINANCIALS */}
              {activeSubTab === 'finance' && (
                <div className="space-y-6">
                  {/* Financial KPI Widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
                    <div className="bg-card/30 border border-border rounded-2xl p-4.5 space-y-1.5">
                      <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Gross System Revenue</span>
                      <strong className="text-xl sm:text-2xl text-success block font-black">
                        {totalRevenue.toLocaleString()} MMK
                      </strong>
                      <span className="text-[10px] text-subtle">Total processed tickets</span>
                    </div>

                    <div className="bg-card/30 border border-border rounded-2xl p-4.5 space-y-1.5">
                      <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Operational Expenses</span>
                      <strong className="text-xl sm:text-2xl text-rose-400 block font-black">
                        {totalCost.toLocaleString()} MMK
                      </strong>
                      <span className="text-[10px] text-subtle">Rent, salary, backup diesel fuel</span>
                    </div>

                    <div className="bg-card/30 border border-border rounded-2xl p-4.5 space-y-1.5">
                      <span className="text-[10px] text-subtle font-bold uppercase tracking-wider">Net Operating Surplus</span>
                      <strong className="text-xl sm:text-2xl text-white block font-black">
                        {netProfit.toLocaleString()} MMK
                      </strong>
                      <span className="text-[10px] text-subtle">GAAP pre-tax surplus</span>
                    </div>
                  </div>

                  {/* DOUBLE ENTRY DOUBLE VIEW */}
                  <AccountingSubTab activeBranchId={activeBranchId} cashierName={cashierName} />

                  {/* Recharts Analytics Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                    <div className="lg:col-span-7 bg-card/20 border border-border rounded-2xl p-5 space-y-4">
                      <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono block">Multi-Branch Sales Performance (MMK)</span>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getBranchSalesData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={11} className="font-mono" />
                            <YAxis stroke="#64748b" fontSize={10} className="font-mono" />
                            <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} />
                            <Bar dataKey="Sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-card/20 border border-border rounded-2xl p-5 space-y-4">
                      <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono block">Popular Handset Brand Units</span>
                      <div className="h-64 flex flex-col justify-between">
                        <div className="flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getProductPopularityData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getProductPopularityData().map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        {/* Legend list */}
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-subtle">
                          {getProductPopularityData().map((entry, idx) => (
                            <div key={idx} className="flex items-center space-x-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="truncate">{entry.name} ({entry.value}u)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB D: CASH EXPENSES BOOKING */}
              {activeSubTab === 'expenses' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="erp-sub-expenses">
                  <div className="lg:col-span-4 bg-card/30 border border-border rounded-2xl p-5 space-y-4">
                    <div className="flex items-center space-x-2 border-b border-border pb-3">
                      <Sliders className="w-5 h-5 text-rose-400" />
                      <h4 className="font-extrabold text-sm font-mono text-foreground uppercase tracking-wider">Book Cash Expense</h4>
                    </div>

                    <form onSubmit={handleAddExpense} className="space-y-4 font-mono text-xs">
                      <div className="space-y-1.5">
                        <label className="text-subtle">Branch Index</label>
                        <select
                          value={activeBranchId}
                          disabled
                          className="w-full bg-surface border border-slate-850 rounded p-2 text-subtle font-bold"
                        >
                          <option value="b-yangon">Yangon HQ (Kaba Aye)</option>
                          <option value="b-mandalay">Mandalay Branch</option>
                          <option value="b-naypyitaw">Naypyitaw Store</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-subtle">GAAP Category</label>
                        <select
                          value={expCategory}
                          onChange={(e) => setExpCategory(e.target.value as any)}
                          className="w-full bg-surface border border-slate-850 rounded p-2 text-muted outline-none"
                        >
                          <option value="Rent">Rent (Showroom Space)</option>
                          <option value="Salary">Salary (Staff payroll)</option>
                          <option value="Utilities">Utilities (Electricity & Backup Diesel)</option>
                          <option value="Marketing">Marketing (Facebook ads boost)</option>
                          <option value="Repair Parts">Repair Parts Purchase</option>
                          <option value="Other">Other Miscellaneous</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-subtle">Expense Amount (MMK)</label>
                        <input
                          type="number"
                          value={expAmount}
                          onChange={(e) => setExpAmount(e.target.value)}
                          placeholder="e.g. 50000"
                          className="w-full bg-surface border border-slate-850 rounded p-2 text-muted font-bold outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-subtle">Description Notes</label>
                        <textarea
                          value={expDesc}
                          onChange={(e) => setExpDesc(e.target.value)}
                          placeholder="Backup generator diesel fuel purchase for Myanmar power outages..."
                          className="w-full bg-surface border border-slate-850 rounded p-2 text-muted h-16 outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={expLoading || !expAmount}
                        className="w-full bg-rose-500 hover:brightness-110 disabled:opacity-40 text-white font-black py-2.5 rounded-xl uppercase transition font-sans text-xs"
                      >
                        {expLoading ? 'Recording expense...' : 'Submit Expense Log'}
                      </button>
                    </form>
                  </div>

                  {/* Expenses List */}
                  <div className="lg:col-span-8 bg-card/20 border border-border rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono">Recent Cash Outflows</span>
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {expenses.map((exp) => (
                        <div key={exp.id} className="bg-surface border border-border p-3.5 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-rose-400">[{exp.category.toUpperCase()}]</span>
                              <span className="text-[10px] text-subtle">ID: {exp.id}</span>
                            </div>
                            <p className="text-muted text-[11px] font-medium leading-relaxed">{exp.description}</p>
                            <span className="text-[10px] text-subtle block">Branch: {exp.branchId.toUpperCase()} • {new Date(exp.date).toLocaleDateString()}</span>
                          </div>

                          <strong className="text-white text-sm shrink-0">
                            - {exp.amount.toLocaleString()} MMK
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB E: HR & COMMISSIONS */}
              {activeSubTab === 'hr' && (
                <HRSubTab activeBranchId={activeBranchId} />
              )}

              {/* SUBTAB F: ONLINE ORDERS INTERCEPTION */}
              {activeSubTab === 'online_orders' && (
                <div className="space-y-5" id="erp-sub-online-orders">
                  <div className="bg-card/20 border border-border rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h4 className="font-bold text-sm text-foreground font-mono uppercase tracking-wider">E-Commerce Website Orders</h4>
                      <span className="text-[10px] bg-surface border border-border text-subtle px-3 py-1 rounded font-mono">
                        {onlineOrders.filter(o => o.status === 'pending').length} Pending
                      </span>
                    </div>

                    <div className="space-y-3">
                      {onlineOrders.map((order) => (
                        <div key={order.id} className="bg-surface border border-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-xs">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center space-x-2.5">
                              <span className="font-extrabold text-white text-sm">{order.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                order.status === 'accepted' ? 'bg-primary/10 text-primary border border-primary/20 animate-pulse' :
                                'bg-success/10 text-success border border-success/20'
                              }`}>
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="font-bold text-muted">
                              Client: {order.customerName} ({order.customerPhone})
                            </p>
                            <p className="text-subtle text-[10px] truncate max-w-[480px]">
                              Addr: {order.address} | Items: {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                            </p>
                          </div>

                          <div className="text-right shrink-0 space-y-2">
                            <span className="font-black text-success text-sm block">
                              {order.totalAmount.toLocaleString()} MMK
                            </span>

                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleFulfillOnlineOrder(order.id, 'accepted')}
                                className="bg-primary-strong hover:brightness-110 text-white font-black text-[10px] px-3 py-1 rounded uppercase font-sans"
                              >
                                Accept & Allocate Stock
                              </button>
                            )}
                            {order.status === 'accepted' && (
                              <button
                                onClick={() => handleFulfillOnlineOrder(order.id, 'completed')}
                                className="bg-success-strong hover:brightness-110 text-white font-black text-[10px] px-3 py-1 rounded uppercase font-sans"
                              >
                                Mark Completed
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB 3: CRM & SUPPORT LAB
             ========================================== */}
          {activeTab === 'crm' && (
            <div className="space-y-6 animate-fade-in" id="crm-view">
              
              {/* INNER SUB-TABS SELECTOR */}
              <div className="flex items-center space-x-1.5 bg-card/40 p-1 rounded-xl border border-border w-full overflow-x-auto">
                {['repair', 'loyalty', 'campaign', 'eload'].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubTab(sub as any)}
                    className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all whitespace-nowrap ${
                      activeSubTab === sub
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-subtle hover:text-muted'
                    }`}
                  >
                    {sub === 'repair' && 'Hardware Repair diagnostics Lab'}
                    {sub === 'loyalty' && 'Loyalty Profiles Database'}
                    {sub === 'campaign' && 'SMS/Telegram Campaign Broadcast'}
                    {sub === 'eload' && 'E-Load topup Dispatch'}
                  </button>
                ))}
              </div>

              {/* CRM SUBTAB A: REPAIR CENTER */}
              {activeSubTab === 'repair' && (
                <RepairCenter
                  repairs={repairsList}
                  activeBranchId={activeBranchId}
                  onRefresh={fetchRepairs}
                />
              )}

              {/* CRM SUBTAB B: LOYALTY PROFILES */}
              {activeSubTab === 'loyalty' && (
                <div className="space-y-6">
                  <div className="bg-card/30 border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-3.5 h-3.5 text-subtle absolute left-3 top-3.5" />
                      <input
                        type="text"
                        placeholder="Filter CRM list by client name, mobile or VIP tier status..."
                        value={crmSearch}
                        onChange={(e) => setCrmSearch(e.target.value)}
                        className="w-full bg-surface border border-slate-850 rounded-xl pl-9 pr-3 py-2.5 text-xs text-muted outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="bg-card/20 border border-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs border-collapse">
                        <thead>
                          <tr className="bg-surface text-subtle text-[10px] border-b border-border">
                            <th className="px-5 py-3 font-extrabold">CLIENT DETAIL</th>
                            <th className="px-5 py-3 font-extrabold">LOYALTY TIER</th>
                            <th className="px-5 py-3 font-extrabold text-center">EARNED POINTS</th>
                            <th className="px-5 py-3 font-extrabold">TOTAL BRAND VALUE (MMK)</th>
                            <th className="px-5 py-3 font-extrabold">ACCOUNT DEBT BALANCE</th>
                            <th className="px-5 py-3 font-extrabold text-right">ENROLL DATE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {customersList
                            .filter(c => c.name.toLowerCase().includes(crmSearch.toLowerCase()) || c.phone.includes(crmSearch))
                            .map((cust) => (
                              <tr key={cust.id} className="hover:bg-card/10 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="font-bold text-white text-sm">{cust.name}</div>
                                  <div className="text-[10px] text-subtle">{cust.phone} • {cust.email}</div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                    cust.tier === 'VIP' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                                    cust.tier === 'Gold' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    cust.tier === 'Silver' ? 'bg-primary/10 text-primary border border-primary/20' :
                                    'bg-elevated text-subtle'
                                  }`}>
                                    {cust.tier}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-center font-bold text-muted">
                                  {cust.loyaltyPoints.toLocaleString()} pts
                                </td>
                                <td className="px-5 py-3.5 font-bold text-success">
                                  {cust.totalSpent.toLocaleString()} MMK
                                </td>
                                <td className="px-5 py-3.5">
                                  {cust.creditBalance > 0 ? (
                                    <span className="font-extrabold text-rose-400">{cust.creditBalance.toLocaleString()} MMK</span>
                                  ) : (
                                    <span className="text-subtle">Nil debt</span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-right text-subtle">
                                  {new Date(cust.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* CRM SUBTAB C: CAMPAIGN BROADCASTS */}
              {activeSubTab === 'campaign' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="crm-sub-campaign">
                  <div className="lg:col-span-5 bg-card/30 border border-border rounded-2xl p-5 space-y-4">
                    <div className="flex items-center space-x-2 border-b border-border pb-3">
                      <Bell className="w-5 h-5 text-primary" />
                      <h4 className="font-extrabold text-sm font-mono text-foreground uppercase tracking-wider">Broadcaster Channel</h4>
                    </div>

                    <form onSubmit={handleSendCampaign} className="space-y-4 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-subtle">Target Segment</label>
                          <select
                            value={campaignTier}
                            onChange={(e) => setCampaignTier(e.target.value as any)}
                            className="w-full bg-surface border border-slate-850 rounded p-2 text-muted outline-none"
                          >
                            <option value="All">All Registered Clients</option>
                            <option value="Bronze">Bronze Tier</option>
                            <option value="Silver">Silver Tier</option>
                            <option value="Gold">Gold Tier</option>
                            <option value="VIP">VIP Tier</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-subtle">Broadcast Channel</label>
                          <select
                            value={campaignChannel}
                            onChange={(e) => setCampaignChannel(e.target.value as any)}
                            className="w-full bg-surface border border-slate-850 rounded p-2 text-muted outline-none"
                          >
                            <option value="Telegram">Telegram Channel</option>
                            <option value="SMS">SMS Cellular</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-subtle">Campaign Text copy</label>
                        <textarea
                          value={campaignMessage}
                          onChange={(e) => setCampaignMessage(e.target.value)}
                          className="w-full bg-surface border border-slate-850 rounded p-2.5 text-muted h-28 leading-relaxed outline-none focus:border-primary/30"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-primary-strong hover:brightness-110 text-white font-black py-2.5 rounded-xl uppercase transition font-sans text-xs flex items-center justify-center space-x-1"
                      >
                        <Send className="w-4 h-4 stroke-[2.5]" />
                        <span>DISPATCH PROMOTION BROADCAST</span>
                      </button>

                      {campaignSuccess && (
                        <div className="bg-success/10 border border-success/20 p-3 rounded text-success font-bold text-center text-[10px]">
                          ⚡ Campaigns successfully dispatched to targeted clients in background. See transmission logs.
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Broadcast logs */}
                  <div className="lg:col-span-7 bg-card/20 border border-border rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono">SMS / Telegram Transmission audit</span>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {notifications.map((not) => (
                        <div key={not.id} className="bg-surface border border-border p-3 rounded-lg font-mono text-[11px] leading-relaxed">
                          <div className="flex items-center justify-between mb-1 text-[10px]">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-primary">[{not.channel.toUpperCase()}]</span>
                              <span className="text-subtle">{not.recipient}</span>
                            </div>
                            <span className="text-subtle">{new Date(not.sentAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-muted font-medium">{not.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CRM SUBTAB D: E-LOAD VTU TOPUP */}
              {activeSubTab === 'eload' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="crm-sub-eload">
                  <div className="lg:col-span-5 bg-card/30 border border-border rounded-2xl p-5 space-y-4">
                    <div className="flex items-center space-x-2 border-b border-border pb-3">
                      <Wifi className="w-5 h-5 text-primary" />
                      <h4 className="font-extrabold text-sm font-mono text-foreground uppercase tracking-wider">Myanmar Cellular E-Load topup</h4>
                    </div>

                    <form onSubmit={handleVtuSubmit} className="space-y-4 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-subtle">Telecom Operator</label>
                          <select
                            value={vtuOperator}
                            onChange={(e) => setVtuOperator(e.target.value as any)}
                            className="w-full bg-surface border border-slate-850 rounded p-2 text-muted font-bold"
                          >
                            <option value="MPT">MPT</option>
                            <option value="Atom">Atom</option>
                            <option value="Ooredoo">Ooredoo</option>
                            <option value="Mytel">Mytel</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-subtle">Load Package</label>
                          <select
                            value={vtuType}
                            onChange={(e) => setVtuType(e.target.value as any)}
                            className="w-full bg-surface border border-slate-850 rounded p-2 text-muted font-bold"
                          >
                            <option value="airtime">Airtime Refill (Kyat)</option>
                            <option value="data">Data Super Pack</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-subtle">Phone (e.g. 0979...)</label>
                          <input
                            type="tel"
                            placeholder="09799112233"
                            value={vtuPhone}
                            onChange={(e) => setVtuPhone(e.target.value)}
                            className="w-full bg-surface border border-slate-850 rounded p-2 text-muted outline-none font-bold"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-subtle">Recharge (Kyats)</label>
                          <input
                            type="number"
                            placeholder="5000"
                            value={vtuAmount}
                            onChange={(e) => setVtuAmount(e.target.value)}
                            className="w-full bg-surface border border-slate-850 rounded p-2 text-muted outline-none font-bold text-center"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={vtuLoading || !vtuPhone}
                        className="w-full bg-primary-strong hover:brightness-110 disabled:opacity-40 text-white font-black py-2.5 rounded-xl uppercase transition font-sans text-xs"
                      >
                        {vtuLoading ? 'Transmitting load signal...' : 'Dispatch Airtime/Data'}
                      </button>
                    </form>
                  </div>

                  {/* Top-up Logs */}
                  <div className="lg:col-span-7 bg-card/20 border border-border rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] text-subtle font-bold uppercase tracking-wider font-mono">Live Cellular Dispatch Feed</span>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {vtuList.map((tx) => (
                        <div key={tx.id} className="bg-surface border border-border p-3 rounded-lg flex items-center justify-between gap-4 font-mono text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-primary">[{tx.operator}]</span>
                              <span className="text-muted">{tx.phoneNumber}</span>
                            </div>
                            <p className="text-subtle text-[10px]">{tx.planDetails}</p>
                            <span className="text-[9px] text-subtle block">Branch: {tx.branchId.toUpperCase()} • {new Date(tx.createdAt).toLocaleTimeString()}</span>
                          </div>

                          <div className="text-right space-y-1 shrink-0">
                            <span className="font-bold text-success block">{tx.amount.toLocaleString()} MMK</span>
                            <span className="bg-success/10 text-success border border-success/20 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB 4: AI OPERATIONS COACH
             ========================================== */}
          {activeTab === 'ai' && (
            <AIPredictions
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              userInput={userInput}
              setUserInput={setUserInput}
              aiTyping={aiTyping}
              setAiTyping={setAiTyping}
              onSendMessage={handleSendAiMessage}
            />
          )}

          {/* ==========================================
              TAB 5: ADMIN OPERATIONS COMMAND CENTER
             ========================================== */}
          {activeTab === 'admin' && (
            <AdminDashboard
              sales={sales}
              expenses={expenses}
              inventories={inventories}
              repairs={repairsList}
              customers={customersList}
              branches={branches}
              products={products}
              onRefreshAllData={() => {
                fetchBranches();
                fetchProducts();
                fetchInventory();
                fetchTransfers();
                fetchSales();
                fetchCustomers();
                fetchRepairs();
                fetchVtu();
                fetchExpenses();
                fetchOnlineOrders();
                fetchNotifications();
              }}
            />
          )}

        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-border/80 bg-surface py-5 text-center text-[10px] font-mono text-subtle mt-auto">
        <p>AKK Mobile Cloud-Sync Enterprise POS+ERP+CRM. All rights reserved.</p>
        <p className="text-subtle mt-1">GAAP Compliant Ledger • Myanmar Commercial Tax Registration Calibrated</p>
      </footer>
      <SpeedInsights />
    </div>
  );
}
