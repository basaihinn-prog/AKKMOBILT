/**
 * Enterprise RBAC Permission Engine
 * Handles role-based access control, permissions, and authorization
 */

import type { RoleType, PermissionLevel, BranchRestriction, PermissionSchema, AuditAction, AuditResourceType } from '../types';

// ==========================================
// SYSTEM ROLES & DEFAULT PERMISSIONS
// ==========================================

export const ROLE_HIERARCHY: Record<RoleType, number> = {
  'Owner': 10,
  'Super Admin': 9,
  'Admin': 8,
  'Branch Manager': 7,
  'Cashier': 4,
  'Sales': 3,
  'Technician': 2,
  'Warehouse': 2,
  'Accountant': 5,
};

export const DEFAULT_PERMISSIONS: Record<RoleType, PermissionSchema> = {
  'Owner': {
    modules: {
      pos: true,
      inventory: true,
      finance: true,
      hr: true,
      repairs: true,
      crm: true,
      vtu: true,
      integrations: true,
      auditLogs: true,
    },
    crud: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    features: {
      approveReject: true,
      branchRestriction: 'none',
      apiAccess: 'write',
      advancedSettings: true,
      pageVisibility: ['*'],
      featureToggles: {},
    },
  },
  'Super Admin': {
    modules: {
      pos: true,
      inventory: true,
      finance: true,
      hr: true,
      repairs: true,
      crm: true,
      vtu: true,
      integrations: true,
      auditLogs: true,
    },
    crud: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    features: {
      approveReject: true,
      branchRestriction: 'none',
      apiAccess: 'write',
      advancedSettings: true,
      pageVisibility: ['*'],
      featureToggles: {},
    },
  },
  'Admin': {
    modules: {
      pos: true,
      inventory: true,
      finance: true,
      hr: true,
      repairs: true,
      crm: true,
      vtu: true,
      integrations: false,
      auditLogs: true,
    },
    crud: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    features: {
      approveReject: true,
      branchRestriction: 'assigned_and_downstream',
      apiAccess: 'write',
      advancedSettings: false,
      pageVisibility: ['pos', 'inventory', 'finance', 'hr', 'repairs', 'crm', 'vtu', 'auditLogs'],
      featureToggles: {},
    },
  },
  'Branch Manager': {
    modules: {
      pos: true,
      inventory: true,
      finance: true,
      hr: true,
      repairs: true,
      crm: true,
      vtu: true,
      integrations: false,
      auditLogs: false,
    },
    crud: {
      create: true,
      read: true,
      update: true,
      delete: false,
    },
    features: {
      approveReject: false,
      branchRestriction: 'assigned_only',
      apiAccess: 'read',
      advancedSettings: false,
      pageVisibility: ['pos', 'inventory', 'finance', 'hr', 'repairs', 'crm', 'vtu'],
      featureToggles: {},
    },
  },
  'Accountant': {
    modules: {
      pos: true,
      inventory: false,
      finance: true,
      hr: false,
      repairs: false,
      crm: false,
      vtu: false,
      integrations: false,
      auditLogs: false,
    },
    crud: {
      create: true,
      read: true,
      update: true,
      delete: false,
    },
    features: {
      approveReject: false,
      branchRestriction: 'assigned_only',
      apiAccess: 'read',
      advancedSettings: false,
      pageVisibility: ['pos', 'finance'],
      featureToggles: {},
    },
  },
  'Cashier': {
    modules: {
      pos: true,
      inventory: true,
      finance: false,
      hr: false,
      repairs: false,
      crm: true,
      vtu: false,
      integrations: false,
      auditLogs: false,
    },
    crud: {
      create: true,
      read: true,
      update: false,
      delete: false,
    },
    features: {
      approveReject: false,
      branchRestriction: 'assigned_only',
      apiAccess: 'read',
      advancedSettings: false,
      pageVisibility: ['pos', 'crm'],
      featureToggles: {},
    },
  },
  'Sales': {
    modules: {
      pos: true,
      inventory: true,
      finance: false,
      hr: false,
      repairs: false,
      crm: true,
      vtu: false,
      integrations: false,
      auditLogs: false,
    },
    crud: {
      create: true,
      read: true,
      update: true,
      delete: false,
    },
    features: {
      approveReject: false,
      branchRestriction: 'assigned_only',
      apiAccess: 'read',
      advancedSettings: false,
      pageVisibility: ['pos', 'crm', 'inventory'],
      featureToggles: {},
    },
  },
  'Technician': {
    modules: {
      pos: false,
      inventory: true,
      finance: false,
      hr: false,
      repairs: true,
      crm: false,
      vtu: false,
      integrations: false,
      auditLogs: false,
    },
    crud: {
      create: true,
      read: true,
      update: true,
      delete: false,
    },
    features: {
      approveReject: false,
      branchRestriction: 'assigned_only',
      apiAccess: 'read',
      advancedSettings: false,
      pageVisibility: ['repairs', 'inventory'],
      featureToggles: {},
    },
  },
  'Warehouse': {
    modules: {
      pos: false,
      inventory: true,
      finance: false,
      hr: false,
      repairs: false,
      crm: false,
      vtu: false,
      integrations: false,
      auditLogs: false,
    },
    crud: {
      create: true,
      read: true,
      update: true,
      delete: false,
    },
    features: {
      approveReject: false,
      branchRestriction: 'assigned_only',
      apiAccess: 'read',
      advancedSettings: false,
      pageVisibility: ['inventory'],
      featureToggles: {},
    },
  },
};

