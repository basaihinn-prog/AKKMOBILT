// AKK Mobile Enterprise Suite Global Types

export type TabType = 'pos' | 'erp' | 'crm' | 'ai' | 'admin';
export type SubTabType = 'inventory' | 'transfers' | 'finance' | 'hr' | 'expenses' | 'online_orders' | 'repair' | 'loyalty' | 'campaign' | 'eload';
export type RepairStatus = 'received' | 'diagnostic' | 'repairing' | 'testing' | 'ready' | 'delivered';
export type PaymentMethod = 'cash' | 'kbzpay' | 'wavepay' | 'ayapay' | 'cbpay' | 'uabpay' | 'credit' | 'split';
export type BranchId = 'b-yangon' | 'b-mandalay' | 'b-naypyitaw';

export interface Branch {
  id: BranchId;
  name: string;
  city: string;
  manager: string;
  phone: string;
}

export interface PhoneProduct {
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

export interface JoinedInventory {
  branchId: BranchId;
  productId: string;
  stock: number;
  minAlertThreshold: number;
  productName: string;
  productBrand: string;
  productPrice: number;
  productImage: string;
  branchName: string;
}

export interface StockTransfer {
  id: string;
  productId: string;
  productName: string;
  fromBranchId: BranchId;
  toBranchId: BranchId;
  fromBranchName: string;
  toBranchName: string;
  quantity: number;
  status: 'pending' | 'shipped' | 'delivered';
  requestedBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  telegram?: string;
  facebook?: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  loyaltyPoints: number;
  totalSpent: number; // in MMK
  creditBalance: number; // in MMK
  createdAt: string;
}

export interface PosSale {
  id: string;
  branchId: BranchId;
  branchName: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    name: string;
    price: number; // in MMK
    color: string;
    quantity: number;
  }>;
  taxAmount: number; // in MMK
  discountAmount: number; // in MMK
  totalAmount: number; // in MMK
  paymentMethod: PaymentMethod;
  cashierName: string;
  createdAt: string;
}

export interface RepairTicket {
  id: string;
  branchId: BranchId;
  branchName?: string;
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
  customerSignature?: string;
  warrantyMonths: number;
}

export interface VtuTransaction {
  id: string;
  type: 'airtime' | 'data';
  operator: 'MPT' | 'Atom' | 'Ooredoo' | 'Mytel';
  phoneNumber: string;
  amount: number; // in MMK
  planDetails?: string;
  status: 'pending' | 'completed' | 'failed';
  branchId: BranchId;
  createdAt: string;
}

export interface Expense {
  id: string;
  branchId: BranchId;
  category: 'Rent' | 'Salary' | 'Utilities' | 'Marketing' | 'Repair Parts' | 'Other';
  amount: number; // in MMK
  description: string;
  date: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Owner' | 'Branch Manager' | 'Cashier' | 'Sales' | 'Technician' | 'Accountant';
  branchId: BranchId;
  phone: string;
  attendanceStatus: 'checked_in' | 'checked_out' | 'absent';
  attendanceTime?: string;
  salesTarget: number; // in MMK
  currentSales: number; // in MMK
  commissionRate: number;
}

export interface ChartOfAccount {
  code: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number; // in MMK
}

export interface DailyClosing {
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

export interface OnlineOrder {
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

export interface NotificationLog {
  id: string;
  channel: 'SMS' | 'Telegram' | 'Email';
  recipient: string;
  message: string;
  sentAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  color: string;
  quantity: number;
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}
