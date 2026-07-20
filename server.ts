import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase, db } from './src/lib/database.js';
import { ProductService } from './src/lib/services/ProductService.js';
import { SalesService } from './src/lib/services/SalesService.js';
import { RepairService } from './src/lib/services/RepairService.js';
import { CustomerService } from './src/lib/services/CustomerService.js';
import { InventoryService } from './src/lib/services/InventoryService.js';
import { PurchaseService } from './src/lib/services/PurchaseService.js';
import { AccountingService } from './src/lib/services/AccountingService.js';
import { IMEIService } from './src/lib/services/IMEIService.js';
import { setupDatabaseRoutes } from './src/lib/api-routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
initializeDatabase();

const app = express();
app.use(express.json());

// Initialize Gemini API Client securely
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// ENTERPRISE DATA TYPE SCHEMAS (MYANMAR CONTEXT)
// ==========================================
type RepairStatus = 'received' | 'diagnostic' | 'repairing' | 'testing' | 'ready' | 'delivered';
type PaymentStatus = 'pending' | 'completed' | 'failed';
type BranchId = 'b-yangon' | 'b-mandalay' | 'b-naypyitaw';
type TransferStatus = 'pending' | 'shipped' | 'delivered';
type CustomerTier = 'Bronze' | 'Silver' | 'Gold' | 'VIP';

interface Branch {
  id: BranchId;
  name: string;
  city: string;
  manager: string;
  phone: string;
}

interface PhoneProduct {
  id: string;
  name: string;
  brand: string;
  price: number; // in MMK
  originalPrice: number; // in MMK
  image: string;
  specs: {
    screen: string;
    processor: string;
    ram: string;
    storage: string;
    battery: string;
    camera: string;
  };
  colors: string[];
  rating: number;
  reviewsCount: number;
  badge?: string;
  category: 'Phone' | 'Accessories' | 'Electronics' | 'Repair Parts';
}

interface BranchInventory {
  branchId: BranchId;
  productId: string;
  stock: number;
  minAlertThreshold: number; // For low stock ERP triggers
}

interface RepairTicket {
  id: string;
  branchId: BranchId;
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  status: RepairStatus;
  estimatedCost: number; // in MMK
  partsUsed: string[];
  createdAt: string;
  updatedAt: string;
  technicianNotes?: string;
  assignedTechnician?: string;
  customerSignature?: string; // Base64 or drawing flag
  warrantyMonths: number;
}

interface ELoadTransaction {
  id: string;
  type: 'airtime' | 'data';
  operator: 'MPT' | 'Atom' | 'Ooredoo' | 'Mytel';
  phoneNumber: string;
  amount: number; // in MMK
  planDetails?: string;
  status: PaymentStatus;
  branchId: BranchId;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  telegram?: string;
  facebook?: string;
  tier: CustomerTier;
  loyaltyPoints: number;
  totalSpent: number; // in MMK
  creditBalance: number; // in MMK
  createdAt: string;
}

interface PosSale {
  id: string;
  branchId: BranchId;
  customerName: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    name: string;
    price: number; // in MMK
    color: string;
    quantity: number;
    imei?: string;
  }>;
  taxAmount: number; // in MMK
  discountAmount: number; // in MMK
  totalAmount: number; // in MMK
  paymentMethod: 'cash' | 'kbzpay' | 'wavepay' | 'ayapay' | 'cbpay' | 'uabpay' | 'credit' | 'split';
  splitDetails?: string; // breakdown
  cashierName: string;
  createdAt: string;
}

interface StockTransfer {
  id: string;
  productId: string;
  productName: string;
  fromBranchId: BranchId;
  toBranchId: BranchId;
  quantity: number;
  status: TransferStatus;
  requestedBy: string;
  createdAt: string;
}

interface Expense {
  id: string;
  branchId: BranchId;
  category: 'Rent' | 'Salary' | 'Utilities' | 'Marketing' | 'Repair Parts' | 'Other';
  amount: number; // in MMK
  description: string;
  date: string;
}

interface Employee {
  id: string;
  name: string;
  role: 'Owner' | 'Branch Manager' | 'Cashier' | 'Sales' | 'Technician' | 'Accountant';
  branchId: BranchId;
  phone: string;
  attendanceStatus: 'checked_in' | 'checked_out' | 'absent';
  attendanceTime?: string;
  salesTarget: number; // in MMK
  currentSales: number; // in MMK
  commissionRate: number; // e.g. 0.02 (2%)
}

interface ChartOfAccount {
  code: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number; // in MMK
}

interface DailyClosing {
  id: string;
  branchId: BranchId;
  closingDate: string;
  cashSales: number;
  kPaySales: number;
  wavePaySales: number;
  otherDigitalSales: number;
  totalSales: number;
  expenseAmount: number;
  drawerDifference: number; // actual vs expected
  closedBy: string;
  status: 'draft' | 'audited';
}

interface OnlineOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  orderType: 'pickup' | 'delivery';
  status: 'pending' | 'accepted' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
}

interface NotificationLog {
  id: string;
  channel: 'SMS' | 'Telegram' | 'Email';
  recipient: string;
  message: string;
  sentAt: string;
}

// ==========================================
// SEED SEEDS (MYANMAR SEEDS)
// ==========================================
const branches: Branch[] = [
  { id: 'b-yangon', name: 'Yangon HQ (Kaba Aye Pagoda Rd)', city: 'Yangon', manager: 'U Kyaw Swar', phone: '09777123456' },
  { id: 'b-mandalay', name: 'Mandalay Branch (73rd St)', city: 'Mandalay', manager: 'Daw Hla Hla', phone: '09511223344' },
  { id: 'b-naypyitaw', name: 'Naypyitaw Store (Thiri Mandalar)', city: 'Naypyitaw', manager: 'U Aung Ko', phone: '09444555666' }
];

