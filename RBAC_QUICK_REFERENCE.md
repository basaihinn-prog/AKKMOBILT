# Enterprise RBAC - Quick Reference Guide

## Import Statements

```tsx
// Permission Checking
import { RBACEngine } from './lib/rbac-engine';

// Audit Logging  
import { AuditService } from './lib/audit-service';

// Approval Workflows
import { ApprovalWorkflowEngine } from './lib/approval-workflow';

// Types
import type { 
  RoleType, 
  PermissionSchema, 
  ApprovalRequest, 
  AuditLog,
  SessionInfo,
} from './types';
```

## Common Tasks

### 1. Check if User Can Access Module
```tsx
// Check if Cashier can access POS
RBACEngine.canAccessModule('Cashier', 'pos') // ✓ true

// Check if Technician can access Finance
RBACEngine.canAccessModule('Technician', 'finance') // ✗ false

// Dynamic check
if (RBACEngine.canAccessModule(userRole, 'pos')) {
  return <POSModule />;
}
```

### 2. Check if User Can Perform CRUD Operation
```tsx
// Check if Admin can create
RBACEngine.canCRUD('Admin', 'create') // ✓ true

// Check if Auditor can delete
RBACEngine.canCRUD('Auditor', 'delete') // ✗ false

// Wrap component
if (!RBACEngine.canCRUD(userRole, 'delete')) {
  return null; // Hide delete button
}
```

### 3. Check Specific Action Permission
```tsx
// Check if Sales can manage customer loyalty
RBACEngine.canPerformAction('Sales', 'customer.manageLoyalty') // ✓ true

// Check if Cashier can manage discounts
RBACEngine.canPerformAction('Cashier', 'financial.manageDiscounts') // ✗ false

// Use in conditional
if (RBACEngine.canPerformAction(userRole, 'financial.approveRefunds')) {
  // Show refund approval button
}
```

### 4. Check Approval Permission
```tsx
// Can Branch Manager approve expenses?
RBACEngine.canApprove('Branch Manager', 'expense') // ✓ true

// Can Cashier approve purchases?
RBACEngine.canApprove('Cashier', 'purchase') // ✗ false

// Check in component
if (RBACEngine.canApprove(userRole, 'discount')) {
  return <DiscountApprovalButton />;
}
```

### 5. Check Branch Access
```tsx
// Can Cashier access Yangon branch data?
RBACEngine.hasAccessToBranch('Cashier', 'b-yangon', 'b-yangon') // ✓ true

// Can Super Admin access any branch?
RBACEngine.hasAccessToBranch('Super Admin', 'b-yangon', 'b-mandalay') // ✓ true

// In route guard
if (!RBACEngine.hasAccessToBranch(userRole, userBranch, requestedBranch)) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### 6. Get Visible Pages for Role
```tsx
// What pages can Cashier see?
const pages = RBACEngine.getVisiblePages('Cashier');
// Returns: ['pos', 'vtu']

// Is Auditor allowed to see reports?
const canSee = RBACEngine.isPageVisible('Auditor', 'reports');
// Returns: true

// Render navigation based on role
<>
  {RBACEngine.isPageVisible(userRole, 'pos') && <POSLink />}
  {RBACEngine.isPageVisible(userRole, 'inventory') && <InventoryLink />}
  {RBACEngine.isPageVisible(userRole, 'finance') && <FinanceLink />}
</>
```

### 7. Check 2FA Requirement
```tsx
// Is 2FA required for Owner?
RBACEngine.isTwoFactorRequired('Owner') // ✓ true

// Is 2FA required for Cashier?
RBACEngine.isTwoFactorRequired('Cashier') // ✗ false

// Enforce 2FA for role
if (RBACEngine.isTwoFactorRequired(userRole)) {
  return <TwoFactorSetup />;
}
```

### 8. Log User Action
```tsx
import { AuditService } from './lib/audit-service';

AuditService.logAction({
  userId: currentUser.id,
  userName: currentUser.name,
  userRole: currentUser.role,
  branchId: currentUser.branchId,
  action: 'create',
  resourceType: 'sale',
  resourceId: sale.id,
  resourceName: `Sale #${sale.number}`,
  ipAddress: getClientIP(), // Get from request
  userAgent: navigator.userAgent,
  before: {}, // Previous state if update
  after: sale, // New state
});
```

### 9. Create Approval Request
```tsx
import { ApprovalWorkflowEngine } from './lib/approval-workflow';

const approval = ApprovalWorkflowEngine.createApprovalRequest({
  requestType: 'discount', // 'discount' | 'refund' | 'stock_adjustment' | 'purchase' | 'expense' | 'transfer' | 'salary' | 'leave' | 'delete'
  requesterId: currentUser.id,
  requesterName: currentUser.name,
  requesterRole: currentUser.role,
  requesterBranch: currentUser.branchId,
  resourceId: sale.id,
  resourceType: 'sale',
  resourceName: `Sale #${sale.number}`,
  description: 'Customer requested 20% discount for bulk purchase',
  amount: 500000, // Optional, in currency
  data: {
    originalPrice: 2500000,
    discountPercentage: 20,
    reason: 'Corporate customer',
  },
});

