// AKK Mobile Enterprise Suite Global Types

export type TabType = 'pos' | 'erp' | 'crm' | 'ai' | 'admin';
export type SubTabType = 'inventory' | 'transfers' | 'finance' | 'hr' | 'expenses' | 'online_orders' | 'repair' | 'loyalty' | 'campaign' | 'eload';
export type RepairStatus = 'received' | 'diagnostic' | 'repairing' | 'testing' | 'ready' | 'delivered';
export type PaymentMethod = 'cash' | 'kbzpay' | 'wavepay' | 'ayapay' | 'cbpay' | 'uabpay' | 'credit' | 'split';
export type BranchId = 'b-yangon' | 'b-mandalay' | 'b-naypyitaw';

// ENTERPRISE RBAC TYPES
export type RoleType = 'Owner' | 'Super Admin' | 'Admin' | 'Branch Manager' | 'Cashier' | 'Sales' | 'Technician' | 'Warehouse' | 'Inventory Manager' | 'Purchasing Officer' | 'Accountant' | 'HR Manager' | 'Customer Service' | 'Marketing' | 'Auditor' | 'Read Only' | 'Customer';
export type PermissionLevel = 'none' | 'read' | 'write' | 'approve';
export type BranchRestriction = 'none' | 'assigned_only' | 'assigned_and_downstream';
export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'logout' | 'password_change' | 'permission_change' | 'export' | 'print';
export type AuditResourceType = 'user' | 'role' | 'permission' | 'branch' | 'employee' | 'product' | 'inventory' | 'sale' | 'repair' | 'customer' | 'expense' | 'transfer' | 'setting' | 'attendance' | 'leave' | 'payroll' | 'approval' | 'purchase' | 'discount' | 'refund';
export type ApprovalLevel = 'manager' | 'admin' | 'super_admin' | 'owner';
export type ApprovalType = 'discount' | 'refund' | 'stock_adjustment' | 'purchase' | 'expense' | 'transfer' | 'salary' | 'leave' | 'delete';

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

// ==========================================
// ENTERPRISE RBAC & SECURITY
// ==========================================
export interface CRUDPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface FinancialPermissions {
  viewReports: boolean;
  manageTaxes: boolean;
  manageDiscounts: boolean;
  approveRefunds: boolean;
  manageBanks: boolean;
  viewPaymentMethods: boolean;
}

export interface InventoryPermissions {
  viewInventory: boolean;
  adjustStock: boolean;
  manageTransfers: boolean;
  viewWarehouses: boolean;
  managePurchaseOrders: boolean;
}

export interface RepairPermissions {
  viewTickets: boolean;
  createTickets: boolean;
  updateStatus: boolean;
  assignTechnician: boolean;
  completeRepair: boolean;
  approveWarranty: boolean;
}

export interface CustomerPermissions {
  viewProfiles: boolean;
  createProfiles: boolean;
  manageLoyalty: boolean;
  viewHistory: boolean;
  manageCommunication: boolean;
}

export interface ApprovalPermissions {
  approveDiscounts: boolean;
  approveRefunds: boolean;
  approveStockAdjustment: boolean;
  approvePurchases: boolean;
  approveExpenses: boolean;
  approveTransfers: boolean;
  approveSalary: boolean;
  approveLeave: boolean;
  approveDelete: boolean;
}

export interface PermissionSchema {
  // Module access
  modules: {
    pos: boolean;
    inventory: boolean;
    finance: boolean;
    hr: boolean;
    repairs: boolean;
    crm: boolean;
    vtu: boolean;
    settings: boolean;
    auditLogs: boolean;
    userManagement: boolean;
  };
  
  // Basic CRUD operations
  crud: CRUDPermissions;
  
  // Financial permissions
  financial: FinancialPermissions;
  
  // Inventory permissions
  inventory: InventoryPermissions;
  
  // Repair permissions
  repair: RepairPermissions;
  
  // Customer permissions
  customer: CustomerPermissions;
  
  // Approval workflow permissions
  approvals: ApprovalPermissions;
  
  // Advanced features
  features: {
    approveReject: boolean;
    branchRestriction: BranchRestriction;
    warehouseRestriction: 'none' | 'assigned_only';
    apiAccess: PermissionLevel;
    advancedSettings: boolean;
    pageVisibility: string[];
    featureToggles: Record<string, boolean>;
    restrictReports: string[]; // report IDs to restrict
    restrictFinancialData: boolean;
    twoFactorRequired: boolean;
    ipRestriction: string[];
  };
}

export interface Role {
  id: string;
  name: RoleType;
  isSystem: boolean;
  description: string;
  permissions: PermissionSchema;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  branchId: BranchId;
  isActive: boolean;
  passwordHash: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName: string;
  branchId: BranchId;
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  timestamp: string;
}