const products: PhoneProduct[] = [
  {
    id: 'phone-001',
    name: 'Galaxy S26 Ultra',
    brand: 'Samsung',
    price: 3600000,
    originalPrice: 3800000,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    specs: {
      screen: '6.8" Dynamic AMOLED 2X, 120Hz',
      processor: 'Snapdragon 8 Gen 5',
      ram: '16GB LPDDR5X',
      storage: '512GB UFS 4.0',
      battery: '5000mAh with 45W charging',
      camera: '200MP Main + 50MP Periscope + 12MP Ultra-wide'
    },
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet'],
    rating: 4.9,
    reviewsCount: 128,
    badge: 'Flagship Choice',
    category: 'Phone'
  },
  {
    id: 'phone-002',
    name: 'iPhone 17 Pro Max',
    brand: 'Apple',
    price: 3900000,
    originalPrice: 4100000,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    specs: {
      screen: '6.9" Super Retina XDR OLED, ProMotion',
      processor: 'Apple A19 Pro (3nm)',
      ram: '12GB unified memory',
      storage: '256GB NVMe',
      battery: '4852mAh with MagSafe wireless',
      camera: '48MP Fusion + 48MP Telephoto + 48MP Ultra-wide'
    },
    colors: ['Desert Titanium', 'Natural Titanium', 'Space Black'],
    rating: 4.8,
    reviewsCount: 245,
    badge: 'Popular',
    category: 'Phone'
  },
  {
    id: 'phone-003',
    name: 'Pixel 10 Pro',
    brand: 'Google',
    price: 3000000,
    originalPrice: 3100000,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    specs: {
      screen: '6.7" Super Actua Display, 120Hz',
      processor: 'Google Tensor G5 (with AI Coprocessor)',
      ram: '16GB LPDDR5X',
      storage: '256GB UFS 4.0',
      battery: '5060mAh with AI smart saving',
      camera: '50MP Octa PD Main + 48MP Zoom + 48MP Wide'
    },
    colors: ['Obsidian Black', 'Porcelain White', 'Hazel Gray'],
    rating: 4.7,
    reviewsCount: 92,
    badge: 'Pure AI Phone',
    category: 'Phone'
  },
  {
    id: 'phone-004',
    name: 'OnePlus 13 5G',
    brand: 'OnePlus',
    price: 2200000,
    originalPrice: 2400000,
    image: 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=600&q=80',
    specs: {
      screen: '6.82" 2K Oriental AMOLED, 120Hz',
      processor: 'Snapdragon 8 Gen 4',
      ram: '16GB',
      storage: '256GB',
      battery: '6000mAh with 100W SuperVOOC',
      camera: '50MP Sony Lythia Main + 50MP Periscope + 50MP Wide'
    },
    colors: ['Glacier White', 'Silk Black', 'Sage Green'],
    rating: 4.6,
    reviewsCount: 67,
    badge: 'Value Killer',
    category: 'Phone'
  },
  {
    id: 'phone-005',
    name: 'Redmi Note 15 Pro+',
    brand: 'Xiaomi',
    price: 1200000,
    originalPrice: 1350000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    specs: {
      screen: '6.67" CrystalRes AMOLED, 120Hz',
      processor: 'Dimensity 7400-Ultra',
      ram: '12GB',
      storage: '256GB',
      battery: '5100mAh with 120W HyperCharge',
      camera: '200MP Main + 8MP Ultra-wide + 2MP Macro'
    },
    colors: ['Aurora Purple', 'Midnight Black', 'Forest Blue'],
    rating: 4.5,
    reviewsCount: 156,
    badge: 'Best Budget',
    category: 'Phone'
  },
  {
    id: 'acc-001',
    name: 'AKK Premium Powerbank 20,000mAh',
    brand: 'AKK',
    price: 90000,
    originalPrice: 110000,
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=600&q=80',
    specs: {
      screen: 'N/A',
      processor: 'N/A',
      ram: 'N/A',
      storage: '20,000mAh Power Capacity',
      battery: 'Li-Polymer 22.5W QC PD',
      camera: 'N/A'
    },
    colors: ['Charcoal Black', 'Arctic White'],
    rating: 4.7,
    reviewsCount: 88,
    badge: 'Local Best Seller',
    category: 'Accessories'
  },
  {
    id: 'acc-002',
    name: 'Silicon Protective Armor Case',
    brand: 'AKK',
    price: 25000,
    originalPrice: 35000,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
    specs: {
      screen: 'Shock-proof edges',
      processor: 'TPU Silicon Material',
      ram: 'N/A',
      storage: 'Military-Grade Certified',
      battery: 'N/A',
      camera: 'Lens slide protection'
    },
    colors: ['Clear Matte', 'Space Blue', 'Tactical Green'],
    rating: 4.5,
    reviewsCount: 112,
    badge: 'Top Protection',
    category: 'Accessories'
  },
  {
    id: 'parts-001',
    name: 'OEM OLED Replacement Screen - iPhone 15',
    brand: 'Apple-OEM',
    price: 450000,
    originalPrice: 500000,
    image: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80f02e?auto=format&fit=crop&w=600&q=80',
    specs: {
      screen: '6.1" OLED Retina Grade',
      processor: 'Multi-touch calibrated',
      ram: 'N/A',
      storage: 'OEM glass hardness',
      battery: 'N/A',
      camera: 'Dynamic Island fully compatible'
    },
    colors: ['Black'],
    rating: 4.9,
    reviewsCount: 34,
    badge: 'Service Lab Certified',
    category: 'Repair Parts'
  }
];

let branchInventories: BranchInventory[] = [
  // Yangon HQ
  { branchId: 'b-yangon', productId: 'phone-001', stock: 15, minAlertThreshold: 5 },
  { branchId: 'b-yangon', productId: 'phone-002', stock: 18, minAlertThreshold: 5 },
  { branchId: 'b-yangon', productId: 'phone-003', stock: 10, minAlertThreshold: 3 },
  { branchId: 'b-yangon', productId: 'phone-004', stock: 25, minAlertThreshold: 5 },
  { branchId: 'b-yangon', productId: 'phone-005', stock: 35, minAlertThreshold: 8 },
  { branchId: 'b-yangon', productId: 'acc-001', stock: 80, minAlertThreshold: 15 },
  { branchId: 'b-yangon', productId: 'acc-002', stock: 120, minAlertThreshold: 20 },
  { branchId: 'b-yangon', productId: 'parts-001', stock: 14, minAlertThreshold: 3 },

  // Mandalay Branch
  { branchId: 'b-mandalay', productId: 'phone-001', stock: 6, minAlertThreshold: 3 },
  { branchId: 'b-mandalay', productId: 'phone-002', stock: 4, minAlertThreshold: 4 },
  { branchId: 'b-mandalay', productId: 'phone-003', stock: 12, minAlertThreshold: 3 },
  { branchId: 'b-mandalay', productId: 'phone-004', stock: 8, minAlertThreshold: 3 },
  { branchId: 'b-mandalay', productId: 'phone-005', stock: 20, minAlertThreshold: 6 },
  { branchId: 'b-mandalay', productId: 'acc-001', stock: 40, minAlertThreshold: 10 },
  { branchId: 'b-mandalay', productId: 'acc-002', stock: 55, minAlertThreshold: 10 },
  { branchId: 'b-mandalay', productId: 'parts-001', stock: 5, minAlertThreshold: 2 },

  // Naypyitaw Store
  { branchId: 'b-naypyitaw', productId: 'phone-001', stock: 2, minAlertThreshold: 3 }, // triggers low stock!
  { branchId: 'b-naypyitaw', productId: 'phone-002', stock: 7, minAlertThreshold: 3 },
  { branchId: 'b-naypyitaw', productId: 'phone-003', stock: 1, minAlertThreshold: 3 }, // triggers low stock!
  { branchId: 'b-naypyitaw', productId: 'phone-004', stock: 15, minAlertThreshold: 4 },
  { branchId: 'b-naypyitaw', productId: 'phone-005', stock: 10, minAlertThreshold: 5 },
  { branchId: 'b-naypyitaw', productId: 'acc-001', stock: 15, minAlertThreshold: 10 },
  { branchId: 'b-naypyitaw', productId: 'acc-002', stock: 20, minAlertThreshold: 10 },
  { branchId: 'b-naypyitaw', productId: 'parts-001', stock: 1, minAlertThreshold: 2 } // triggers low stock!
];