// Now approval.id can be used to track the request
```

### 10. Approve a Request
```tsx
const updated = ApprovalWorkflowEngine.approveRequest(
  approvalId,
  currentUserId,
  currentUserName,
  'Approved as discussed with management' // Optional comment
);

if (updated.status === 'approved') {
  // All levels approved, execute the operation
  executeSale(updated);
} else if (updated.status === 'pending') {
  // Still pending, wait for next level
  notifyNextApprover(updated);
}
```

### 11. Reject a Request
```tsx
const updated = ApprovalWorkflowEngine.rejectRequest(
  approvalId,
  currentUserId,
  currentUserName,
  'Price too low for this customer' // Reason required
);

// Notify requester
sendNotification(updated.requesterId, `Your approval request was rejected`);
```

### 12. Get Approval Chain for User
```tsx
const chainLevels = RBACEngine.getApprovalChain('Sales', 'discount');
// Returns: ['manager', 'admin', 'super_admin', 'owner']

const chainLevels2 = RBACEngine.getApprovalChain('Cashier', 'leave');
// Returns: ['manager', 'hr']
```

### 13. Get Pending Approvals for Current User
```tsx
const myApprovals = ApprovalWorkflowEngine.getPendingApprovalsForUser(
  currentUserId,
  currentUserRole
);

// Filter by type
const myDiscountApprovals = myApprovals.filter(
  a => a.requestType === 'discount'
);

// Count
console.log(`You have ${myApprovals.length} pending approvals`);
```

### 14. Get Audit Logs
```tsx
// Get all logs for a user
const userLogs = AuditService.getAuditLogs({
  userId: 'usr-001',
});

// Get logs for a date range
const monthLogs = AuditService.getAuditLogs({
  startDate: '2024-12-01',
  endDate: '2024-12-31',
  limit: 1000,
});

// Get logs by resource
const saleLogs = AuditService.getAuditLogs({
  resourceType: 'sale',
  action: 'create',
  branchId: 'b-yangon',
  limit: 50,
});
```

### 15. Create User Session
```tsx
const session = AuditService.createSession({
  userId: user.id,
  userName: user.name,
  role: user.role,
  branchId: user.branchId,
  deviceType: 'desktop', // 'desktop' | 'tablet' | 'mobile'
  deviceName: 'Windows PC',
  browser: 'Chrome',
  operatingSystem: 'Windows 10',
  ipAddress: getClientIP(),
});

// Store session.id for later use
localStorage.setItem('sessionId', session.id);
```

### 16. Update Session Activity
```tsx
// On every user action
AuditService.updateSessionActivity(sessionId);
```

### 17. End Session
```tsx
// On logout
AuditService.endSession(sessionId);
```

### 18. Track Login Attempt
```tsx
// Successful login
AuditService.logLoginAttempt(
  email,
  ipAddress,
  deviceFingerprint,
  true // success
);

// Failed login
AuditService.logLoginAttempt(
  email,
  ipAddress,
  deviceFingerprint,
  false, // failed
  'Invalid password' // reason
);

// Automatically detects suspicious patterns
// Logs security event if 5+ failed attempts in 30 min
```

### 19. Get Active Sessions
```tsx
// All active sessions
const activeSessions = AuditService.getActiveSessions();

// Sessions for specific user
const userSessions = AuditService.getActiveSessions({
  userId: 'usr-001',
});

// Sessions in branch
const branchSessions = AuditService.getActiveSessions({
  branchId: 'b-yangon',
});
```

### 20. Export Audit Logs as CSV
```tsx
const logs = AuditService.getAuditLogs({
  startDate: '2024-12-01',
  endDate: '2024-12-31',
  limit: 10000,
});

const csv = AuditService.exportAuditLogsCSV(logs);

// Download
const element = document.createElement('a');
element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
element.setAttribute('download', `audit_logs_${new Date().toISOString()}.csv`);
element.style.display = 'none';
document.body.appendChild(element);
element.click();
document.body.removeChild(element);
```

## Role Reference

### All 17 Roles (Quick Lookup)
```
Owner              → Full access, ownership rights, 2FA required
Super Admin        → All branches, full admin access, 2FA required
Admin              → Branch admin, limited settings access
Branch Manager     → Branch operations, can approve leave & transfers
Cashier            → POS transactions only, read-only customer view
Sales              → Sales & CRM, customer management
Technician         → Repair operations, parts inventory
Warehouse          → Inventory & transfers, assigned warehouse only
Inventory Manager  → Stock & purchasing, can approve purchases
Purchasing Officer → Supplier purchases, view reports
Accountant         → Financial records, taxes, banks
HR Manager         → Employee data, attendance, salary, leave approval
Customer Service   → Repair tickets, customer communication
Marketing          → Discounts, loyalty programs, campaigns
Auditor            → Read-only access across all modules
Read Only          → View-only, no operations, no API access
Customer           → Limited portal, view own repairs
```

## Module List (10 Modules)
```
pos          → Point of sale transactions
inventory    → Stock management and transfers  
finance      → Financial records and reports
hr           → Human resources management
repairs      → Device repair operations
crm          → Customer relationship management
vtu          → Airtime and data recharge
settings     → System configuration
auditLogs    → Audit trail access
userManagement → User and role management
```

## Common Patterns

### Conditional Rendering Based on Role
```tsx
import { RBACEngine } from './lib/rbac-engine';

