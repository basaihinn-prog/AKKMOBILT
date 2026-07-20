import { RoleType, PermissionSchema, CRUDPermissions, BranchId, User, ApprovalType } from '../types';

// ==========================================
// ROLE DEFINITIONS WITH FULL PERMISSIONS
// ==========================================

const ROLE_DEFINITIONS: Record<RoleType, { description: string; permissions: PermissionSchema }> = {
  'Owner': {
    description: 'Full system access with ownership rights',
    permissions: {
      modules: {
        pos: true,
        inventory: true,
        finance: true,
        hr: true,
        repairs: true,
        crm: true,
        vtu: true,
        settings: true,
        auditLogs: true,
        userManagement: true,
      },
      crud: { create: true, read: true, update: true, delete: true },
      financial: {
        viewReports: true,
        manageTaxes: true,
        manageDiscounts: true,
        approveRefunds: true,
        manageBanks: true,
        viewPaymentMethods: true,
      },
      inventory: {
        viewInventory: true,
        adjustStock: true,
        manageTransfers: true,
        viewWarehouses: true,
        managePurchaseOrders: true,
      },
      repair: {
        viewTickets: true,
        createTickets: true,
        updateStatus: true,
        assignTechnician: true,
        completeRepair: true,
        approveWarranty: true,
      },
      customer: {
        viewProfiles: true,
        createProfiles: true,
        manageLoyalty: true,
        viewHistory: true,
        manageCommunication: true,
      },
      approvals: {
        approveDiscounts: true,
        approveRefunds: true,
        approveStockAdjustment: true,
        approvePurchases: true,
        approveExpenses: true,
        approveTransfers: true,
        approveSalary: true,
        approveLeave: true,
        approveDelete: true,
      },
      features: {
        approveReject: true,
        branchRestriction: 'none',
        warehouseRestriction: 'none',
        apiAccess: 'write',
        advancedSettings: true,
        pageVisibility: ['*'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: false,
        twoFactorRequired: true,
        ipRestriction: [],
      },
    },
  },
  'Super Admin': {
    description: 'Complete administrative control across all branches',
    permissions: {
      modules: {
        pos: true,
        inventory: true,
        finance: true,
        hr: true,
        repairs: true,
        crm: true,
        vtu: true,
        settings: true,
        auditLogs: true,
        userManagement: true,
      },
      crud: { create: true, read: true, update: true, delete: true },
      financial: {
        viewReports: true,
        manageTaxes: true,
        manageDiscounts: true,
        approveRefunds: true,
        manageBanks: true,
        viewPaymentMethods: true,
      },
      inventory: {
        viewInventory: true,
        adjustStock: true,
        manageTransfers: true,
        viewWarehouses: true,
        managePurchaseOrders: true,
      },
      repair: {
        viewTickets: true,
        createTickets: true,
        updateStatus: true,
        assignTechnician: true,
        completeRepair: true,
        approveWarranty: true,
      },
      customer: {
        viewProfiles: true,
        createProfiles: true,
        manageLoyalty: true,
        viewHistory: true,
        manageCommunication: true,
      },
      approvals: {
        approveDiscounts: true,
        approveRefunds: true,
        approveStockAdjustment: true,
        approvePurchases: true,
        approveExpenses: true,
        approveTransfers: true,
        approveSalary: true,
        approveLeave: true,
        approveDelete: true,
      },
      features: {
        approveReject: true,
        branchRestriction: 'none',
        warehouseRestriction: 'none',
        apiAccess: 'write',
        advancedSettings: true,
        pageVisibility: ['*'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: false,
        twoFactorRequired: true,
        ipRestriction: [],
      },
    },
  },
  'Admin': {
    description: 'Administrative access across assigned branch',
    permissions: {
      modules: {
        pos: true,
        inventory: true,
        finance: true,
        hr: true,
        repairs: true,
        crm: true,
        vtu: true,
        settings: false,
        auditLogs: true,
        userManagement: true,
      },
      crud: { create: true, read: true, update: true, delete: true },
      financial: {
        viewReports: true,
        manageTaxes: false,
        manageDiscounts: true,
        approveRefunds: true,
        manageBanks: false,
        viewPaymentMethods: true,
      },
      inventory: {
        viewInventory: true,
        adjustStock: true,
        manageTransfers: true,
        viewWarehouses: true,
        managePurchaseOrders: true,
      },
      repair: {
        viewTickets: true,
        createTickets: true,
        updateStatus: true,
        assignTechnician: true,
        completeRepair: true,
        approveWarranty: true,
      },
      customer: {
        viewProfiles: true,
        createProfiles: true,
        manageLoyalty: true,
        viewHistory: true,
        manageCommunication: true,
      },
      approvals: {
        approveDiscounts: true,
        approveRefunds: true,
        approveStockAdjustment: true,
        approvePurchases: true,
        approveExpenses: true,
        approveTransfers: true,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: true,
        branchRestriction: 'assigned_only',
        warehouseRestriction: 'none',
        apiAccess: 'write',
        advancedSettings: false,
        pageVisibility: ['pos', 'inventory', 'finance', 'hr', 'repairs', 'crm', 'vtu', 'auditLogs'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: false,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Branch Manager': {
    description: 'Manages operations for assigned branch',
    permissions: {
      modules: {
        pos: true,
        inventory: true,
        finance: true,
        hr: true,
        repairs: true,
        crm: true,
        vtu: true,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: true, read: true, update: true, delete: false },
      financial: {
        viewReports: true,
        manageTaxes: false,
        manageDiscounts: true,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: true,
      },
      inventory: {
        viewInventory: true,
        adjustStock: true,
        manageTransfers: true,
        viewWarehouses: true,
        managePurchaseOrders: true,
      },
      repair: {
        viewTickets: true,
        createTickets: true,
        updateStatus: true,
        assignTechnician: true,
        completeRepair: true,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: true,
        createProfiles: true,
        manageLoyalty: true,
        viewHistory: true,
        manageCommunication: true,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: true,
        approvePurchases: true,
        approveExpenses: true,
        approveTransfers: true,
        approveSalary: false,
        approveLeave: true,
        approveDelete: false,
      },
      features: {
        approveReject: true,
        branchRestriction: 'assigned_only',
        warehouseRestriction: 'assigned_only',
        apiAccess: 'write',
        advancedSettings: false,
        pageVisibility: ['pos', 'inventory', 'finance', 'hr', 'repairs', 'crm', 'vtu'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: false,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Cashier': {
    description: 'Handles point-of-sale transactions',
    permissions: {
      modules: {
        pos: true,
        inventory: false,
        finance: false,
        hr: false,
        repairs: false,
        crm: false,
        vtu: true,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: true, read: true, update: false, delete: false },
      financial: {
        viewReports: false,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: true,
      },
      inventory: {
        viewInventory: true,
        adjustStock: false,
        manageTransfers: false,
        viewWarehouses: false,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: false,
        createTickets: false,
        updateStatus: false,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: true,
        createProfiles: true,
        manageLoyalty: false,
        viewHistory: true,
        manageCommunication: false,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'assigned_only',
        warehouseRestriction: 'none',
        apiAccess: 'read',
        advancedSettings: false,
        pageVisibility: ['pos', 'vtu'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: true,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Sales': {
    description: 'Manages customer sales and relationships',
    permissions: {
      modules: {
        pos: true,
        inventory: true,
        finance: false,
        hr: false,
        repairs: true,
        crm: true,
        vtu: false,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: true, read: true, update: true, delete: false },
      financial: {
        viewReports: false,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: false,
      },
      inventory: {
        viewInventory: true,
        adjustStock: false,
        manageTransfers: false,
        viewWarehouses: false,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: true,
        createTickets: true,
        updateStatus: true,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: true,
        createProfiles: true,
        manageLoyalty: true,
        viewHistory: true,
        manageCommunication: true,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'assigned_only',
        warehouseRestriction: 'none',
        apiAccess: 'read',
        advancedSettings: false,
        pageVisibility: ['pos', 'inventory', 'repairs', 'crm'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: true,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Technician': {
    description: 'Handles device repair operations',
    permissions: {
      modules: {
        pos: false,
        inventory: true,
        finance: false,
        hr: false,
        repairs: true,
        crm: false,
        vtu: false,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: true, read: true, update: true, delete: false },
      financial: {
        viewReports: false,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: false,
      },
      inventory: {
        viewInventory: true,
        adjustStock: true,
        manageTransfers: false,
        viewWarehouses: false,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: true,
        createTickets: true,
        updateStatus: true,
        assignTechnician: false,
        completeRepair: true,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: true,
        createProfiles: false,
        manageLoyalty: false,
        viewHistory: true,
        manageCommunication: false,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'assigned_only',
        warehouseRestriction: 'none',
        apiAccess: 'read',
        advancedSettings: false,
        pageVisibility: ['inventory', 'repairs'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: true,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Warehouse': {
    description: 'Manages warehouse inventory and stock',
    permissions: {
      modules: {
        pos: false,
        inventory: true,
        finance: false,
        hr: false,
        repairs: false,
        crm: false,
        vtu: false,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: true, read: true, update: true, delete: false },
      financial: {
        viewReports: false,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: false,
      },
      inventory: {
        viewInventory: true,
        adjustStock: true,
        manageTransfers: true,
        viewWarehouses: true,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: false,
        createTickets: false,
        updateStatus: false,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: false,
        createProfiles: false,
        manageLoyalty: false,
        viewHistory: false,
        manageCommunication: false,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'assigned_only',
        warehouseRestriction: 'assigned_only',
        apiAccess: 'read',
        advancedSettings: false,
        pageVisibility: ['inventory'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: true,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Inventory Manager': {
    description: 'Manages inventory, stock levels, and orders',
    permissions: {
      modules: {
        pos: false,
        inventory: true,
        finance: true,
        hr: false,
        repairs: false,
        crm: false,
        vtu: false,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: true, read: true, update: true, delete: false },
      financial: {
        viewReports: true,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: false,
      },
      inventory: {
        viewInventory: true,
        adjustStock: true,
        manageTransfers: true,
        viewWarehouses: true,
        managePurchaseOrders: true,
      },
      repair: {
        viewTickets: false,
        createTickets: false,
        updateStatus: false,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: false,
        createProfiles: false,
        manageLoyalty: false,
        viewHistory: false,
        manageCommunication: false,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: true,
        approvePurchases: true,
        approveExpenses: false,
        approveTransfers: true,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: true,
        branchRestriction: 'assigned_only',
        warehouseRestriction: 'none',
        apiAccess: 'write',
        advancedSettings: false,
        pageVisibility: ['inventory', 'finance'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: false,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Purchasing Officer': {
    description: 'Manages supplier purchases and orders',
    permissions: {
      modules: {
        pos: false,
        inventory: true,
        finance: true,
        hr: false,
        repairs: false,
        crm: false,
        vtu: false,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: true, read: true, update: true, delete: false },
      financial: {
        viewReports: true,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: true,
      },
      inventory: {
        viewInventory: true,
        adjustStock: false,
        manageTransfers: false,
        viewWarehouses: true,
        managePurchaseOrders: true,
      },
      repair: {
        viewTickets: false,
        createTickets: false,
        updateStatus: false,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: false,
        createProfiles: false,
        manageLoyalty: false,
        viewHistory: false,
        manageCommunication: false,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'none',
        warehouseRestriction: 'none',
        apiAccess: 'write',
        advancedSettings: false,
        pageVisibility: ['inventory', 'finance'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: false,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Accountant': {
    description: 'Manages financial records and reporting',
    permissions: {
      modules: {
        pos: false,
        inventory: true,
        finance: true,
        hr: false,
        repairs: false,
        crm: false,
        vtu: false,
        settings: false,
        auditLogs: true,
        userManagement: false,
      },
      crud: { create: true, read: true, update: true, delete: false },
      financial: {
        viewReports: true,
        manageTaxes: true,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: true,
        viewPaymentMethods: true,
      },
      inventory: {
        viewInventory: true,
        adjustStock: false,
        manageTransfers: false,
        viewWarehouses: false,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: false,
        createTickets: false,
        updateStatus: false,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: false,
        createProfiles: false,
        manageLoyalty: false,
        viewHistory: false,
        manageCommunication: false,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'none',
        warehouseRestriction: 'none',
        apiAccess: 'read',
        advancedSettings: false,
        pageVisibility: ['inventory', 'finance', 'auditLogs'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: false,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'HR Manager': {
    description: 'Manages human resources and employee data',
    permissions: {
      modules: {
        pos: false,
        inventory: false,
        finance: true,
        hr: true,
        repairs: false,
        crm: false,
        vtu: false,
        settings: false,
        auditLogs: true,
        userManagement: true,
      },
      crud: { create: true, read: true, update: true, delete: false },
      financial: {
        viewReports: true,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: false,
      },
      inventory: {
        viewInventory: false,
        adjustStock: false,
        manageTransfers: false,
        viewWarehouses: false,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: false,
        createTickets: false,
        updateStatus: false,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: false,
        createProfiles: false,
        manageLoyalty: false,
        viewHistory: false,
        manageCommunication: false,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: true,
        approveLeave: true,
        approveDelete: false,
      },
      features: {
        approveReject: true,
        branchRestriction: 'none',
        warehouseRestriction: 'none',
        apiAccess: 'write',
        advancedSettings: false,
        pageVisibility: ['finance', 'hr', 'userManagement', 'auditLogs'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: false,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Customer Service': {
    description: 'Handles customer support and communication',
    permissions: {
      modules: {
        pos: false,
        inventory: false,
        finance: false,
        hr: false,
        repairs: true,
        crm: true,
        vtu: false,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: true, read: true, update: true, delete: false },
      financial: {
        viewReports: false,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: false,
      },
      inventory: {
        viewInventory: false,
        adjustStock: false,
        manageTransfers: false,
        viewWarehouses: false,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: true,
        createTickets: true,
        updateStatus: true,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: true,
        createProfiles: true,
        manageLoyalty: false,
        viewHistory: true,
        manageCommunication: true,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'none',
        warehouseRestriction: 'none',
        apiAccess: 'read',
        advancedSettings: false,
        pageVisibility: ['repairs', 'crm'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: true,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Marketing': {
    description: 'Manages marketing campaigns and promotions',
    permissions: {
      modules: {
        pos: false,
        inventory: false,
        finance: false,
        hr: false,
        repairs: false,
        crm: true,
        vtu: false,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: true, read: true, update: true, delete: false },
      financial: {
        viewReports: false,
        manageTaxes: false,
        manageDiscounts: true,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: false,
      },
      inventory: {
        viewInventory: false,
        adjustStock: false,
        manageTransfers: false,
        viewWarehouses: false,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: false,
        createTickets: false,
        updateStatus: false,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: true,
        createProfiles: false,
        manageLoyalty: true,
        viewHistory: true,
        manageCommunication: true,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'none',
        warehouseRestriction: 'none',
        apiAccess: 'read',
        advancedSettings: false,
        pageVisibility: ['crm'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: true,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Auditor': {
    description: 'Reviews audit logs and compliance records (read-only)',
    permissions: {
      modules: {
        pos: false,
        inventory: true,
        finance: true,
        hr: true,
        repairs: true,
        crm: true,
        vtu: true,
        settings: false,
        auditLogs: true,
        userManagement: true,
      },
      crud: { create: false, read: true, update: false, delete: false },
      financial: {
        viewReports: true,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: true,
      },
      inventory: {
        viewInventory: true,
        adjustStock: false,
        manageTransfers: false,
        viewWarehouses: true,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: true,
        createTickets: false,
        updateStatus: false,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: true,
        createProfiles: false,
        manageLoyalty: false,
        viewHistory: true,
        manageCommunication: false,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'none',
        warehouseRestriction: 'none',
        apiAccess: 'read',
        advancedSettings: false,
        pageVisibility: ['inventory', 'finance', 'hr', 'repairs', 'crm', 'vtu', 'auditLogs'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: false,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Read Only': {
    description: 'View-only access across all modules',
    permissions: {
      modules: {
        pos: true,
        inventory: true,
        finance: true,
        hr: true,
        repairs: true,
        crm: true,
        vtu: true,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: false, read: true, update: false, delete: false },
      financial: {
        viewReports: true,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: true,
      },
      inventory: {
        viewInventory: true,
        adjustStock: false,
        manageTransfers: false,
        viewWarehouses: true,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: true,
        createTickets: false,
        updateStatus: false,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: true,
        createProfiles: false,
        manageLoyalty: false,
        viewHistory: true,
        manageCommunication: false,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'none',
        warehouseRestriction: 'none',
        apiAccess: 'none',
        advancedSettings: false,
        pageVisibility: ['pos', 'inventory', 'finance', 'hr', 'repairs', 'crm', 'vtu'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: false,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
  'Customer': {
    description: 'Limited customer portal access',
    permissions: {
      modules: {
        pos: false,
        inventory: false,
        finance: false,
        hr: false,
        repairs: true,
        crm: false,
        vtu: false,
        settings: false,
        auditLogs: false,
        userManagement: false,
      },
      crud: { create: false, read: true, update: false, delete: false },
      financial: {
        viewReports: false,
        manageTaxes: false,
        manageDiscounts: false,
        approveRefunds: false,
        manageBanks: false,
        viewPaymentMethods: false,
      },
      inventory: {
        viewInventory: false,
        adjustStock: false,
        manageTransfers: false,
        viewWarehouses: false,
        managePurchaseOrders: false,
      },
      repair: {
        viewTickets: true,
        createTickets: true,
        updateStatus: false,
        assignTechnician: false,
        completeRepair: false,
        approveWarranty: false,
      },
      customer: {
        viewProfiles: true,
        createProfiles: false,
        manageLoyalty: false,
        viewHistory: true,
        manageCommunication: false,
      },
      approvals: {
        approveDiscounts: false,
        approveRefunds: false,
        approveStockAdjustment: false,
        approvePurchases: false,
        approveExpenses: false,
        approveTransfers: false,
        approveSalary: false,
        approveLeave: false,
        approveDelete: false,
      },
      features: {
        approveReject: false,
        branchRestriction: 'none',
        warehouseRestriction: 'none',
        apiAccess: 'none',
        advancedSettings: false,
        pageVisibility: ['repairs'],
        featureToggles: {},
        restrictReports: [],
        restrictFinancialData: true,
        twoFactorRequired: false,
        ipRestriction: [],
      },
    },
  },
};

// ==========================================
// RBAC ENGINE - PERMISSION CHECKING
// ==========================================

export class RBACEngine {
  /**
   * Get role definition with all permissions
   */
  static getRoleDefinition(role: RoleType): PermissionSchema {
    return ROLE_DEFINITIONS[role]?.permissions || ROLE_DEFINITIONS['Customer'].permissions;
  }

  /**
   * Check if user has permission to access a module
   */
  static canAccessModule(userRole: RoleType, module: keyof PermissionSchema['modules']): boolean {
    const permissions = this.getRoleDefinition(userRole);
    return permissions.modules[module] === true;
  }

  /**
   * Check if user can perform CRUD operation
   */
  static canCRUD(userRole: RoleType, operation: 'create' | 'read' | 'update' | 'delete'): boolean {
    const permissions = this.getRoleDefinition(userRole);
    return permissions.crud[operation] === true;
  }

  /**
   * Check if user can perform a specific action
   */
  static canPerformAction(userRole: RoleType, action: string): boolean {
    const permissions = this.getRoleDefinition(userRole);
    // Parse action like 'financial.viewReports' or 'approvals.approveDiscounts'
    const [section, actionName] = action.split('.');
    if (!section || !actionName) return false;
    
    const sectionPerms = (permissions as any)[section];
    return sectionPerms?.[actionName] === true;
  }

  /**
   * Get approval chain for a request type
   */
  static getApprovalChain(userRole: RoleType, approvalType: ApprovalType): ApprovalLevel[] {
    const chain: ApprovalLevel[] = [];

    // Add initial approver level based on requesting user's role
    if (['Cashier', 'Sales', 'Technician', 'Warehouse'].includes(userRole)) {
      chain.push('manager', 'admin', 'super_admin', 'owner');
    } else if (['Branch Manager', 'Inventory Manager'].includes(userRole)) {
      chain.push('admin', 'super_admin', 'owner');
    } else if (userRole === 'Admin') {
      chain.push('super_admin', 'owner');
    } else if (userRole === 'Super Admin') {
      chain.push('owner');
    }

    // Specific rules for approval types
    if (approvalType === 'discount' && !chain.includes('admin')) {
      chain.unshift('admin');
    }
    if (approvalType === 'refund' && !chain.includes('admin')) {
      chain.unshift('admin');
    }
    if (approvalType === 'salary' && !chain.includes('super_admin')) {
      chain.push('super_admin');
    }
    if (approvalType === 'delete' && !chain.includes('owner')) {
      chain.push('owner');
    }

    return chain;
  }

  /**
   * Check if user can approve a specific type of request
   */
  static canApprove(userRole: RoleType, approvalType: ApprovalType): boolean {
    const permissions = this.getRoleDefinition(userRole);
    const approvalKey = `approve${approvalType.charAt(0).toUpperCase() + approvalType.slice(1).replace(/_/g, '')}` as keyof typeof permissions.approvals;
    return (permissions.approvals as any)[approvalKey] === true;
  }

  /**
   * Check if user has branch restriction
   */
  static hasAccessToBranch(userRole: RoleType, userBranch: BranchId, targetBranch: BranchId): boolean {
    const permissions = this.getRoleDefinition(userRole);
    const restriction = permissions.features.branchRestriction;

    if (restriction === 'none') return true;
    if (restriction === 'assigned_only') return userBranch === targetBranch;
    if (restriction === 'assigned_and_downstream') {
      // Downstream logic would depend on branch hierarchy
      return userBranch === targetBranch;
    }
    return false;
  }

  /**
   * Get visible pages for a role
   */
  static getVisiblePages(userRole: RoleType): string[] {
    const permissions = this.getRoleDefinition(userRole);
    return permissions.features.pageVisibility;
  }

  /**
   * Check if a page is visible for a role
   */
  static isPageVisible(userRole: RoleType, pageName: string): boolean {
    const visiblePages = this.getVisiblePages(userRole);
    return visiblePages.includes('*') || visiblePages.includes(pageName);
  }

  /**
   * Check if 2FA is required for role
   */
  static isTwoFactorRequired(userRole: RoleType): boolean {
    const permissions = this.getRoleDefinition(userRole);
    return permissions.features.twoFactorRequired === true;
  }

  /**
   * Check IP restriction
   */
  static isIpAllowed(userRole: RoleType, ipAddress: string): boolean {
    const permissions = this.getRoleDefinition(userRole);
    const restrictions = permissions.features.ipRestriction;
    
    if (restrictions.length === 0) return true;
    return restrictions.includes(ipAddress);
  }

  /**
   * Check if financial data is restricted
   */
  static isFinancialDataRestricted(userRole: RoleType): boolean {
    const permissions = this.getRoleDefinition(userRole);
    return permissions.features.restrictFinancialData === true;
  }

  /**
   * Get all permissions for a role in JSON format
   */
  static exportRolePermissions(role: RoleType): Record<string, any> {
    const definition = ROLE_DEFINITIONS[role];
    return {
      role,
      description: definition.description,
      permissions: definition.permissions,
    };
  }

  /**
   * Clone a role with modifications
   */
  static cloneRole(sourceRole: RoleType, newRoleName: string, modifications: Partial<PermissionSchema> = {}): PermissionSchema {
    const sourcePermissions = this.getRoleDefinition(sourceRole);
    return {
      ...sourcePermissions,
      ...modifications,
    };
  }

  /**
   * Validate permission schema
   */
  static validatePermissions(permissions: PermissionSchema): boolean {
    try {
      // Check all required sections exist
      if (!permissions.modules || !permissions.crud || !permissions.features) {
        return false;
      }
      
      // Check all modules are boolean
      const moduleValues = Object.values(permissions.modules);
      if (!moduleValues.every(v => typeof v === 'boolean')) return false;

      // Check CRUD values
      const crudValues = Object.values(permissions.crud);
      if (!crudValues.every(v => typeof v === 'boolean')) return false;

      return true;
    } catch (error) {
      return false;
    }
  }
}

export default RBACEngine;
