import { ApprovalRequest, ApprovalType, ApprovalLevel, RoleType, AuditResourceType, BranchId } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { RBACEngine } from './rbac-engine';

// ==========================================
// APPROVAL WORKFLOW ENGINE
// ==========================================

interface ApprovalRequestOptions {
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
}

export class ApprovalWorkflowEngine {
  // In-memory approval requests (replace with database in production)
  private static approvalRequests: ApprovalRequest[] = [];

  /**
   * Create a new approval request
   */
  static createApprovalRequest(options: ApprovalRequestOptions): ApprovalRequest {
    // Get approval chain for this request type
    const approvalChain = RBACEngine.getApprovalChain(options.requesterRole, options.requestType);

    // Build approval chain structure
    const approvalChainStructure = approvalChain.map((level) => ({
      level,
      approvers: this.getApproversForLevel(level, options.requesterBranch),
      status: 'pending' as const,
    }));

    const request: ApprovalRequest = {
      id: uuidv4(),
      requestType: options.requestType,
      requesterId: options.requesterId,
      requesterName: options.requesterName,
      requesterRole: options.requesterRole,
      requesterBranch: options.requesterBranch,
      resourceId: options.resourceId,
      resourceType: options.resourceType,
      resourceName: options.resourceName,
      description: options.description,
      amount: options.amount,
      data: options.data,
      status: 'pending',
      approvalChain: approvalChainStructure,
      currentLevel: approvalChain[0] || 'manager',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: this.getExpiryDate(),
    };

    this.approvalRequests.push(request);
    return request;
  }

  /**
   * Get approvers for a specific approval level in a branch
   */
  private static getApproversForLevel(level: ApprovalLevel, branchId: BranchId): string[] {
    // In production, fetch from database based on branch and role
    // For now, return mock data
    const approversByLevel: Record<ApprovalLevel, string[]> = {
      manager: ['manager1', 'manager2'],
      admin: ['admin1', 'admin2'],
      super_admin: ['superadmin1'],
      owner: ['owner@akkmobile.com'],
    };
    return approversByLevel[level] || [];
  }

  /**
   * Approve a request at current level
   */
  static approveRequest(
    requestId: string,
    approverId: string,
    approverName: string,
    comments?: string
  ): ApprovalRequest | null {
    const request = this.approvalRequests.find((r) => r.id === requestId);
    if (!request) return null;

    // Mark current level as approved
    const currentLevelChain = request.approvalChain.find((c) => c.level === request.currentLevel);
    if (currentLevelChain) {
      currentLevelChain.status = 'approved';
      currentLevelChain.approvedBy = approverId;
      currentLevelChain.approverName = approverName;
      currentLevelChain.timestamp = new Date().toISOString();
      currentLevelChain.comments = comments;
    }

    // Move to next level
    const nextLevelIndex = request.approvalChain.findIndex((c) => c.level === request.currentLevel) + 1;
    if (nextLevelIndex < request.approvalChain.length) {
      request.currentLevel = request.approvalChain[nextLevelIndex].level;
      request.status = 'pending';
    } else {
      // All levels approved
      request.status = 'approved';
    }

    request.updatedAt = new Date().toISOString();
    return request;
  }

  /**
   * Reject a request at current level
   */
  static rejectRequest(
    requestId: string,
    rejectorId: string,
    rejectorName: string,
    reason: string
  ): ApprovalRequest | null {
    const request = this.approvalRequests.find((r) => r.id === requestId);
    if (!request) return null;

    // Mark as rejected
    request.status = 'rejected';
    
    const currentLevelChain = request.approvalChain.find((c) => c.level === request.currentLevel);
    if (currentLevelChain) {
      currentLevelChain.status = 'rejected';
      currentLevelChain.approvedBy = rejectorId;
      currentLevelChain.approverName = rejectorName;
      currentLevelChain.timestamp = new Date().toISOString();
      currentLevelChain.comments = reason;
    }

    request.updatedAt = new Date().toISOString();
    return request;
  }

  /**
   * Escalate a request to higher authority
   */
  static escalateRequest(requestId: string, reason: string): ApprovalRequest | null {
    const request = this.approvalRequests.find((r) => r.id === requestId);
    if (!request) return null;

    // Skip current level and move to next
    const currentLevelIndex = request.approvalChain.findIndex((c) => c.level === request.currentLevel);
    if (currentLevelIndex >= 0 && currentLevelIndex < request.approvalChain.length - 1) {
      request.status = 'escalated';
      request.currentLevel = request.approvalChain[currentLevelIndex + 1].level;
    }

    request.updatedAt = new Date().toISOString();
    return request;
  }

  /**
   * Get approval requests for a user to review
   */
  static getPendingApprovalsForUser(userId: string, userRole: RoleType): ApprovalRequest[] {
    return this.approvalRequests.filter((r) => {
      // Filter by current level and user's ability to approve
      if (r.status !== 'pending') return false;

      // Map role to approval level
      const userApprovalLevel = this.roleToApprovalLevel(userRole);
      return r.currentLevel === userApprovalLevel;
    });
  }