let customers: Customer[] = [
  { id: 'c-1', name: 'Ko Min Thuta', phone: '09799112233', email: 'minthuta@gmail.com', facebook: 'MinThuta.AKK', tier: 'Gold', loyaltyPoints: 4500, totalSpent: 12400000, creditBalance: 0, createdAt: new Date(Date.now() - 3600000 * 240).toISOString() },
  { id: 'c-2', name: 'Ma Thandar Myint', phone: '09450887766', email: 'thandar.m@gmail.com', telegram: '@thandarmyint', tier: 'Silver', loyaltyPoints: 2200, totalSpent: 7500000, creditBalance: 200000, createdAt: new Date(Date.now() - 3600000 * 180).toISOString() },
  { id: 'c-3', name: 'Dr. Aung Kyaw', phone: '095012345', email: 'aungkyaw.doc@naypyitaw.gov.mm', telegram: '@draungkyaw', tier: 'VIP', loyaltyPoints: 9500, totalSpent: 22800000, creditBalance: 0, createdAt: new Date(Date.now() - 3600000 * 320).toISOString() },
  { id: 'c-4', name: 'Ko Chit Ko Ko', phone: '09252334455', email: 'chitkoko@gmail.com', facebook: 'KoChit.Retail', tier: 'Bronze', loyaltyPoints: 800, totalSpent: 1800000, creditBalance: 0, createdAt: new Date(Date.now() - 3600000 * 50).toISOString() }
];