function MyComponent({ userRole }) {
  if (!RBACEngine.canAccessModule(userRole, 'finance')) {
    return <AccessDenied />;
  }

  return (
    <>
      {RBACEngine.canCRUD(userRole, 'create') && (
        <button>Create Record</button>
      )}
      {RBACEngine.canPerformAction(userRole, 'financial.viewReports') && (
        <ReportsButton />
      )}
    </>
  );
}
```

### Approval Workflow in Action
```tsx
async function requestDiscount(sale: Sale, discountPercent: number) {
  // Check if user can request discount
  if (!RBACEngine.canCRUD(userRole, 'create')) {
    return alert('You cannot request discounts');
  }

  // Create approval request
  const approval = ApprovalWorkflowEngine.createApprovalRequest({
    requestType: 'discount',
    requesterId: user.id,
    requesterName: user.name,
    requesterRole: user.role,
    requesterBranch: user.branchId,
    resourceId: sale.id,
    resourceType: 'sale',
    resourceName: `Sale #${sale.id}`,
    description: `Requested ${discountPercent}% discount`,
    amount: (sale.total * discountPercent) / 100,
    data: { originalPrice: sale.total, discountPercentage: discountPercent },
  });

  // Log the action
  AuditService.logAction({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    branchId: user.branchId,
    action: 'create',
    resourceType: 'approval',
    resourceId: approval.id,
    resourceName: 'Discount Request',
    ipAddress: getClientIP(),
    userAgent: navigator.userAgent,
    after: approval,
  });

  return approval;
}
```

### Admin Approval Handler
```tsx
function ApprovalHandler({ approval, currentUserRole, currentUserId }) {
  // Check if user can approve
  if (!ApprovalWorkflowEngine.canUserApproveRequest(approval.id, currentUserRole)) {
    return <div>Not your approval to handle</div>;
  }

  const handleApprove = (comments: string) => {
    const updated = ApprovalWorkflowEngine.approveRequest(
      approval.id,
      currentUserId,
      'Current User',
      comments
    );

    // Log approval action
    AuditService.logAction({
      userId: currentUserId,
      userName: 'Current User',
      userRole: currentUserRole,
      branchId: currentUserBranch,
      action: 'approve',
      resourceType: 'approval',
      resourceId: approval.id,
      resourceName: `${approval.requestType} Request`,
      ipAddress: getClientIP(),
      userAgent: navigator.userAgent,
      before: approval,
      after: updated,
    });

    // Execute if fully approved
    if (updated.status === 'approved') {
      executeApprovedAction(updated);
    }
  };

  return <ApprovalForm onApprove={handleApprove} />;
}
```

## Database Schema (Future)

When migrating to database, use these tables:

```sql
-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id VARCHAR(50),
  user_name VARCHAR(100),
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id VARCHAR(50),
  resource_name VARCHAR(255),
  branch_id VARCHAR(50),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20),
  timestamp TIMESTAMP,
  INDEX (user_id, timestamp),
  INDEX (resource_type, resource_id)
);

-- Approval Requests
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY,
  request_type VARCHAR(50),
  requester_id VARCHAR(50),
  status VARCHAR(20),
  approval_chain JSONB,
  current_level VARCHAR(50),
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  INDEX (status, current_level),
  INDEX (requester_id)
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id VARCHAR(50),
  login_time TIMESTAMP,
  logout_time TIMESTAMP,
  ip_address VARCHAR(45),
  is_active BOOLEAN,
  INDEX (user_id, is_active)
);
```

---

## Troubleshooting

### Permission Check Not Working?
```tsx
// 1. Verify role name is correct
console.log('User role:', userRole); // Should match one of 17 roles

// 2. Verify module name exists
console.log('Module exists:', Object.keys(RBACEngine.getRoleDefinition(userRole).modules));

// 3. Test with known role
console.log(RBACEngine.canAccessModule('Owner', 'pos')); // Should be true
```

### Approval Not Advancing?
```tsx
// 1. Check current level
console.log('Current level:', approval.currentLevel);

// 2. Check approval chain structure
console.log('Chain:', approval.approvalChain);

// 3. Verify approver role matches level
const userLevel = ApprovalWorkflowEngine.roleToApprovalLevel(userRole);
console.log('User can approve at level:', userLevel);
```

### Audit Logs Not Saving?
```tsx
// 1. Check all required fields are provided
// 2. Verify logging happens after state change
// 3. Check browser console for errors
AuditService.getAuditLogs().then(logs => {
  console.log('Total logs:', logs.length);
});
```

---

For more details, see `RBAC_IMPLEMENTATION_GUIDE.md`