  /**
   * Convert role to approval level
   */
  private static roleToApprovalLevel(role: RoleType): ApprovalLevel {
    const roleToLevelMap: Record<RoleType, ApprovalLevel> = {
      'Owner': 'owner',
      'Super Admin': 'super_admin',
      'Admin': 'admin',
      'Branch Manager': 'manager',
      'Cashier': 'manager',
      'Sales': 'manager',
      'Technician': 'manager',
      'Warehouse': 'manager',
      'Inventory Manager': 'admin',
      'Purchasing Officer': 'admin',
      'Accountant': 'admin',
      'HR Manager': 'admin',
      'Customer Service': 'manager',
      'Marketing': 'manager',
      'Auditor': 'owner',
      'Read Only': 'manager',
      'Customer': 'manager',
    };
    return roleToLevelMap[role] || 'manager';
  }

  /**
   * Get all approval requests with filters
   */
  static getApprovalRequests(filters: {
    status?: 'pending' | 'approved' | 'rejected' | 'escalated';
    requestType?: ApprovalType;
    requesterId?: string;
    branchId?: BranchId;
    limit?: number;
    offset?: number;
  } = {}): ApprovalRequest[] {
    let results = [...this.approvalRequests];

    if (filters.status) results = results.filter((r) => r.status === filters.status);
    if (filters.requestType) results = results.filter((r) => r.requestType === filters.requestType);
    if (filters.requesterId) results = results.filter((r) => r.requesterId === filters.requesterId);
    if (filters.branchId) results = results.filter((r) => r.requesterBranch === filters.branchId);

    // Sort by creation date descending
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    return results.slice(offset, offset + limit);
  }

  /**
   * Get approval request by ID
   */
  static getApprovalRequest(requestId: string): ApprovalRequest | null {
    return this.approvalRequests.find((r) => r.id === requestId) || null;
  }

  /**
   * Get approval stats
   */
  static getApprovalStats(): Record<string, any> {
    const stats = {
      total: this.approvalRequests.length,
      pending: this.approvalRequests.filter((r) => r.status === 'pending').length,
      approved: this.approvalRequests.filter((r) => r.status === 'approved').length,
      rejected: this.approvalRequests.filter((r) => r.status === 'rejected').length,
      escalated: this.approvalRequests.filter((r) => r.status === 'escalated').length,
      byType: {} as Record<ApprovalType, number>,
    };

    const types: ApprovalType[] = [
      'discount',
      'refund',
      'stock_adjustment',
      'purchase',
      'expense',
      'transfer',
      'salary',
      'leave',
      'delete',
    ];
    types.forEach((type) => {
      stats.byType[type] = this.approvalRequests.filter((r) => r.requestType === type).length;
    });

    return stats;
  }

  /**
   * Check if request has expired
   */
  static isRequestExpired(requestId: string): boolean {
    const request = this.approvalRequests.find((r) => r.id === requestId);
    if (!request) return false;

    return new Date().getTime() > new Date(request.expiresAt).getTime();
  }

  /**
   * Cleanup expired requests
   */
  static cleanupExpiredRequests(): void {
    this.approvalRequests = this.approvalRequests.filter((r) => {
      if (new Date().getTime() > new Date(r.expiresAt).getTime() && r.status === 'pending') {
        return false; // Remove expired pending requests
      }
      return true;
    });
  }

  /**
   * Get average approval time
   */
  static getAverageApprovalTime(requestType?: ApprovalType): number {
    let requests = [...this.approvalRequests];

    if (requestType) {
      requests = requests.filter((r) => r.requestType === requestType);
    }

    requests = requests.filter((r) => r.status === 'approved');

    if (requests.length === 0) return 0;

    const totalTime = requests.reduce((sum, r) => {
      const createdTime = new Date(r.createdAt).getTime();
      const updatedTime = new Date(r.updatedAt).getTime();
      return sum + (updatedTime - createdTime);
    }, 0);

    return Math.round(totalTime / requests.length / 1000 / 60); // Return in minutes
  }

  /**
   * Get expiry date for new requests (7 days from now)
   */
  private static getExpiryDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString();
  }

  /**
   * Check if user can approve a specific request
   */
  static canUserApproveRequest(requestId: string, userRole: RoleType): boolean {
    const request = this.getApprovalRequest(requestId);
    if (!request || request.status !== 'pending') return false;

    const userLevel = this.roleToApprovalLevel(userRole);
    return request.currentLevel === userLevel && RBACEngine.canApprove(userRole, request.requestType);
  }

  /**
   * Get approval requests by date range
   */
  static getApprovalRequestsByDateRange(startDate: string, endDate: string): ApprovalRequest[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return this.approvalRequests.filter((r) => {
      const created = new Date(r.createdAt).getTime();
      return created >= start && created <= end;
    });
  }
}

export default ApprovalWorkflowEngine;