// ==========================================
// PERMISSION CHECKER CLASS
// ==========================================

export class PermissionChecker {
  constructor(private permissions: PermissionSchema, private userRole: RoleType) {}

  // Check if user has access to a module
  hasModuleAccess(module: keyof PermissionSchema['modules']): boolean {
    return this.permissions.modules[module] === true;
  }

  // Check if user has CRUD permission
  hasCRUDPermission(action: keyof PermissionSchema['crud']): boolean {
    return this.permissions.crud[action] === true;
  }

  // Check if user can approve/reject
  canApproveReject(): boolean {
    return this.permissions.features.approveReject === true;
  }

  // Check if user can access API
  getAPIAccessLevel(): PermissionLevel {
    return this.permissions.features.apiAccess;
  }

  // Check branch restriction
  getBranchRestriction(): BranchRestriction {
    return this.permissions.features.branchRestriction;
  }

  // Check page visibility
  canViewPage(pageName: string): boolean {
    const visibility = this.permissions.features.pageVisibility;
    return visibility.includes('*') || visibility.includes(pageName);
  }

  // Check feature toggle
  isFeatureEnabled(featureName: string): boolean {
    return this.permissions.features.featureToggles[featureName] === true;
  }

  // Full permission check
  canPerformAction(module: keyof PermissionSchema['modules'], action: keyof PermissionSchema['crud']): boolean {
    return this.hasModuleAccess(module) && this.hasCRUDPermission(action);
  }
}

// ==========================================
// AUTH CONTEXT & SESSION
// ==========================================

export interface AuthSession {
  userId: string;
  userName: string;
  email: string;
  role: RoleType;
  branchId: string;
  permissions: PermissionSchema;
  issuedAt: number;
  expiresAt: number;
  sessionId: string;
}

export class AuthManager {
  private sessions: Map<string, AuthSession> = new Map();
  private readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

  createSession(userId: string, userName: string, email: string, role: RoleType, branchId: string): AuthSession {
    const now = Date.now();
    const session: AuthSession = {
      userId,
      userName,
      email,
      role,
      branchId,
      permissions: DEFAULT_PERMISSIONS[role],
      issuedAt: now,
      expiresAt: now + this.SESSION_DURATION,
      sessionId: this.generateSessionId(),
    };

    this.sessions.set(session.sessionId, session);
    return session;
  }

  getSession(sessionId: string): AuthSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if session expired
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  invalidateSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==========================================
// AUDIT LOGGER
// ==========================================

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName: string;
  branchId: string;
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

export class AuditLogger {
  private logs: AuditEntry[] = [];

  logAction(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
    const auditEntry: AuditEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(auditEntry);
    return auditEntry;
  }

  getAuditLog(resourceType?: AuditResourceType, resourceId?: string): AuditEntry[] {
    return this.logs.filter(log => {
      if (resourceType && log.resourceType !== resourceType) return false;
      if (resourceId && log.resourceId !== resourceId) return false;
      return true;
    });
  }

  getAllLogs(): AuditEntry[] {
    return this.logs;
  }

  clearOldLogs(daysOld: number = 90): void {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    this.logs = this.logs.filter(log => new Date(log.timestamp).getTime() > cutoffTime);
  }
}

// ==========================================
// GLOBAL INSTANCES
// ==========================================

export const authManager = new AuthManager();
export const auditLogger = new AuditLogger();
