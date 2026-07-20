# Complete Enterprise RBAC & Permission System - Implementation Guide

## Overview

This guide documents the complete Enterprise Role-Based Access Control (RBAC) system built for the AKK Mobile Enterprise Suite. The system includes 17 predefined roles, comprehensive permission management, multi-level approval workflows, audit logging, and security features.

## Architecture

### Core Components

#### 1. **Type Definitions** (`src/types.ts`)
Extended with 243 lines of new types including:
- 17 role types with hierarchy
- Comprehensive `PermissionSchema` with modules, CRUD, financial, inventory, repair, customer, and approval permissions
- `ApprovalRequest` for workflow management
- User management types: `UserProfile`, `EmployeeProfile`, `Team`, `Department`
- HR types: `AttendanceRecord`, `LeaveRequest`, `PayrollRecord`, `CommissionRecord`
- Security types: `SessionInfo`, `LoginAttempt`, `SecurityEvent`, `AuditLogDetail`

#### 2. **RBAC Engine** (`src/lib/rbac-engine.ts` - 1,426 lines)
Complete permission checking system with:
- `RBACEngine` class with static methods for permission validation
- 17 role definitions with granular permissions for each
- Methods: `canAccessModule()`, `canCRUD()`, `canPerformAction()`, `canApprove()`, `hasAccessToBranch()`
- Approval chain generation based on role hierarchy
- Permission export and role cloning functionality

#### 3. **Audit Service** (`src/lib/audit-service.ts` - 426 lines)
Comprehensive logging system:
- `logAction()`: Log all user actions with before/after changes
- `logLoginAttempt()`: Track login attempts and failed login patterns
- `logSecurityEvent()`: Log security-related events
- Session management: `createSession()`, `endSession()`, `updateSessionActivity()`
- Query methods with filters: `getAuditLogs()`, `getActivityTimeline()`, `getLoginHistory()`
- Cleanup and export: `cleanupOldLogs()`, `exportAuditLogsCSV()`

#### 4. **Approval Workflow Engine** (`src/lib/approval-workflow.ts` - 348 lines)
Multi-level approval management:
- `ApprovalWorkflowEngine` class for request lifecycle
- `createApprovalRequest()`: Create requests with automatic approval chain
- `approveRequest()`, `rejectRequest()`, `escalateRequest()`: Workflow actions
- `getPendingApprovalsForUser()`: Filter requests by user role
- Statistics: `getApprovalStats()`, `getAverageApprovalTime()`
- Expiry management: `isRequestExpired()`, `cleanupExpiredRequests()`

### UI Components

#### 1. **User Management** (`src/components/UserManagement.tsx` - 341 lines)
- List, create, edit, delete users
- Role and status filtering
- Bulk actions (activate/deactivate)
- User detail view with employment information
- Permission checks: Only Owner/Super Admin/Admin/HR Manager can manage users

#### 2. **Attendance & Payroll** (`src/components/AttendancePayroll.tsx` - 407 lines)
Three tabs:
- **Attendance**: Check-in/out tracking, work hours, status (present/absent/late)
- **Leave**: Request management with approval workflow (pending/approved/rejected)
- **Payroll**: Monthly salary calculation with approval and payment processing
- Role-based access: Branch managers can approve leave, HR can manage payroll

#### 3. **Permission Builder** (`src/components/EnterprisePermissionBuilder.tsx` - 489 lines)
Visual RBAC interface for Owner/Super Admin:
- Create custom roles by cloning system roles
- Toggle module access (10 modules)
- Configure CRUD operations
- Set approval permissions (9 types)
- Branch and warehouse restrictions
- Advanced features: Financial data restriction, 2FA requirement
- Role statistics and user count

