import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, Filter, Search, Bell, TrendingUp, User, DollarSign, Package, Zap } from 'lucide-react';
import { ApprovalRequest, ApprovalType, RoleType, BranchId } from '../types';
import { ApprovalWorkflowEngine } from '../lib/approval-workflow';

interface ApprovalCenterProps {
  currentUserRole: RoleType;
  currentUserId: string;
  currentBranchId: BranchId;
}

export default function ApprovalCenter({ currentUserRole, currentUserId, currentBranchId }: ApprovalCenterProps) {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([
    {
      id: 'apr-001',
      requestType: 'discount',
      requesterId: 'emp-001',
      requesterName: 'Min Thu',
      requesterRole: 'Sales',
      requesterBranch: 'b-yangon',
      resourceId: 'sale-001',
      resourceType: 'sale',
      resourceName: 'Sale #1234 - iPhone 15',
      description: 'Requested 20% discount for corporate customer',
      amount: 2000000,
      data: { originalPrice: 2500000, discountPercentage: 20 },
      status: 'pending',
      approvalChain: [
        { level: 'manager', approvers: ['mgr-001'], status: 'approved', approvedBy: 'mgr-001', approverName: 'John Manager', timestamp: '2024-12-19T10:00:00Z', comments: 'Approved' },
        { level: 'admin', approvers: ['admin-001'], status: 'pending' },
      ],
      currentLevel: 'admin',
      createdAt: '2024-12-19T08:00:00Z',
      updatedAt: '2024-12-19T10:00:00Z',
      expiresAt: '2024-12-26T08:00:00Z',
    },
    {
      id: 'apr-002',
      requestType: 'refund',
      requesterId: 'emp-002',
      requesterName: 'Kyi Lin',
      requesterRole: 'Cashier',
      requesterBranch: 'b-mandalay',
      resourceId: 'refund-001',
      resourceType: 'sale',
      resourceName: 'Sale #1235 - Refund Request',
      description: 'Customer requested full refund due to device defect',
      amount: 1800000,
      data: { reason: 'Device defect', originalPrice: 1800000 },
      status: 'pending',
      approvalChain: [
        { level: 'manager', approvers: ['mgr-002'], status: 'pending' },
        { level: 'admin', approvers: ['admin-001'], status: 'pending' },
      ],
      currentLevel: 'manager',
      createdAt: '2024-12-19T11:00:00Z',
      updatedAt: '2024-12-19T11:00:00Z',
      expiresAt: '2024-12-26T11:00:00Z',
    },
  ]);

  const [filteredStatus, setFilteredStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const APPROVAL_ICONS: Record<ApprovalType, React.ReactNode> = {
    discount: <Zap className="w-4 h-4" />,
    refund: <AlertCircle className="w-4 h-4" />,
    stock_adjustment: <Package className="w-4 h-4" />,
    purchase: <Package className="w-4 h-4" />,
    expense: <DollarSign className="w-4 h-4" />,
    transfer: <TrendingUp className="w-4 h-4" />,
    salary: <DollarSign className="w-4 h-4" />,
    leave: <Clock className="w-4 h-4" />,
    delete: <XCircle className="w-4 h-4" />,
  };

  const APPROVAL_COLORS: Record<ApprovalType, string> = {
    discount: 'bg-yellow-100 text-yellow-700',
    refund: 'bg-red-100 text-red-700',
    stock_adjustment: 'bg-blue-100 text-blue-700',
    purchase: 'bg-green-100 text-green-700',
    expense: 'bg-purple-100 text-purple-700',
    transfer: 'bg-indigo-100 text-indigo-700',
    salary: 'bg-pink-100 text-pink-700',
    leave: 'bg-orange-100 text-orange-700',
    delete: 'bg-red-100 text-red-700',
  };

  const canApprove = ['Owner', 'Super Admin', 'Admin', 'Branch Manager', 'HR Manager', 'Inventory Manager'].includes(currentUserRole);

  const myPendingApprovals = approvals.filter((a) => a.status === 'pending' && ApprovalWorkflowEngine.canUserApproveRequest(a.id, currentUserRole));

  const filteredApprovals = approvals.filter((a) => {
    const matchesStatus = filteredStatus === 'all' || a.status === filteredStatus;
    const matchesSearch = a.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApprove = (approvalId: string, comments?: string) => {
    const approval = approvals.find((a) => a.id === approvalId);
    if (!approval) return;

    const updated = ApprovalWorkflowEngine.approveRequest(approvalId, currentUserId, 'Current User', comments);
    if (updated) {
      setApprovals(approvals.map((a) => (a.id === approvalId ? updated : a)));
      setShowDetails(false);
      setSelectedApproval(null);
    }
  };

  const handleReject = (approvalId: string) => {
    const approval = approvals.find((a) => a.id === approvalId);
    if (!approval) return;

    const updated = ApprovalWorkflowEngine.rejectRequest(approvalId, currentUserId, 'Current User', rejectReason);
    if (updated) {
      setApprovals(approvals.map((a) => (a.id === approvalId ? updated : a)));
      setShowDetails(false);
      setSelectedApproval(null);
      setRejectReason('');
    }
  };

  const stats = {
    pending: approvals.filter((a) => a.status === 'pending').length,
    approved: approvals.filter((a) => a.status === 'approved').length,
    rejected: approvals.filter((a) => a.status === 'rejected').length,
    myPending: myPendingApprovals.length,
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Approval Center</h2>
            <p className="text-sm text-muted">Manage approval requests and workflows</p>
          </div>
        </div>
        {canApprove && stats.myPending > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
            <Bell className="w-4 h-4" />
            <span className="font-medium">{stats.myPending} pending for you</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-muted text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-muted text-sm">Approved</p>
          <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-muted text-sm">Rejected</p>
          <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-muted text-sm">Your Pending</p>
          <p className="text-3xl font-bold text-blue-600">{stats.myPending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border border-border mb-6">
        <div className="flex gap-4">
          <div className="flex-1 flex items-center gap-2 bg-surface rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-subtle" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <select
            value={filteredStatus}
            onChange={(e) => setFilteredStatus(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Approvals List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {filteredApprovals.length === 0 ? (
          <div className="flex items-center justify-center h-32 bg-card rounded-lg border border-border">
            <p className="text-subtle">No approvals found</p>
          </div>
        ) : (
          filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              onClick={() => {
                setSelectedApproval(approval);
                setShowDetails(true);
              }}
              className="bg-card rounded-lg border border-border p-4 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`p-2 rounded-lg ${APPROVAL_COLORS[approval.requestType]}`}>
                      {APPROVAL_ICONS[approval.requestType]}
                    </span>
                    <div>
                      <h4 className="font-semibold text-foreground">{approval.resourceName}</h4>
                      <p className="text-sm text-muted">{approval.description}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      approval.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : approval.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                  </span>
                  {approval.amount && (
                    <p className="text-lg font-bold text-foreground mt-2">
                      {(approval.amount / 1000000).toFixed(1)}M
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <div className="flex gap-4">
                  <span>By: {approval.requesterName}</span>
                  <span>Branch: {approval.requesterBranch}</span>
                  <span>{new Date(approval.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-1">
                  {approval.approvalChain.map((chain, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        chain.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : chain.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-elevated text-muted'
                      }`}
                    >
                      {chain.level}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Approval Request Details</h3>
              <button onClick={() => setShowDetails(false)} className="text-subtle hover:text-muted">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted font-medium">Request Type</p>
                  <p className="text-lg font-semibold text-foreground">{selectedApproval.requestType.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted font-medium">Status</p>
                  <p className={`text-lg font-semibold ${
                    selectedApproval.status === 'approved'
                      ? 'text-green-600'
                      : selectedApproval.status === 'rejected'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {selectedApproval.status.charAt(0).toUpperCase() + selectedApproval.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted font-medium">Resource</p>
                  <p className="text-lg font-semibold text-foreground">{selectedApproval.resourceName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted font-medium">Amount</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedApproval.amount ? `${(selectedApproval.amount / 1000000).toFixed(1)}M` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Requester Info */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted font-medium mb-2">Requester</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><span className="text-muted">Name:</span> {selectedApproval.requesterName}</div>
                  <div><span className="text-muted">Role:</span> {selectedApproval.requesterRole}</div>
                  <div><span className="text-muted">Branch:</span> {selectedApproval.requesterBranch}</div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted font-medium mb-2">Description</p>
                <p className="text-muted">{selectedApproval.description}</p>
              </div>

              {/* Approval Chain */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted font-medium mb-3">Approval Chain</p>
                <div className="space-y-2">
                  {selectedApproval.approvalChain.map((chain, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-l-4 ${
                        chain.status === 'approved'
                          ? 'bg-green-50 border-green-300'
                          : chain.status === 'rejected'
                          ? 'bg-red-50 border-red-300'
                          : 'bg-yellow-50 border-yellow-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground capitalize">{chain.level} Level</p>
                          <p className="text-sm text-muted">Approvers: {chain.approvers.join(', ')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded text-xs font-medium ${
                          chain.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : chain.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {chain.status}
                        </span>
                      </div>
                      {chain.approvedBy && (
                        <p className="text-xs text-muted mt-2">
                          {chain.approverName} on {new Date(chain.timestamp!).toLocaleDateString()}
                        </p>
                      )}
                      {chain.comments && <p className="text-sm text-muted mt-2 italic">{chain.comments}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {canApprove && selectedApproval.status === 'pending' && ApprovalWorkflowEngine.canUserApproveRequest(selectedApproval.id, currentUserRole) && (
                <div className="border-t border-border pt-4">
                  <div className="space-y-3">
                    <textarea
                      placeholder="Add comments (optional)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedApproval.id, rejectReason)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(selectedApproval.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
