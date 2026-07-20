/**
 * Express Middleware for Enterprise RBAC
 * Handles authentication, authorization, and audit logging
 */

import type { Request, Response, NextFunction } from 'express';
import type { RoleType, AuditResourceType } from '../types';
import { authManager, auditLogger, PermissionChecker, DEFAULT_PERMISSIONS } from './permissions';

// Extend Express Request to include auth context
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userName?: string;
      userRole?: RoleType;
      userBranchId?: string;
      sessionId?: string;
    }
  }
}

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Get session from header or cookies
  const sessionId = req.headers['x-session-id'] as string || req.cookies?.sessionId;

  if (!sessionId) {
    res.status(401).json({ error: 'Unauthorized: No session found' });
    return;
  }

  const session = authManager.getSession(sessionId);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
    return;
  }

  // Attach user info to request
  req.userId = session.userId;
  req.userName = session.userName;
  req.userRole = session.role;
  req.userBranchId = session.branchId;
  req.sessionId = sessionId;

  next();
};

// ==========================================
// AUTHORIZATION MIDDLEWARE (RBAC)
// ==========================================

export const requireRole = (allowedRoles: RoleType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ error: 'Unauthorized: User role not found' });
      return;
    }

    if (!allowedRoles.includes(req.userRole)) {
      auditLogger.logAction({
        userId: req.userId || 'unknown',
        userName: req.userName || 'unknown',
        action: 'read',
        resourceType: 'user',
        resourceId: req.userId || 'unknown',
        resourceName: 'Access Denied',
        branchId: req.userBranchId || 'unknown',
        changes: { before: {}, after: {} },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        status: 'failure',
        errorMessage: `Insufficient role: ${req.userRole}`,
      });

      res.status(403).json({ error: `Forbidden: Role '${req.userRole}' not allowed` });
      return;
    }

    next();
  };
};

// ==========================================
// PERMISSION CHECKER MIDDLEWARE
// ==========================================

export const requirePermission = (module: string, action: 'create' | 'read' | 'update' | 'delete') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ error: 'Unauthorized: User role not found' });
      return;
    }

    const permissions = DEFAULT_PERMISSIONS[req.userRole];
    const checker = new PermissionChecker(permissions, req.userRole);

    // Check module access
    if (!checker.hasModuleAccess(module as any)) {
      auditLogger.logAction({
        userId: req.userId || 'unknown',
        userName: req.userName || 'unknown',
        action: 'read',
        resourceType: 'permission' as AuditResourceType,
        resourceId: module,
        resourceName: `Module ${module}`,
        branchId: req.userBranchId || 'unknown',
        changes: { before: {}, after: {} },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        status: 'failure',
        errorMessage: `No access to module: ${module}`,
      });

      res.status(403).json({ error: `Module '${module}' not accessible for ${req.userRole}` });
      return;
    }

    // Check CRUD action
    if (!checker.hasCRUDPermission(action)) {
      auditLogger.logAction({
        userId: req.userId || 'unknown',
        userName: req.userName || 'unknown',
        action: 'read',
        resourceType: 'permission' as AuditResourceType,
        resourceId: action,
        resourceName: `Action ${action}`,
        branchId: req.userBranchId || 'unknown',
        changes: { before: {}, after: {} },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        status: 'failure',
        errorMessage: `Cannot perform action: ${action}`,
      });

      res.status(403).json({ error: `Action '${action}' not permitted for ${req.userRole}` });
      return;
    }

    next();
  };
};

// ==========================================
// BRANCH RESTRICTION MIDDLEWARE
// ==========================================

export const restrictBranch = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.userRole || !req.userBranchId) {
    res.status(401).json({ error: 'Unauthorized: Branch context missing' });
    return;
  }

  const permissions = DEFAULT_PERMISSIONS[req.userRole];
  const checker = new PermissionChecker(permissions, req.userRole);
  const restriction = checker.getBranchRestriction();

  if (restriction === 'none') {
    // Owner/Super Admin - access all branches
    next();
    return;
  }

  // Check if user can access requested branch
  const requestedBranch = req.query.branchId as string || req.body.branchId || req.userBranchId;

  if (restriction === 'assigned_only' && requestedBranch !== req.userBranchId) {
    auditLogger.logAction({
      userId: req.userId || 'unknown',
      userName: req.userName || 'unknown',
      action: 'read',
      resourceType: 'permission' as AuditResourceType,
      resourceId: requestedBranch,
      resourceName: `Branch ${requestedBranch}`,
      branchId: req.userBranchId || 'unknown',
      changes: { before: {}, after: {} },
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      status: 'failure',
      errorMessage: `Cannot access branch: ${requestedBranch}`,
    });

    res.status(403).json({ error: 'Forbidden: Can only access your assigned branch' });
    return;
  }

  next();
};

// ==========================================
// AUDIT LOGGING MIDDLEWARE
// ==========================================

export const auditLog = (resourceType: AuditResourceType, action: 'create' | 'read' | 'update' | 'delete') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Store original send function
    const originalSend = res.send;

    // Intercept response
    res.send = function (data: any) {
      const status = res.statusCode;
      const success = status >= 200 && status < 300;

      if (req.userId) {
        auditLogger.logAction({
          userId: req.userId,
          userName: req.userName || 'unknown',
          action: action as any,
          resourceType,
          resourceId: (req.body?.id || req.params?.id) as string || 'unknown',
          resourceName: (req.body?.name || req.params?.name) as string || 'unknown',
          branchId: req.userBranchId || 'unknown',
          changes: {
            before: req.body?.before || {},
            after: success ? req.body : {},
          },
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          status: success ? 'success' : 'failure',
          errorMessage: success ? undefined : typeof data === 'string' ? data : JSON.stringify(data),
        });
      }

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
};

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Error]', err.message);

  // Log error in audit
  if (req.userId) {
    auditLogger.logAction({
      userId: req.userId,
      userName: req.userName || 'unknown',
      action: 'read',
      resourceType: 'user' as AuditResourceType,
      resourceId: req.userId,
      resourceName: 'Error occurred',
      branchId: req.userBranchId || 'unknown',
      changes: { before: {}, after: {} },
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      status: 'failure',
      errorMessage: err.message,
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
};

// ==========================================
// REQUEST VALIDATION MIDDLEWARE
// ==========================================

export const validateRequestBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = requiredFields.filter(field => !req.body[field]);

    if (missing.length > 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: `Missing required fields: ${missing.join(', ')}`,
      });
      return;
    }

    next();
  };
};

// ==========================================
// RATE LIMITING MIDDLEWARE
// ==========================================

interface RequestTracker {
  count: number;
  resetTime: number;
}

const requestTrackers = new Map<string, RequestTracker>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 100;

export const rateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const tracker = requestTrackers.get(key);

  if (tracker && now < tracker.resetTime) {
    if (tracker.count >= MAX_REQUESTS_PER_MINUTE) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Max ${MAX_REQUESTS_PER_MINUTE} requests per minute.`,
        retryAfter: Math.ceil((tracker.resetTime - now) / 1000),
      });
      return;
    }
    tracker.count++;
  } else {
    requestTrackers.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
  }

  next();
};