let repairTickets: RepairTicket[] = [
  {
    id: 'REP-9482',
    branchId: 'b-yangon',
    customerName: 'Ko Min Thuta',
    customerPhone: '09799112233',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 15 Pro',
    issueDescription: 'Shattered front panel, flickering bottom screen, touch unresponsive.',
    status: 'repairing',
    estimatedCost: 480000,
    partsUsed: ['OEM OLED Replacement Screen - iPhone 15'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    assignedTechnician: 'U Hla Tun (Senior Tech)',
    technicianNotes: 'Removed shattered assembly. Preparing new Apple OEM Display panel for full adhesive seal & TrueTone re-flashing.',
    warrantyMonths: 6
  },
  {
    id: 'REP-1029',
    branchId: 'b-mandalay',
    customerName: 'Ma Thandar Myint',
    customerPhone: '09450887766',
    deviceBrand: 'Samsung',
    deviceModel: 'Galaxy S23 Ultra',
    issueDescription: 'Battery thermal bloat, dropping from 80% to dead within minutes.',
    status: 'testing',
    estimatedCost: 110000,
    partsUsed: ['Samsung High-Cap Battery Cell'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    assignedTechnician: 'Ko Nay Lin (Tech)',
    technicianNotes: 'Fitted replacement battery unit. Running charging stress cycle to test thermal thresholds. No signs of motherboard leaks.',
    warrantyMonths: 3
  },
  {
    id: 'REP-3841',
    branchId: 'b-naypyitaw',
    customerName: 'Ko Chit Ko Ko',
    customerPhone: '09252334455',
    deviceBrand: 'Google',
    deviceModel: 'Pixel 8 Pro',
    issueDescription: 'Rear telephoto lens glass shattered, dust inside camera module.',
    status: 'ready',
    estimatedCost: 150000,
    partsUsed: ['Google Pixel 8 Rear Lens Unit'],
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    assignedTechnician: 'U Aung Ko (Manager/Tech)',
    technicianNotes: 'Cleaned internal imaging sensors in clean room environment. Fitted new crystal telephoto outer lens glass. Calibrated focal length successfully.',
    warrantyMonths: 12
  }
];

let posSales: PosSale[] = [
  {
    id: 'SAL-10021',
    branchId: 'b-yangon',
    customerName: 'Ma Thandar Myint',
    customerPhone: '09450887766',
    items: [
      { productId: 'phone-002', name: 'iPhone 17 Pro Max', price: 3900000, color: 'Desert Titanium', quantity: 1, imei: '358912345678901' },
      { productId: 'acc-001', name: 'AKK Premium Powerbank 20,000mAh', price: 90000, color: 'Charcoal Black', quantity: 1 }
    ],
    taxAmount: 199500,
    discountAmount: 50000,
    totalAmount: 4139500,
    paymentMethod: 'kbzpay',
    cashierName: 'Daw Su Su',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'SAL-10022',
    branchId: 'b-mandalay',
    customerName: 'Ko Chit Ko Ko',
    customerPhone: '09252334455',
    items: [
      { productId: 'phone-004', name: 'OnePlus 13 5G', price: 2200000, color: 'Glacier White', quantity: 1, imei: '862045612345678' }
    ],
    taxAmount: 110000,
    discountAmount: 0,
    totalAmount: 2310000,
    paymentMethod: 'wavepay',
    cashierName: 'Ko Thura',
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString()
  },
  {
    id: 'SAL-10023',
    branchId: 'b-naypyitaw',
    customerName: 'Walk-In Customer',
    customerPhone: 'N/A',
    items: [
      { productId: 'phone-005', name: 'Redmi Note 15 Pro+', price: 1200000, color: 'Forest Blue', quantity: 2, imei: '860124578125479,860124578125480' }
    ],
    taxAmount: 120000,
    discountAmount: 10000,
    totalAmount: 2510000,
    paymentMethod: 'cash',
    cashierName: 'Ma Khin Hnin',
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString()
  }
];

let stockTransfers: StockTransfer[] = [
  {
    id: 'TRF-3001',
    productId: 'phone-001',
    productName: 'Galaxy S26 Ultra',
    fromBranchId: 'b-yangon',
    toBranchId: 'b-naypyitaw',
    quantity: 3,
    status: 'delivered',
    requestedBy: 'U Aung Ko',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
  },
  {
    id: 'TRF-3002',
    productId: 'phone-002',
    productName: 'iPhone 17 Pro Max',
    fromBranchId: 'b-yangon',
    toBranchId: 'b-mandalay',
    quantity: 4,
    status: 'shipped',
    requestedBy: 'Daw Hla Hla',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

let eLoadTransactions: ELoadTransaction[] = [
  { id: 'VTU-58291', type: 'data', operator: 'MPT', phoneNumber: '09777123456', amount: 8000, planDetails: 'MPT 10GB 30-Day Super Data', status: 'completed', branchId: 'b-yangon', createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 'VTU-48201', type: 'airtime', operator: 'Atom', phoneNumber: '09450887766', amount: 5000, planDetails: 'Atom 5000 Kyat Refill', status: 'completed', branchId: 'b-mandalay', createdAt: new Date(Date.now() - 3600000 * 8).toISOString() }
];

// New database tables for ERP expansion
let expenses: Expense[] = [
  { id: 'EXP-101', branchId: 'b-yangon', category: 'Rent', amount: 800000, description: 'Kaba Aye Showroom monthly rental fee', date: new Date(Date.now() - 3600000 * 120).toISOString() },
  { id: 'EXP-102', branchId: 'b-mandalay', category: 'Utilities', amount: 150000, description: 'Power grid & backup generator diesel', date: new Date(Date.now() - 3600000 * 90).toISOString() },
  { id: 'EXP-103', branchId: 'b-naypyitaw', category: 'Marketing', amount: 250000, description: 'Naypyitaw local Facebook Page promotion boost', date: new Date(Date.now() - 3600000 * 48).toISOString() }
];

let employees: Employee[] = [
  { id: 'emp-001', name: 'U Kyaw Swar', role: 'Branch Manager', branchId: 'b-yangon', phone: '09777123456', attendanceStatus: 'checked_in', attendanceTime: '08:15 AM', salesTarget: 15000000, currentSales: 11500000, commissionRate: 0.015 },
  { id: 'emp-002', name: 'Daw Su Su', role: 'Cashier', branchId: 'b-yangon', phone: '0979111222', attendanceStatus: 'checked_in', attendanceTime: '08:00 AM', salesTarget: 5000000, currentSales: 4139500, commissionRate: 0.005 },
  { id: 'emp-003', name: 'U Hla Tun', role: 'Technician', branchId: 'b-yangon', phone: '0978222333', attendanceStatus: 'checked_in', attendanceTime: '08:30 AM', salesTarget: 2000000, currentSales: 480000, commissionRate: 0.05 },
  { id: 'emp-004', name: 'Daw Hla Hla', role: 'Branch Manager', branchId: 'b-mandalay', phone: '09511223344', attendanceStatus: 'checked_out', salesTarget: 12000000, currentSales: 7500000, commissionRate: 0.015 },
  { id: 'emp-005', name: 'Ko Thura', role: 'Cashier', branchId: 'b-mandalay', phone: '0950333444', attendanceStatus: 'checked_in', attendanceTime: '08:05 AM', salesTarget: 4000000, currentSales: 2310000, commissionRate: 0.005 },
  { id: 'emp-006', name: 'U Aung Ko', role: 'Branch Manager', branchId: 'b-naypyitaw', phone: '09444555666', attendanceStatus: 'checked_in', attendanceTime: '07:45 AM', salesTarget: 10000000, currentSales: 2510000, commissionRate: 0.02 }
];

let chartOfAccounts: ChartOfAccount[] = [
  { code: '1010', name: 'Cash on Hand (POS Drawer)', category: 'Asset', balance: 1450000 },
  { code: '1020', name: 'KBZPay Business Account', category: 'Asset', balance: 8450000 },
  { code: '1030', name: 'WavePay Business Account', category: 'Asset', balance: 5200000 },
  { code: '1200', name: 'Inventory Asset Ledger', category: 'Asset', balance: 135000000 },
  { code: '2100', name: 'Accounts Payable (Suppliers)', category: 'Liability', balance: 12000000 },
  { code: '3000', name: 'AKK Mobile Owner Capital', category: 'Equity', balance: 130000000 },
  { code: '4000', name: 'Retail Handset Sales Revenue', category: 'Revenue', balance: 8959500 },
  { code: '4100', name: 'Repair Service Income', category: 'Revenue', balance: 740000 },
  { code: '5000', name: 'Cost of Goods Sold (COGS)', category: 'Expense', balance: 7100000 },
  { code: '5100', name: 'Branch Rent Expense', category: 'Expense', balance: 800000 },
  { code: '5200', name: 'Utilities & Diesel Expense', category: 'Expense', balance: 150000 },
  { code: '5300', name: 'Marketing & Promos Expense', category: 'Expense', balance: 250000 }
];

let dailyClosings: DailyClosing[] = [
  { id: 'CLS-001', branchId: 'b-yangon', closingDate: new Date(Date.now() - 3600000 * 24).toISOString().split('T')[0], cashSales: 450000, kPaySales: 2450000, wavePaySales: 1200000, otherDigitalSales: 500000, totalSales: 4600000, expenseAmount: 80000, drawerDifference: 0, closedBy: 'Daw Su Su', status: 'audited' }
];

let integrationSettings = {
  telegramBotToken: '739482015:AAH_fG40b2-u8q5_kMh1lZp608q',
  telegramChatId: '-100204918231',
  webhookUrl: 'https://api.externalpartner.com/v1/pos-webhooks',
  webhookAuthToken: 'bearer_sec_tkn_8492041285102',
  supabaseUrl: 'https://kkmgkti67zhhq6zrc2gngs.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbWdrdGk2N3poaHF6cmMyZ25ncyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjc4OTI4NDAwLCJleHAiOjIwOTQ1MDQ0MDB9.someSignatureKey',
  smsGatewayKey: 'sms_live_api_8390159182049182042',
  vtuMerchantId: 'vtu_merch_94821',
  vtuSecretKey: 'vtu_sec_key_948291048201'
};

let onlineOrders: OnlineOrder[] = [
  { id: 'ONL-201', customerName: 'Ma Moe Moe', customerPhone: '09798765432', address: 'Bahan Township, Yangon', items: [{ productId: 'phone-005', name: 'Redmi Note 15 Pro+', price: 1200000, quantity: 1 }], totalAmount: 1200000, orderType: 'delivery', status: 'pending', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'ONL-202', customerName: 'Ko Aung Phyo', customerPhone: '09420112233', address: 'Mandalay, Near Palace Wall', items: [{ productId: 'acc-001', name: 'AKK Premium Powerbank 20,000mAh', price: 90000, quantity: 2 }], totalAmount: 180000, orderType: 'pickup', status: 'accepted', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() }
];

let notificationLogs: NotificationLog[] = [
  { id: 'NOT-1001', channel: 'Telegram', recipient: '@draungkyaw', message: 'Hello VIP Customer! Your repair ticket REP-3841 is completed and ready for pickup at our Naypyitaw Branch. Thank you!', sentAt: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: 'NOT-1002', channel: 'SMS', recipient: '09450887766', message: 'AKK Mobile: Your payment of 4,139,500 MMK via KBZPay was successfully processed. Points earned: 41,395.', sentAt: new Date(Date.now() - 3600000 * 6).toISOString() }
];

// ==========================================
// REST API CONTROLLERS
// ==========================================

// --- Branches ---
app.get('/api/branches', (req, res) => {
  res.json(branches);
});

// --- Products Catalog ---
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { name, brand, price, originalPrice, category, colors, specs } = req.body;
  if (!name || !brand || !price) {
    return res.status(400).json({ error: 'Name, brand, and price are required.' });
  }

  const newId = `phone-${Math.floor(100 + Math.random() * 900)}`;
  const newProduct: PhoneProduct = {
    id: newId,
    name,
    brand,
    price: Number(price),
    originalPrice: Number(originalPrice || price),
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    specs: specs || {
      screen: '6.7" Super Retina Screen',
      processor: 'High-speed Multi-core Chip',
      ram: '8GB RAM',
      storage: '256GB Storage',
      battery: '5000mAh Battery Power',
      camera: '50MP Professional Lens'
    },
    colors: colors && colors.length ? colors : ['Black', 'Silver', 'Gold'],
    rating: 5.0,
    reviewsCount: 1,
    badge: 'New Arrival',
    category: category || 'Phone'
  };

  products.push(newProduct);

  // Initialize inventories for all branches to 0
  branches.forEach(b => {
    branchInventories.push({
      branchId: b.id,
      productId: newId,
      stock: 0,
      minAlertThreshold: 3
    });
  });

  res.status(201).json(newProduct);
});

app.get('/api/products/:id', (req, res) => {
  const prod = products.find((p) => p.id === req.params.id);
  if (prod) {
    res.json(prod);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// --- Multi-Branch Inventory ---
app.get('/api/inventory', (req, res) => {
  const joinedInventory = branchInventories.map(inv => {
    const product = products.find(p => p.id === inv.productId);
    const branch = branches.find(b => b.id === inv.branchId);
    return {
      ...inv,
      productName: product?.name || 'Unknown Handset',
      productBrand: product?.brand || 'Unknown',
      productPrice: product?.price || 0,
      productImage: product?.image || '',
      branchName: branch?.name || 'Unknown Branch'
    };
  });
  res.json(joinedInventory);
});

app.post('/api/inventory', (req, res) => {
  const { branchId, productId, stock, minAlertThreshold } = req.body;
  if (!branchId || !productId) {
    return res.status(400).json({ error: 'branchId and productId are required.' });
  }

  let item = branchInventories.find(i => i.branchId === branchId && i.productId === productId);
  if (item) {
    if (stock !== undefined) {
      item.stock = Number(stock);
    }
    if (minAlertThreshold !== undefined) {
      item.minAlertThreshold = Number(minAlertThreshold);
    }
  } else {
    item = {
      branchId,
      productId,
      stock: stock !== undefined ? Number(stock) : 0,
      minAlertThreshold: minAlertThreshold !== undefined ? Number(minAlertThreshold) : 3
    };
    branchInventories.push(item);
  }

  res.status(200).json(item);
});

// Update stock alert thresholds
app.put('/api/inventory/threshold', (req, res) => {
  const { branchId, productId, threshold } = req.body;
  const item = branchInventories.find(i => i.branchId === branchId && i.productId === productId);
  if (item) {
    item.minAlertThreshold = Number(threshold);
    return res.json({ success: true, item });
  }
  res.status(404).json({ error: 'Inventory record not found' });
});

// --- Inter-Branch Stock Transfers ---
app.get('/api/transfers', (req, res) => {
  const enrichedTransfers = stockTransfers.map(trsf => {
    const fromBranchName = branches.find(b => b.id === trsf.fromBranchId)?.name || 'Unknown';
    const toBranchName = branches.find(b => b.id === trsf.toBranchId)?.name || 'Unknown';
    return {
      ...trsf,
      fromBranchName,
      toBranchName
    };
  });
  res.json(enrichedTransfers);
});

app.post('/api/transfers', (req, res) => {
  const { productId, fromBranchId, toBranchId, quantity, requestedBy } = req.body;
  if (!productId || !fromBranchId || !toBranchId || !quantity) {
    return res.status(400).json({ error: 'Missing transfer request metrics' });
  }

  // Deduct from source stock first
  const sourceInv = branchInventories.find(i => i.branchId === fromBranchId && i.productId === productId);
  if (!sourceInv || sourceInv.stock < Number(quantity)) {
    return res.status(400).json({ error: 'Insufficient stock at source branch' });
  }

  const prod = products.find(p => p.id === productId);

  const newTransfer: StockTransfer = {
    id: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
    productId,
    productName: prod?.name || 'Unknown Handset',
    fromBranchId,
    toBranchId,
    quantity: Number(quantity),
    status: 'pending',
    requestedBy: requestedBy || 'Manager',
    createdAt: new Date().toISOString()
  };

  stockTransfers.unshift(newTransfer);
  res.status(201).json(newTransfer);
});

app.put('/api/transfers/:id', (req, res) => {
  const { status } = req.body; // 'shipped' | 'delivered'
  const transfer = stockTransfers.find(t => t.id === req.params.id);

  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found' });
  }

  if (status === 'shipped' && transfer.status === 'pending') {
    const sourceInv = branchInventories.find(i => i.branchId === transfer.fromBranchId && i.productId === transfer.productId);
    if (sourceInv) {
      sourceInv.stock = Math.max(0, sourceInv.stock - transfer.quantity);
    }
    transfer.status = 'shipped';
  } else if (status === 'delivered' && transfer.status === 'shipped') {
    const destInv = branchInventories.find(i => i.branchId === transfer.toBranchId && i.productId === transfer.productId);
    if (destInv) {
      destInv.stock += transfer.quantity;
    } else {
      branchInventories.push({
        branchId: transfer.toBranchId,
        productId: transfer.productId,
        stock: transfer.quantity,
        minAlertThreshold: 3
      });
    }
    transfer.status = 'delivered';
  }

  res.json(transfer);
});

// --- POS Checkout ---
app.post('/api/pos/checkout', (req, res) => {
  const { branchId, customerName, customerPhone, customerEmail, items, paymentMethod, discountAmount, cashierName } = req.body;
  if (!branchId || !items || !items.length) {
    return res.status(400).json({ error: 'Missing branch or cart items' });
  }

  // Validate stock
  for (const item of items) {
    const inv = branchInventories.find(i => i.branchId === branchId && i.productId === item.productId);
    if (!inv || inv.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient inventory for ${item.name} at this branch.` });
    }
  }

  // Deduct stock
  let totalOrder = 0;
  items.forEach((item: any) => {
    const inv = branchInventories.find(i => i.branchId === branchId && i.productId === item.productId);
    if (inv) {
      inv.stock -= item.quantity;
    }
    totalOrder += item.price * item.quantity;
  });

  const disc = discountAmount ? Number(discountAmount) : 0;
  const tax = Math.round((totalOrder - disc) * 0.05); // 5% VAT
  const totalWithTax = totalOrder - disc + tax;

  const salesId = `SAL-${Math.floor(10000 + Math.random() * 90000)}`;
  const newSale: PosSale = {
    id: salesId,
    branchId,
    customerName: customerName || 'Walk-In Customer',
    customerPhone: customerPhone || 'N/A',
    items,
    taxAmount: tax,
    discountAmount: disc,
    totalAmount: totalWithTax,
    paymentMethod: paymentMethod || 'cash',
    cashierName: cashierName || 'Cashier Terminal',
    createdAt: new Date().toISOString()
  };

  posSales.unshift(newSale);

  // Update employee commission & sales performance
  const matchedCashier = employees.find(e => e.name === cashierName);
  if (matchedCashier) {
    matchedCashier.currentSales += totalWithTax;
  }

  // Update Chart of accounts balances
  const salesRevAcct = chartOfAccounts.find(c => c.code === '4000');
  if (salesRevAcct) salesRevAcct.balance += totalWithTax;

  const cogsAcct = chartOfAccounts.find(c => c.code === '5000');
  if (cogsAcct) cogsAcct.balance += Math.round(totalOrder * 0.7); // Estimated COGS

  if (paymentMethod === 'cash') {
    const cashAcct = chartOfAccounts.find(c => c.code === '1010');
    if (cashAcct) cashAcct.balance += totalWithTax;
  } else if (paymentMethod === 'kbzpay') {
    const kbzAcct = chartOfAccounts.find(c => c.code === '1020');
    if (kbzAcct) kbzAcct.balance += totalWithTax;
  } else if (paymentMethod === 'wavepay') {
    const waveAcct = chartOfAccounts.find(c => c.code === '1030');
    if (waveAcct) waveAcct.balance += totalWithTax;
  }

  // CRM Update
  if (customerPhone && customerPhone !== 'N/A') {
    let customer = customers.find(c => c.phone === customerPhone);
    const addedPoints = Math.floor(totalWithTax / 1000); // 1 point per 1000 MMK

    if (customer) {
      customer.loyaltyPoints += addedPoints;
      customer.totalSpent += totalWithTax;
      if (paymentMethod === 'credit') {
        customer.creditBalance += totalWithTax;
      }
      if (customer.totalSpent >= 15000000) {
        customer.tier = 'VIP';
      } else if (customer.totalSpent >= 8000000) {
        customer.tier = 'Gold';
      } else if (customer.totalSpent >= 3000000) {
        customer.tier = 'Silver';
      }
    } else {
      const newC: Customer = {
        id: `c-${Math.floor(100 + Math.random() * 900)}`,
        name: customerName,
        phone: customerPhone,
        email: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        tier: totalWithTax >= 15000000 ? 'VIP' : (totalWithTax >= 8000000 ? 'Gold' : (totalWithTax >= 3000000 ? 'Silver' : 'Bronze')),
        loyaltyPoints: addedPoints,
        totalSpent: totalWithTax,
        creditBalance: paymentMethod === 'credit' ? totalWithTax : 0,
        createdAt: new Date().toISOString()
      };
      customers.push(newC);
    }
  }

  res.status(201).json(newSale);
});

// --- Sales Ledger ---
app.get('/api/sales', (req, res) => {
  const enrichedSales = posSales.map(sale => {
    const branchName = branches.find(b => b.id === sale.branchId)?.name || 'Unknown';
    return {
      ...sale,
      branchName
    };
  });
  res.json(enrichedSales);
});

// --- CRM Customers ---
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  const { name, phone, email, telegram, facebook, tier } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  const exists = customers.find(c => c.phone === phone);
  if (exists) {
    return res.status(400).json({ error: 'Customer phone already registered.' });
  }

  const newC: Customer = {
    id: `c-${Math.floor(100 + Math.random() * 900)}`,
    name,
    phone,
    email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
    telegram: telegram || '',
    facebook: facebook || '',
    tier: tier || 'Bronze',
    loyaltyPoints: 100, // Sign up points
    totalSpent: 0,
    creditBalance: 0,
    createdAt: new Date().toISOString()
  };

  customers.push(newC);
  res.status(201).json(newC);
});

// --- Repair Center ---
app.get('/api/repairs', (req, res) => {
  const enrichedRepairs = repairTickets.map(rep => {
    const branchName = branches.find(b => b.id === rep.branchId)?.name || 'Unknown';
    return {
      ...rep,
      branchName
    };
  });
  res.json(enrichedRepairs);
});

app.post('/api/repairs', (req, res) => {
  const { customerName, customerPhone, deviceBrand, deviceModel, issueDescription, branchId, estimatedCost, assignedTechnician, warrantyMonths } = req.body;
  if (!customerName || !customerPhone || !deviceBrand || !deviceModel || !issueDescription) {
    return res.status(400).json({ error: 'Missing diagnostic details.' });
  }

  const selectedBranch = branchId || 'b-yangon';
  const finalCost = estimatedCost ? Number(estimatedCost) : 100000;

  const newTicket: RepairTicket = {
    id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
    branchId: selectedBranch,
    customerName,
    customerPhone,
    deviceBrand,
    deviceModel,
    issueDescription,
    status: 'received',
    estimatedCost: finalCost,
    partsUsed: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTechnician: assignedTechnician || employees.find(e => e.branchId === selectedBranch && e.role === 'Technician')?.name || 'Lead Technician',
    technicianNotes: 'Ticket created. Awaiting initial teardown analysis.',
    warrantyMonths: warrantyMonths ? Number(warrantyMonths) : 3
  };

  repairTickets.unshift(newTicket);
  res.status(201).json(newTicket);
});

app.get('/api/repairs/:id', (req, res) => {
  const ticket = repairTickets.find((t) => t.id.toUpperCase() === req.params.id.toUpperCase());
  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404).json({ error: 'Repair ticket not found.' });
  }
});

app.put('/api/repairs/:id', (req, res) => {
  const { status, technicianNotes, estimatedCost, partsUsed, customerSignature } = req.body;
  const ticket = repairTickets.find((t) => t.id.toUpperCase() === req.params.id.toUpperCase());

  if (!ticket) {
    return res.status(404).json({ error: 'Repair ticket not found.' });
  }

  if (status) {
    ticket.status = status;
    if (status === 'ready' || status === 'delivered') {
      // Create automatic notification log
      const logId = `NOT-${Math.floor(1000 + Math.random() * 9000)}`;
      notificationLogs.unshift({
        id: logId,
        channel: 'Telegram',
        recipient: ticket.customerPhone,
        message: `Dear ${ticket.customerName}, your ${ticket.deviceBrand} ${ticket.deviceModel} repair (Ticket: ${ticket.id}) status is now updated to [${status.toUpperCase()}]. Total: ${ticket.estimatedCost.toLocaleString()} MMK. Thank you for choosing AKK Mobile!`,
        sentAt: new Date().toISOString()
      });
    }
  }
  if (technicianNotes) ticket.technicianNotes = technicianNotes;
  if (estimatedCost) ticket.estimatedCost = Number(estimatedCost);
  if (partsUsed) ticket.partsUsed = partsUsed;
  if (customerSignature) ticket.customerSignature = customerSignature;
  ticket.updatedAt = new Date().toISOString();

  res.json(ticket);
});

// --- E-Load / VTU ---
app.get('/api/vtu', (req, res) => {
  res.json(eLoadTransactions);
});

app.post('/api/vtu', (req, res) => {
  const { type, operator, phoneNumber, amount, planDetails, branchId } = req.body;
  if (!type || !operator || !phoneNumber || !amount) {
    return res.status(400).json({ error: 'Missing load attributes.' });
  }

  const txId = `VTU-${Math.floor(10000 + Math.random() * 90000)}`;
  const transaction: ELoadTransaction = {
    id: txId,
    type,
    operator,
    phoneNumber,
    amount: Number(amount),
    planDetails: planDetails || `${operator} ${type === 'airtime' ? 'Refill' : 'Data Pack'}`,
    status: 'completed',
    branchId: branchId || 'b-yangon',
    createdAt: new Date().toISOString()
  };

  eLoadTransactions.unshift(transaction);
  res.status(201).json(transaction);
});

// --- Expenses ---
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  const { branchId, category, amount, description } = req.body;
  if (!branchId || !category || !amount) {
    return res.status(400).json({ error: 'Missing expense indices' });
  }

  const exp: Expense = {
    id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
    branchId,
    category,
    amount: Number(amount),
    description: description || '',
    date: new Date().toISOString()
  };

  expenses.unshift(exp);

  // Deduct from Cash account
  const cashAcct = chartOfAccounts.find(c => c.code === '1010');
  if (cashAcct) cashAcct.balance -= Number(amount);

  // Book to Expense account
  let acctCode = '5300'; // Default marketing/other
  if (category === 'Rent') acctCode = '5100';
  else if (category === 'Utilities') acctCode = '5200';
  const expAcct = chartOfAccounts.find(c => c.code === acctCode);
  if (expAcct) expAcct.balance += Number(amount);

  res.status(201).json(exp);
});

// --- HR Employees ---
app.get('/api/hr', (req, res) => {
  res.json(employees);
});

app.post('/api/hr', (req, res) => {
  const { name, role, branchId, phone, salesTarget, commissionRate } = req.body;
  if (!name || !phone || !role) {
    return res.status(400).json({ error: 'Name, phone and role are required' });
  }

  const newEmp: Employee = {
    id: `emp-00${employees.length + 1}`,
    name,
    role,
    branchId: branchId || 'b-yangon',
    phone,
    attendanceStatus: 'checked_out',
    salesTarget: Number(salesTarget || 5000000),
    currentSales: 0,
    commissionRate: Number(commissionRate || 0.01)
  };

  employees.push(newEmp);
  res.status(201).json(newEmp);
});

// --- Integrations Settings ---
app.get('/api/integrations', (req, res) => {
  res.json(integrationSettings);
});

app.post('/api/integrations', (req, res) => {
  integrationSettings = { ...integrationSettings, ...req.body };
  res.json(integrationSettings);
});

app.post('/api/hr/attendance', (req, res) => {
  const { employeeId, status } = req.body;
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  emp.attendanceStatus = status;
  if (status === 'checked_in') {
    const now = new Date();
    emp.attendanceTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    emp.attendanceTime = undefined;
  }

  res.json(emp);
});

app.post('/api/hr/targets', (req, res) => {
  const { employeeId, target } = req.body;
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  emp.salesTarget = Number(target);
  res.json(emp);
});

// --- Accounting Chart Of Accounts ---
app.get('/api/accounting/coa', (req, res) => {
  res.json(chartOfAccounts);
});

app.get('/api/accounting/closing', (req, res) => {
  res.json(dailyClosings);
});

app.post('/api/accounting/closing', (req, res) => {
  const { branchId, cashSales, kPaySales, wavePaySales, otherDigitalSales, expenseAmount, drawerDifference, closedBy } = req.body;
  if (!branchId || !closedBy) {
    return res.status(400).json({ error: 'Missing daily closing details' });
  }

  const closing: DailyClosing = {
    id: `CLS-${Math.floor(100 + Math.random() * 900)}`,
    branchId,
    closingDate: new Date().toISOString().split('T')[0],
    cashSales: Number(cashSales || 0),
    kPaySales: Number(kPaySales || 0),
    wavePaySales: Number(wavePaySales || 0),
    otherDigitalSales: Number(otherDigitalSales || 0),
    totalSales: Number(cashSales || 0) + Number(kPaySales || 0) + Number(wavePaySales || 0) + Number(otherDigitalSales || 0),
    expenseAmount: Number(expenseAmount || 0),
    drawerDifference: Number(drawerDifference || 0),
    closedBy,
    status: 'audited'
  };

  dailyClosings.unshift(closing);
  res.status(201).json(closing);
});

// --- Online Orders (Simulated Website orders) ---
app.get('/api/online-orders', (req, res) => {
  res.json(onlineOrders);
});

app.post('/api/online-orders', (req, res) => {
  const { customerName, customerPhone, address, items, orderType } = req.body;
  if (!customerName || !customerPhone || !items || !items.length) {
    return res.status(400).json({ error: 'Missing online checkout indices.' });
  }

  let total = 0;
  const parsedItems = items.map((i: any) => {
    const prod = products.find(p => p.id === i.productId);
    const pPrice = prod?.price || 1200000;
    total += pPrice * (i.quantity || 1);
    return {
      productId: i.productId,
      name: prod?.name || 'Accessories SKU',
      price: pPrice,
      quantity: i.quantity || 1
    };
  });

  const order: OnlineOrder = {
    id: `ONL-${Math.floor(200 + Math.random() * 800)}`,
    customerName,
    customerPhone,
    address: address || 'Yangon, Myanmar',
    items: parsedItems,
    totalAmount: total,
    orderType: orderType || 'delivery',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  onlineOrders.unshift(order);
  res.status(201).json(order);
});

app.put('/api/online-orders/:id', (req, res) => {
  const { status } = req.body;
  const order = onlineOrders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status;
  res.json(order);
});

// --- Notifications log ---
app.get('/api/notifications', (req, res) => {
  res.json(notificationLogs);
});

app.post('/api/notifications', (req, res) => {
  const { channel, recipient, message } = req.body;
  if (!recipient || !message) {
    return res.status(400).json({ error: 'Missing notification parameters' });
  }

  const log: NotificationLog = {
    id: `NOT-${Math.floor(1000 + Math.random() * 9000)}`,
    channel: channel || 'SMS',
    recipient,
    message,
    sentAt: new Date().toISOString()
  };

  notificationLogs.unshift(log);
  res.status(201).json(log);
});

// ==========================================
// GEMINI INTELLIGENT BUSINESS ANALYST
// ==========================================
app.post('/api/assistant', async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Inquiry message payload is required.' });
  }

  // Compile full localized Myanmar ERP context for Gemini to read
  const catalogStr = products.map(p => `- [ID: ${p.id}] ${p.name} (${p.brand}) Category: ${p.category} Price: ${p.price.toLocaleString()} MMK`).join('\n');
  const inventoryStr = branchInventories.map(inv => {
    const b = branches.find(branch => branch.id === inv.branchId)?.name || inv.branchId;
    const p = products.find(prod => prod.id === inv.productId)?.name || inv.productId;
    return `- ${b}: ${p} (Stock: ${inv.stock} units, Alert Threshold: ${inv.minAlertThreshold})`;
  }).join('\n');

  const crmStr = customers.map(c => `- ${c.name} (Tier: ${c.tier}, Phone: ${c.phone}, Spent: ${c.totalSpent.toLocaleString()} MMK, points: ${c.loyaltyPoints})`).join('\n');
  const activeTickets = repairTickets.map(r => `- [${r.id}] ${r.customerName}'s ${r.deviceBrand} ${r.deviceModel} is [${r.status.toUpperCase()}] at branch ${r.branchId}. Est. Cost: ${r.estimatedCost.toLocaleString()} MMK`).join('\n');
  const recentSalesStr = posSales.slice(0, 10).map(s => `- Sale [${s.id}] at ${s.branchId}: ${s.totalAmount.toLocaleString()} MMK paid via ${s.paymentMethod.toUpperCase()} for ${s.items.length} item(s)`).join('\n');
  
  const totalRevenue = posSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netEarnings = totalRevenue - totalExpenses;

  const systemPrompt = `You are "AKK Mobile Enterprise Brain", an elite AI Business Intelligence Director and CRM Agent for AKK Mobile, based in Myanmar. 
You possess full access to the real-time Cloud POS database, CRM directories, multi-branch inventories, financial ledger accounts, and service center tickets.
Your objective is to provide high-fidelity, extremely professional, data-driven answers to operators, or respond gracefully to CRM customer service inquiries.

--- LIVE AKK ENTERPRISE DATABASE ---
LOCAL BUSINESS REGION: Myanmar (Burmese / English)
CURRENCY: Myanmar Kyat (MMK)
BRANCHES:
- Yangon HQ: Kaba Aye Pagoda Road (Managed by U Kyaw Swar)
- Mandalay Branch: 73rd Street (Managed by Daw Hla Hla)
- Naypyitaw Store: Thiri Mandalar Market (Managed by U Aung Ko)

GLOBAL HARDWARE CATALOG:
${catalogStr}

CURRENT MULTI-BRANCH STOCK LEVELS:
${inventoryStr}

LOW STOCK ALERT EXCEPTIONS:
${branchInventories.filter(i => i.stock <= i.minAlertThreshold).map(i => {
  const b = branches.find(branch => branch.id === i.branchId)?.name;
  const p = products.find(prod => prod.id === i.productId)?.name;
  return `- ${p} at ${b} is critically low! (${i.stock} units left, Min limit is ${i.minAlertThreshold})`;
}).join('\n') || 'None. All inventories stable.'}

CRM LOYALTY DATABASE:
${crmStr}

SERVICE LAB REPAIR TICKETS:
${activeTickets}

LATEST 10 TRANSACTION LOGS:
${recentSalesStr}

FINANCIALS TOTALS (MMK):
- Total System Revenue: ${totalRevenue.toLocaleString()} MMK
- System Expenses: ${totalExpenses.toLocaleString()} MMK
- Net Operating Income: ${netEarnings.toLocaleString()} MMK
----------------------------------

YOUR INSTRUCTIONS & SKILLS:
1. Sales Forecast & Intelligence: If asked about predictions, demand, or branch comparisons, provide a thorough, structured response. Use clean table lists and bullet points. Propose actual numbers styled in MMK.
2. Smart Inventory Balancing: Propose stock transfers (e.g. "We can dispatch 5 units of iPhone 17 Pro Max from Yangon HQ which has 18 units to Mandalay Branch which only has 4 units").
3. VIP Recommendations: Propose personalized promo items based on spending patterns or brand preference.
4. Professional & Polite: Keep your tone authoritative, analytical, and highly structured. Do not output raw JSON unless specifically requested. Avoid hallucinated IDs. Feel free to use appropriate Myanmar terms like "U" (Mr.) and "Daw" (Ms.) when referencing staff or VIP clients.

PREVIOUS CHAT:
${(chatHistory || []).map((h: any) => `${h.sender === 'user' ? 'Operator' : 'AI'}: ${h.text}`).join('\n')}

LATEST INQUIRY: "${message}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
      config: {
        systemInstruction: 'You are the intelligent business intelligence engine for AKK Mobile Enterprise Suite, localized to Myanmar.',
      }
    });

    res.json({ text: response.text || "Synchronizations stable. Query parsed." });
  } catch (error: any) {
    console.error('Gemini Enterprise assistant failed:', error);
    res.status(500).json({
      error: 'Failed to access AI Intelligence Core',
      details: error.message || String(error)
    });
  }
});

// Setup database-backed API routes
setupDatabaseRoutes(app);

// Integrate Vite middleware for development, or serve static assets in production
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] AKK Mobile Enterprise backend operational on port ${PORT}`);
});
