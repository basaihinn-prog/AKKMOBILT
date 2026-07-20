import { AuditLog, AuditAction, AuditResourceType, ActivityTimeline, LoginAttempt, SecurityEvent, SessionInfo, BranchId, RoleType } from '../types';
import { v4 as uuidv4 } from 'uuid';

// ==========================================
// AUDIT SERVICE - LOGGING SYSTEM
// ==========================================

export interface AuditOptions {
  userId: string;
  userName: string;
  userRole: RoleType;
  branchId: BranchId;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName: string;
  ipAddress: string;
  userAgent: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
}

export class AuditService {
  // In-memory audit logs (replace with database in production)
  private static auditLogs: AuditLog[] = [];
  private static activityTimeline: ActivityTimeline[] = [];
  private static loginAttempts: LoginAttempt[] = [];
  private static securityEvents: SecurityEvent[] = [];
  private static sessions: SessionInfo[] = [];

  /**
   * Log an action to audit trail
   */
  static logAction(options: AuditOptions): AuditLog {
    const auditLog: AuditLog = {
      id: uuidv4(),
      userId: options.userId,
      userName: options.userName,
      action: options.action,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      resourceName: options.resourceName,
      branchId: options.branchId,
      changes: {
        before: options.before || {},
        after: options.after || {},
      },
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    this.auditLogs.push(auditLog);
    
    // Also add to activity timeline
    this.addActivityTimelineEntry({
      userId: options.userId,
      userName: options.userName,
      action: `${options.action.toUpperCase()}_${options.resourceType.toUpperCase()}`,
      description: `${options.action} ${options.resourceType} "${options.resourceName}"`,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      resourceName: options.resourceName,
      branchId: options.branchId,
      severity: options.action === 'delete' ? 'critical' : options.action === 'update' ? 'warning' : 'info',
    });

    return auditLog;
  }

  /**
   * Add entry to activity timeline
   */
  static addActivityTimelineEntry(options: Partial<ActivityTimeline>): ActivityTimeline {
    const entry: ActivityTimeline = {
      id: uuidv4(),
      userId: options.userId || 'system',
      userName: options.userName || 'System',
      action: options.action || 'unknown',
      description: options.description || '',
      resourceType: options.resourceType || 'user',
      resourceId: options.resourceId || '',
      resourceName: options.resourceName || '',
      branchId: options.branchId || 'b-yangon',
      timestamp: new Date().toISOString(),
      severity: options.severity || 'info',
    };

    this.activityTimeline.push(entry);
    return entry;
  }

  /**
   * Log login attempt
   */
  static logLoginAttempt(email: string, ipAddress: string, deviceFingerprint: string, success: boolean, failureReason?: string): LoginAttempt {
    const attempt: LoginAttempt = {
      id: uuidv4(),
      email,
      ipAddress,
      deviceFingerprint,
      status: success ? 'success' : 'failed',
      failureReason,
      timestamp: new Date().toISOString(),
    };

    this.loginAttempts.push(attempt);

    // Detect multiple failed login attempts
    if (!success) {
      this.detectFailedLoginPattern(email, ipAddress);
    }

    return attempt;
  }

  /**
   * Detect and alert on failed login patterns
   */
  private static detectFailedLoginPattern(email: string, ipAddress: string) {
    const recentAttempts = this.loginAttempts.filter(
      (a) => a.email === email && a.status === 'failed' && 
      new Date(a.timestamp).getTime() > Date.now() - 30 * 60 * 1000 // Last 30 minutes
    );

    if (recentAttempts.length >= 5) {
      this.logSecurityEvent({
        userId: email,
        eventType: 'security_alert',
        severity: 'high',
        description: `Multiple failed login attempts detected (${recentAttempts.length} attempts)`,
        ipAddress,
      });
    }
  }

  /**
   * Log security event
   */
  static logSecurityEvent(options: {
    userId: string;
    eventType: 'permission_denied' | 'unauthorized_access' | 'data_export' | 'password_change' | 'role_change' | 'two_fa_disabled' | 'session_timeout' | 'security_alert';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    ipAddress: string;
    userAgent?: string;
  }): SecurityEvent {
    const event: SecurityEvent = {
      id: uuidv4(),
      userId: options.userId,
      userName: options.userId,
      eventType: options.eventType,
      severity: options.severity,
      description: options.description,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent || 'unknown',
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.securityEvents.push(event);
    return event;
  }

  /**
   * Create user session
   */
  static createSession(options: {
    userId: string;
    userName: string;
    role: RoleType;
    branchId: BranchId;
    deviceType: 'desktop' | 'tablet' | 'mobile';
    deviceName: string;
    browser: string;
    operatingSystem: string;
    ipAddress: string;
  }): SessionInfo {
    const session: SessionInfo = {
      id: uuidv4(),
      userId: options.userId,
      userName: options.userName,
      role: options.role,
      branchId: options.branchId,
      loginTime: new Date().toISOString(),
      deviceType: options.deviceType,
      deviceName: options.deviceName,
      browser: options.browser,
      operatingSystem: options.operatingSystem,
      ipAddress: options.ipAddress,
      isActive: true,
      lastActivityTime: new Date().toISOString(),
    };

    this.sessions.push(session);
    return session;
  }

  /**
   * End user session
   */
  static endSession(sessionId: string) {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.isActive = false;
      session.logoutTime = new Date().toISOString();
    }
    return session;
  }

  /**
   * Update session activity
   */
  static updateSessionActivity(sessionId: string) {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.lastActivityTime = new Date().toISOString();
    }
    return session;
  }