export interface ActivityTimeline {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName: string;
  branchId: BranchId;
  timestamp: string;
  icon?: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  resourceType?: AuditResourceType;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FeatureToggle {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  roles: RoleType[];
  branches: BranchId[];
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  branchId: BranchId;
  manager: string;
  description: string;
  createdAt: string;
}

export interface Position {
  id: string;
  name: string;
  departmentId: string;
  baseSalary: number;
  commission: number;
  responsibilities: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  branchId: BranchId;
  location: string;
  capacity: number;
  manager: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  createdAt: string;
}

export interface Model {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  category: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedHours: number;
  createdAt: string;
}

export interface RepairType {
  id: string;
  name: string;
  category: string;
  standardPrice: number;
  estimatedDays: number;
  createdAt: string;
}

export interface Tax {
  id: string;
  name: string;
  rate: number; // percentage
  applicable: ('products' | 'services')[];
  createdAt: string;
}

export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  applicableTo: ('products' | 'services')[];
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  tiers: Array<{
    tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
    minPoints: number;
    maxPoints: number;
    benefits: string[];
  }>;
  pointsPerUnit: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  createdAt: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
  isActive: boolean;
  config: Record<string, string>;
  createdAt: string;
}

export interface Bank {
  id: string;
  name: string;
  accountNumber: string;
  accountName: string;
  branchName: string;
  createdAt: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  taxId: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  taxRate: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// APPROVAL WORKFLOW TYPES
// ==========================================
export interface ApprovalRequest {
  id: string;
  requestType: ApprovalType;
  requesterId: string;
  requesterName: string;
  requesterRole: RoleType;
  requesterBranch: BranchId;
  resourceId: string;
  resourceType: AuditResourceType;
  resourceName: string;
  description: string;
  amount?: number;
  data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  approvalChain: Array<{
    level: ApprovalLevel;
    approvers: string[];
    approvedBy?: string;
    approverName?: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp?: string;
    comments?: string;
  }>;
  currentLevel: ApprovalLevel;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface ApprovalNotification {
  id: string;
  userId: string;
  approvalRequestId: string;
  requestType: ApprovalType;
  requesterName: string;
  description: string;
  isRead: boolean;
  createdAt: string;
}

// ==========================================
// USER MANAGEMENT TYPES
// ==========================================
export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  photo: string;
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  branchId: BranchId;
  leader: string;
  members: string[];
  description: string;
  createdAt: string;
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  employeeId: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionName: string;
  teamId?: string;
  teamName?: string;
  branchId: BranchId;
  branchName: string;
  joinDate: string;
  baseSalary: number;
  commissionRate: number;
  reportingTo: string;
  reportingToName: string;
  certifications: Array<{
    name: string;
    issueDate: string;
    expiryDate: string;
  }>;
  documents: Array<{
    name: string;
    type: string;
    fileUrl: string;
    uploadedDate: string;
  }>;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  terminationDate?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  branchId: BranchId;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  workHours: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'remote';
  notes?: string;
  approvedBy?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'sick' | 'casual' | 'personal' | 'maternity' | 'unpaid' | 'other';
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  comments?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  branchId: BranchId;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  bonuses: number;
  deductions: number;
  taxes: number;
  netSalary: number;
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  approvedBy?: string;
  paidDate?: string;
  createdAt: string;
}

export interface CommissionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  salesAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
}

// ==========================================
// SECURITY & AUDIT TYPES
// ==========================================
export interface SessionInfo {
  id: string;
  userId: string;
  userName: string;
  role: RoleType;
  branchId: BranchId;
  loginTime: string;
  logoutTime?: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  deviceName: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  isActive: boolean;
  lastActivityTime: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  deviceFingerprint: string;
  status: 'success' | 'failed';
  failureReason?: string;
  timestamp: string;
}

export interface FailedLoginAlert {
  id: string;
  userId: string;
  userName: string;
  email: string;
  attemptCount: number;
  firstAttemptTime: string;
  lastAttemptTime: string;
  ipAddresses: string[];
  status: 'active' | 'resolved';
  alertSentAt: string;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  userName: string;
  eventType: 'permission_denied' | 'unauthorized_access' | 'data_export' | 'password_change' | 'role_change' | 'two_fa_disabled' | 'session_timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  resolved: boolean;
}

export interface PasswordPolicy {
  id: string;
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
  historyCount: number;
  lockoutAttempts: number;
  lockoutDuration: number;
  twoFactorRequired: boolean;
  updatedAt: string;
}

export interface AuditLogDetail extends AuditLog {
  changedFields: Array<{
    fieldName: string;
    oldValue: any;
    newValue: any;
  }>;
  device: SessionInfo;
}