#### 4. **Approval Center** (`src/components/ApprovalCenter.tsx` - 414 lines)
Centralized approval management:
- Pending approval queue with filtering
- Detailed approval request view with full chain
- Approve/reject with comments
- Escalation support
- Statistics dashboard (pending, approved, rejected, user's pending)
- Color-coded approval types

#### 5. **Security & Audit** (`src/components/SecurityAudit.tsx` - 414 lines)
Five tabs:
- **Audit Logs**: All system actions with timestamp, user, resource, status
- **Activity Timeline**: User activity feed with severity levels
- **Login Attempts**: Track successful/failed logins by IP and device
- **Sessions**: Active and terminated user sessions with device info
- **Security Events**: Unauthorized access and security incidents
- Only accessible to Owner/Super Admin/Admin/Auditor

## 17 Predefined Roles

### 1. **Owner**
- Full system access with ownership rights
- All modules enabled, all permissions granted
- 2FA required, no branch/warehouse restriction
- Can create/edit/delete/approve everything

### 2. **Super Admin**
- Complete administrative control across all branches
- Same permissions as Owner, applicable across all branches
- 2FA required
- Can delegate to Admins

### 3. **Admin**
- Administrative access across assigned branch
- Cannot access: Settings, Taxes, Banks, Advanced Settings
- Cannot approve: Refunds, Salary, Leave, Delete operations
- Branch-restricted access

### 4. **Branch Manager**
- Manages operations for assigned branch
- Can approve: Stock adjustments, purchases, expenses, transfers, leave
- Cannot approve: Discounts, refunds, salary, delete
- Warehouse-restricted access

### 5. **Cashier**
- Point-of-sale transactions only
- Access: POS, VTU, basic inventory view
- Cannot create custom records or manage inventory
- Read-only for customers

### 6. **Sales**
- Manages customer sales and relationships
- Access: POS, inventory, repairs, CRM
- Can manage customers, loyalty, communication
- Cannot approve any requests

### 7. **Technician**
- Device repair operations
- Access: Inventory, repairs modules
- Can adjust stock (repair parts), complete repairs
- Customer: View profiles and history only

### 8. **Warehouse**
- Warehouse inventory and stock management
- Access: Inventory module, assigned warehouse only
- Can adjust stock and manage transfers
- Cannot manage purchases

### 9. **Inventory Manager**
- Inventory, stock levels, and orders management
- Access: Inventory, Finance modules
- Can approve: Stock adjustments, purchases, transfers
- Can view reports

### 10. **Purchasing Officer**
- Supplier purchases and orders
- Access: Inventory, Finance modules
- Can manage purchase orders
- Cannot approve any operations

### 11. **Accountant**
- Financial records and reporting
- Access: Inventory, Finance, Audit Logs
- Can manage: Taxes, banks, payment methods
- View reports only

### 12. **HR Manager**
- Human resources and employee data
- Access: Finance, HR, User Management, Audit Logs
- Can approve: Salary, leave requests
- Can manage: Employees, departments, teams, attendance, payroll

### 13. **Customer Service**
- Customer support and communication
- Access: Repairs, CRM modules
- Can view tickets and create support records
- Manage customer communication

### 14. **Marketing**
- Marketing campaigns and promotions
- Access: CRM module
- Can manage: Discounts, loyalty programs, customer communication
- View customer data

### 15. **Auditor**
- Read-only access across all modules
- Can view: All records, audit logs, reports
- Cannot create, update, or delete anything
- Security event visibility

### 16. **Read Only**
- View-only access across all modules except settings
- Can view: POS, inventory, finance, HR, repairs, CRM, VTU
- No approval permissions
- No API write access

### 17. **Customer**
- Limited customer portal access
- Access: Repairs module only (view own repairs)
- Can create repair tickets
- View own history

## Integration Steps

### Step 1: Add Components to App.tsx
```tsx
import UserManagement from './components/UserManagement';
import AttendancePayroll from './components/AttendancePayroll';
import EnterprisePermissionBuilder from './components/EnterprisePermissionBuilder';
import ApprovalCenter from './components/ApprovalCenter';
import SecurityAudit from './components/SecurityAudit';

// In your admin tab routing:
case 'user-management':
  return <UserManagement currentUserRole={userRole} currentBranchId={branchId} />;
case 'attendance-payroll':
  return <AttendancePayroll currentUserRole={userRole} currentBranchId={branchId} />;
case 'permission-builder':
  return <EnterprisePermissionBuilder currentUserRole={userRole} />;
case 'approvals':
  return <ApprovalCenter currentUserRole={userRole} currentUserId={userId} currentBranchId={branchId} />;
case 'security-audit':
  return <SecurityAudit currentUserRole={userRole} currentBranchId={branchId} />;
```

### Step 2: Add Permission Checks to Existing Modules
Wrap module rendering with permission checks:
```tsx
import { RBACEngine } from './lib/rbac-engine';

if (!RBACEngine.canAccessModule(userRole, 'pos')) {
  return <div>Access Denied</div>;
}
```

### Step 3: Implement Audit Logging
Log all important actions:
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
  resourceName: sale.description,
  ipAddress: getClientIP(),
  userAgent: navigator.userAgent,
  before: {},
  after: sale,
});
```

### Step 4: Add Approval Workflows
For discount/refund requests:
```tsx
import { ApprovalWorkflowEngine } from './lib/approval-workflow';