  /**
   * Get audit logs with filters
   */
  static getAuditLogs(filters: {
    userId?: string;
    resourceType?: AuditResourceType;
    action?: AuditAction;
    branchId?: BranchId;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}): AuditLog[] {
    let results = [...this.auditLogs];

    if (filters.userId) results = results.filter((a) => a.userId === filters.userId);
    if (filters.resourceType) results = results.filter((a) => a.resourceType === filters.resourceType);
    if (filters.action) results = results.filter((a) => a.action === filters.action);
    if (filters.branchId) results = results.filter((a) => a.branchId === filters.branchId);

    if (filters.startDate) {
      const startTime = new Date(filters.startDate).getTime();
      results = results.filter((a) => new Date(a.timestamp).getTime() >= startTime);
    }

    if (filters.endDate) {
      const endTime = new Date(filters.endDate).getTime();
      results = results.filter((a) => new Date(a.timestamp).getTime() <= endTime);
    }

    // Sort by timestamp descending (newest first)
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 100;
    return results.slice(offset, offset + limit);
  }

  /**
   * Get activity timeline
   */
  static getActivityTimeline(filters: {
    branchId?: BranchId;
    userId?: string;
    severity?: 'info' | 'warning' | 'critical';
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): ActivityTimeline[] {
    let results = [...this.activityTimeline];

    if (filters.branchId) results = results.filter((a) => a.branchId === filters.branchId);
    if (filters.userId) results = results.filter((a) => a.userId === filters.userId);
    if (filters.severity) results = results.filter((a) => a.severity === filters.severity);

    if (filters.startDate) {
      const startTime = new Date(filters.startDate).getTime();
      results = results.filter((a) => new Date(a.timestamp).getTime() >= startTime);
    }

    if (filters.endDate) {
      const endTime = new Date(filters.endDate).getTime();
      results = results.filter((a) => new Date(a.timestamp).getTime() <= endTime);
    }

    // Sort by timestamp descending
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    const limit = filters.limit || 50;
    return results.slice(0, limit);
  }

  /**
   * Get login history for a user
   */
  static getLoginHistory(email: string, limit: number = 50): LoginAttempt[] {
    return this.loginAttempts
      .filter((a) => a.email === email)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get security events
   */
  static getSecurityEvents(filters: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    eventType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}): SecurityEvent[] {
    let results = [...this.securityEvents];

    if (filters.severity) results = results.filter((e) => e.severity === filters.severity);
    if (filters.eventType) results = results.filter((e) => e.eventType === filters.eventType);

    if (filters.startDate) {
      const startTime = new Date(filters.startDate).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() >= startTime);
    }

    if (filters.endDate) {
      const endTime = new Date(filters.endDate).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() <= endTime);
    }

    // Sort by timestamp descending
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    const limit = filters.limit || 100;
    return results.slice(0, limit);
  }

  /**
   * Get active sessions
   */
  static getActiveSessions(filters: {
    userId?: string;
    branchId?: BranchId;
  } = {}): SessionInfo[] {
    let results = this.sessions.filter((s) => s.isActive);

    if (filters.userId) results = results.filter((s) => s.userId === filters.userId);
    if (filters.branchId) results = results.filter((s) => s.branchId === filters.branchId);

    return results;
  }

  /**
   * Cleanup old audit logs (90-day retention)
   */
  static cleanupOldLogs(retentionDays: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTime = cutoffDate.getTime();

    this.auditLogs = this.auditLogs.filter((a) => new Date(a.timestamp).getTime() > cutoffTime);
    this.activityTimeline = this.activityTimeline.filter((a) => new Date(a.timestamp).getTime() > cutoffTime);
    this.loginAttempts = this.loginAttempts.filter((a) => new Date(a.timestamp).getTime() > cutoffTime);
    this.securityEvents = this.securityEvents.filter((e) => new Date(e.timestamp).getTime() > cutoffTime);
  }

  /**
   * Export audit logs as CSV
   */
  static exportAuditLogsCSV(logs: AuditLog[]): string {
    const headers = ['ID', 'Timestamp', 'User', 'Action', 'Resource', 'Branch', 'Status', 'IP Address'];
    const rows = logs.map((log) => [
      log.id,
      log.timestamp,
      log.userName,
      log.action,
      `${log.resourceType}:${log.resourceName}`,
      log.branchId,
      log.status,
      log.ipAddress,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    return csvContent;
  }

  /**
   * Get audit statistics
   */
  static getAuditStats(period: 'today' | 'week' | 'month' = 'month'): Record<string, any> {
    let startDate = new Date();

    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const relevantLogs = this.auditLogs.filter((a) => new Date(a.timestamp).getTime() >= startDate.getTime());

    const actionCounts: Record<string, number> = {};
    const resourceCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};

    relevantLogs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      resourceCounts[log.resourceType] = (resourceCounts[log.resourceType] || 0) + 1;
      userCounts[log.userName] = (userCounts[log.userName] || 0) + 1;
    });

    return {
      totalActions: relevantLogs.length,
      actionCounts,
      resourceCounts,
      userCounts,
      period,
    };
  }
}

export default AuditService;