const approval = ApprovalWorkflowEngine.createApprovalRequest({
  requestType: 'discount',
  requesterId: currentUser.id,
  requesterName: currentUser.name,
  requesterRole: currentUser.role,
  requesterBranch: currentUser.branchId,
  resourceId: sale.id,
  resourceType: 'sale',
  resourceName: `Sale #${sale.number}`,
  description: `Requested ${discount}% discount`,
  amount: discountAmount,
  data: { originalPrice, discountPercentage },
});
```

### Step 5: Server-Side Integration
Add middleware to Express server for authorization:
```ts
// In server.ts
app.use((req, res, next) => {
  const userRole = req.user?.role;
  const branch = req.user?.branchId;
  
  if (!RBACEngine.canAccessModule(userRole, 'pos')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});
```

## Permission Matrix

### Module Access Grid
```
Role                    POS | INV | FIN | HR  | REP | CRM | VTU | SET | LOG | USR
Owner                   Y   | Y   | Y   | Y   | Y   | Y   | Y   | Y   | Y   | Y
Super Admin             Y   | Y   | Y   | Y   | Y   | Y   | Y   | Y   | Y   | Y
Admin                   Y   | Y   | Y   | Y   | Y   | Y   | Y   | N   | Y   | Y
Branch Manager          Y   | Y   | Y   | Y   | Y   | Y   | Y   | N   | N   | N
Cashier                 Y   | N   | N   | N   | N   | N   | Y   | N   | N   | N
Sales                   Y   | Y   | N   | N   | Y   | Y   | N   | N   | N   | N
Technician              N   | Y   | N   | N   | Y   | N   | N   | N   | N   | N
Warehouse               N   | Y   | N   | N   | N   | N   | N   | N   | N   | N
Inventory Manager       N   | Y   | Y   | N   | N   | N   | N   | N   | N   | N
Purchasing Officer      N   | Y   | Y   | N   | N   | N   | N   | N   | N   | N
Accountant              N   | Y   | Y   | N   | N   | N   | N   | N   | Y   | N
HR Manager              N   | N   | Y   | Y   | N   | N   | N   | N   | Y   | Y
Customer Service        N   | N   | N   | N   | Y   | Y   | N   | N   | N   | N
Marketing               N   | N   | N   | N   | N   | Y   | N   | N   | N   | N
Auditor                 Y   | Y   | Y   | Y   | Y   | Y   | Y   | N   | Y   | Y
Read Only               Y   | Y   | Y   | Y   | Y   | Y   | Y   | N   | N   | N
Customer                N   | N   | N   | N   | Y   | N   | N   | N   | N   | N
```

### Approval Permissions
```
Role                  Disc | Refund | Stock | Purch | Exp  | Trans | Sal  | Leave | Del
Owner                 Y    | Y      | Y     | Y     | Y    | Y     | Y    | Y     | Y
Super Admin           Y    | Y      | Y     | Y     | Y    | Y     | Y    | Y     | Y
Admin                 Y    | Y      | Y     | Y     | Y    | Y     | N    | N     | N
Branch Manager        N    | N      | Y     | Y     | Y    | Y     | N    | Y     | N
HR Manager            N    | N      | N     | N     | N    | N     | Y    | Y     | N
Inventory Manager     N    | N      | Y     | Y     | N    | Y     | N    | N     | N
All Others            N    | N      | N     | N     | N    | N     | N    | N     | N
```

## Security Features

1. **Two-Factor Authentication Ready** - System supports 2FA enforcement for Owner/Super Admin
2. **IP Whitelisting** - Can restrict roles to specific IP addresses
3. **Session Management** - Track active sessions, device fingerprints, browser/OS
4. **Failed Login Detection** - Alert on multiple failed login attempts (5+ in 30 min)
5. **Audit Trail** - Complete logging of all actions with before/after changes
6. **Activity Timeline** - User-friendly activity feed with severity levels
7. **Security Events** - Track unauthorized access attempts and suspicious activities
8. **90-Day Log Retention** - Automatic cleanup of old audit records
9. **Password Policy** - Configurable requirements (length, case, numbers, special chars)
10. **Device Tracking** - Monitor user sessions by device, browser, OS, IP

## Approval Workflow Levels

1. **Manager Level**: Branch Manager, Team Lead
2. **Admin Level**: Admin, Department Head
3. **Super Admin Level**: Super Admin
4. **Owner Level**: Owner (final approval)

Escalation rules:
- Discount → Manager → Admin → Super Admin → Owner
- Refund → Manager → Admin → Super Admin
- Stock Adjustment → Inventory Manager → Admin
- Purchase → Inventory Manager → Admin → Super Admin
- Expense → Manager → Admin
- Transfer → Warehouse → Admin
- Salary → HR → Super Admin → Owner
- Leave → Manager → HR
- Delete → Admin → Super Admin → Owner

## Usage Examples

### Check Permission Before Action
```tsx
import { RBACEngine } from './lib/rbac-engine';

if (RBACEngine.canPerformAction(userRole, 'financial.approveRefunds')) {
  // Show approve button
}
```

### Get User's Visible Pages
```tsx
const visiblePages = RBACEngine.getVisiblePages(userRole);
const canViewAnalytics = RBACEngine.isPageVisible(userRole, 'analytics');
```

### Create Approval Request
```tsx
const approval = ApprovalWorkflowEngine.createApprovalRequest({
  requestType: 'discount',
  requesterId: user.id,
  requesterName: user.name,
  requesterRole: user.role,
  requesterBranch: user.branchId,
  resourceId: sale.id,
  resourceType: 'sale',
  resourceName: `Sale #${sale.id}`,
  description: 'Customer requested 20% discount',
  amount: 500000,
  data: { discountPercentage: 20 },
});
```

### Log User Activity
```tsx
AuditService.logAction({
  userId: user.id,
  userName: user.name,
  userRole: user.role,
  branchId: user.branchId,
  action: 'update',
  resourceType: 'inventory',
  resourceId: item.id,
  resourceName: item.name,
  ipAddress: '192.168.1.100',
  userAgent: navigator.userAgent,
  before: { quantity: 50 },
  after: { quantity: 45 },
});
```

### Get Audit Logs
```tsx
const logs = AuditService.getAuditLogs({
  userId: 'user-123',
  resourceType: 'sale',
  action: 'create',
  branchId: 'b-yangon',
  startDate: '2024-12-01',
  endDate: '2024-12-31',
  limit: 100,
});
```

## Database Schema Recommendations

For production, migrate in-memory storage to database:

```sql
-- Audit Logs Table
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
  INDEX (resource_type, resource_id),
  INDEX (branch_id, timestamp)
);

-- Approval Requests Table
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY,
  request_type VARCHAR(50),
  requester_id VARCHAR(50),
  requester_name VARCHAR(100),
  requester_role VARCHAR(50),
  resource_id VARCHAR(50),
  resource_type VARCHAR(50),
  status VARCHAR(20),
  approval_chain JSONB,
  current_level VARCHAR(50),
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  INDEX (status, current_level),
  INDEX (requester_id)
);

-- Sessions Table
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id VARCHAR(50),
  login_time TIMESTAMP,
  logout_time TIMESTAMP,
  ip_address VARCHAR(45),
  device_fingerprint VARCHAR(255),
  is_active BOOLEAN,
  INDEX (user_id, is_active),
  INDEX (login_time)
);
```

## Next Steps

1. **API Integration**: Add permission middleware to all Express routes
2. **Database Migration**: Replace in-memory storage with PostgreSQL
3. **UI Integration**: Add components to existing admin tabs in App.tsx
4. **Testing**: Unit tests for permission checks, integration tests for workflows
5. **Monitoring**: Set up alerts for security events and failed approvals
6. **Documentation**: Create user guides for each role and permissions

## Support & Maintenance

- Audit logs are retained for 90 days by default (configurable)
- Expired approval requests are automatically cleaned up
- Session timeout recommendations: 30 minutes inactivity
- Password expiry recommendations: Every 90 days
- 2FA should be enforced for Owner/Super Admin/Admin roles
