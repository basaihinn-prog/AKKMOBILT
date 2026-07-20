# AKK Mobile Enterprise Suite - Production Deployment Guide

## Deployment Status

### ✅ Completed Components

#### 1. Database Schema (27 Tables)
- **Core**: Companies, Branches, Roles, Auth Users
- **Products**: Categories, Brands, Models, Products, Warehouses, Inventory
- **Sales**: Sales, Sale Items
- **Repairs**: Repairs, Repair Services, Repair Types
- **Customers**: Customers, Loyalty Programs
- **Purchases**: Suppliers, Purchases, Purchase Items
- **Accounting**: Expenses, Taxes, Discounts, Banks
- **Tracking**: IMEI Tracking, Audit Logs, Login Attempts, Session Info
- **Workflows**: Approval Requests

#### 2. Data Access Layer (6 Services)
```
✓ products.ts      - Product catalog operations
✓ sales.ts         - POS and transaction processing
✓ repairs.ts       - Repair ticket lifecycle
✓ customers.ts     - CRM and loyalty management
✓ inventory.ts     - Stock management and transfers
✓ accounting.ts    - Financial reporting
✓ imei.ts          - Device tracking system
```

#### 3. API Endpoints (8 Routes)
```
✓ /api/products        - Product management
✓ /api/sales           - Sales transactions
✓ /api/repairs         - Repair operations
✓ /api/customers       - Customer management
✓ /api/inventory       - Stock operations
✓ /api/accounting      - Financial reporting
✓ /api/imei            - Device tracking
✓ /api/branches        - Branch management
✓ /api/transfers       - Inter-branch stock transfers
✓ /api/vtu             - E-load/mobile recharge
✓ /api/notifications   - SMS/Telegram messaging
✓ /api/online-orders   - E-commerce orders
✓ /api/pos/checkout    - POS transaction finalization
```

#### 4. React Integration
```
✓ useSupabaseData hook - Centralized data fetching
✓ Supabase clients     - Browser and server-side
✓ Utility generators   - Auto-numbering for sales/tickets
```

#### 5. Documentation
```
✓ INTEGRATION_GUIDE.md        - Data layer architecture
✓ PRODUCTION_DEPLOYMENT.md    - This deployment guide
```

## Pre-Deployment Checklist

### Infrastructure
- [ ] Supabase project created (https://supabase.com/dashboard)
- [ ] Database schema deployed to production
- [ ] Vercel project connected and deployed
- [ ] Environment variables configured in Vercel Settings

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### Database Setup
- [ ] All 27 tables created
- [ ] Indexes and triggers applied
- [ ] Updated at triggers configured
- [ ] Foreign key constraints validated

### Authentication & Security
- [ ] Row Level Security (RLS) policies created for sensitive tables
- [ ] API keys rotated and secured
- [ ] Audit logging enabled
- [ ] User roles and permissions configured

## Next Steps to Full Production Readiness

### Phase 1: Core Operations (Week 1)

#### 1. Complete POS System
**Files to Update**: `App.tsx` → POS section
```typescript
// Replace mock fetchProducts/fetchInventory with:
const { products, inventory, refetch } = useSupabaseData({
  companyId: userCompanyId,
  branchId: activeBranchId,
  warehouseId: activeWarehouseId
});

// Replace handleCheckoutSubmit with API call:
const response = await fetch('/api/pos/checkout', {
  method: 'POST',
  body: JSON.stringify({
    branchId: activeBranchId,
    items: posCart,
    customerId: selectedCustomerId,
    paymentMethod,
  })
});
```

**Expected Outcome**: Live POS with real inventory deduction and IMEI tracking

#### 2. Complete Repair Center
**Files to Update**: `RepairCenter.tsx`
```typescript
// Import repair services
import { createRepair, updateRepairStatus, getRepairs } from '@/lib/supabase/services/repairs';

// Replace mock data loading:
const [repairs, setRepairs] = useState([]);
useEffect(() => {
  getRepairs(branchId).then(setRepairs);
}, [branchId]);
```

**Expected Outcome**: Live repair ticket creation and status tracking

#### 3. Inventory Management
**Files to Update**: `App.tsx` → Inventory tab
```typescript
// Replace inventory operations with live API:
const handleAdjustStock = async (warehouseId, productId, quantity) => {
  await fetch('/api/inventory', {
    method: 'POST',
    body: JSON.stringify({ warehouseId, productId, quantity })
  });
  refetch.inventory();
};
```

**Expected Outcome**: Real-time stock adjustments and low-stock alerts

### Phase 2: Financial & Reporting (Week 2)

#### 4. Daily Financial Reports
**New File**: `src/components/DailyReport.tsx`
```typescript
import { getDailyReport } from '@/lib/supabase/services/accounting';

// Create report component showing:
// - Total sales by payment method
// - Tax collected
// - Expenses approved
// - Net profit/loss
```

**Expected Outcome**: Accurate daily profit & loss reporting

#### 5. Expense Management
**Files to Update**: `AccountingSubTab.tsx`
```typescript
// Connect to real API:
const handleRecordExpense = async (expenseData) => {
  const response = await fetch('/api/accounting', {
    method: 'POST',
    body: JSON.stringify({
      branchId: activeBranchId,
      category: expenseData.category,
      amount: expenseData.amount,
      description: expenseData.description,
    })
  });
};
```

**Expected Outcome**: Approval workflows for expenses over thresholds

#### 6. IMEI Warranty Tracking
**New File**: `src/components/IMEITracking.tsx`
```typescript
import { getIMEIStats, getExpiredWarrantyIMEIs } from '@/lib/supabase/services/imei';

// Show dashboard:
// - Total IMEIs registered
// - Warranty expiring soon
// - Warranty expired count
// - Devices reported lost/stolen
```

**Expected Outcome**: Warranty management and extended warranty upsell tracking

### Phase 3: Multi-Branch Operations (Week 3)

#### 7. Stock Transfers
**Files to Update**: `App.tsx` → Stock Transfer section
```typescript
// Wire to real API:
const handleRequestTransfer = async (transfer) => {
  await fetch('/api/transfers', {
    method: 'POST',
    body: JSON.stringify(transfer)
  });
};
```

**Expected Outcome**: Inter-branch inventory rebalancing

#### 8. Company Dashboard
**Files to Update**: `AdminDashboard.tsx`
```typescript
// Add company-wide metrics:
// - Total revenue across branches
// - Total inventory value
// - Cash flow summary
// - Top products by sales
// - Branch performance comparison
```

### Phase 4: Advanced Features (Week 4)

#### 9. Real-time Notifications
Add Supabase Realtime listeners for:
- New sales transactions
- Repair status changes
- Low stock alerts
- Expense approvals needed

#### 10. Approval Workflows
Create approval request system using `approval_requests` table:
- Large expenses
- Stock transfers between branches
- Purchase orders over budget

#### 11. Printing & Exports
Add reporting module:
- Print POS receipts
- Generate PDF invoices
- Export daily close reports
- Export financial statements

## Data Migration (If Needed)

If migrating from existing system:

```typescript
// src/lib/migration/importData.ts
export async function migrateFromLegacySystem() {
  // 1. Import products
  // 2. Import customers
  // 3. Import historical sales (archive old, link to new)
  // 4. Import inventory levels
  // 5. Validate data integrity
}
```

## Testing Checklist

### Unit Tests
- [ ] Product queries return correct data
- [ ] Sale creation decrements inventory
- [ ] IMEI registration prevents duplicates
- [ ] Repair status transitions valid
- [ ] Financial calculations accurate

### Integration Tests
- [ ] Complete POS flow (select products → checkout → receipt)
- [ ] Complete repair flow (intake → diagnostic → parts replacement → delivery)
- [ ] Inter-branch transfer (request → approve → receive)
- [ ] Customer loyalty points accumulation

### Performance Tests
- [ ] Dashboard loads in < 2 seconds
- [ ] POS search completes in < 500ms
- [ ] Daily report generation in < 5 seconds
- [ ] Handle 100+ concurrent POS transactions

### Security Tests
- [ ] Unauthorized users cannot access other branches
- [ ] Employees cannot modify finished sales
- [ ] Audit log records all modifications
- [ ] Sensitive data encrypted

## Performance Optimization

### Database
- [ ] Enable query caching for product catalog
- [ ] Add composite indexes on frequently joined columns
- [ ] Archive old transactions monthly

### Frontend
- [ ] Implement pagination for sales/repairs lists (50 items/page)
- [ ] Lazy load product images
- [ ] Cache metadata (brands, categories) locally
- [ ] Debounce search queries

### API
- [ ] Add response caching headers
- [ ] Implement request rate limiting
- [ ] Use CDN for static assets
- [ ] Enable gzip compression

## Monitoring & Alerts

Set up monitoring for:
- [ ] API response times
- [ ] Database query performance
- [ ] Error rates and types
- [ ] Failed transactions
- [ ] Inventory discrepancies
- [ ] Revenue by branch/day

## Disaster Recovery

- [ ] Enable Supabase automated backups
- [ ] Test backup restoration weekly
- [ ] Document manual recovery procedures
- [ ] Keep offline inventory records

## Support & Maintenance

### Regular Tasks
- Weekly: Review audit logs for anomalies
- Monthly: Analyze financial reports for discrepancies
- Monthly: Archive completed repairs older than 90 days
- Quarterly: Performance optimization review

### Issue Resolution
1. Check application logs
2. Query Supabase audit logs
3. Review transaction history
4. Restore from backup if needed

## Success Metrics

After full implementation, track:
- ✓ Zero manual inventory reconciliation needed
- ✓ All POS transactions traceable to source
- ✓ Financial reports accurate within 1 MMK
- ✓ Repair turnaround time reduced 20%
- ✓ Customer lookup instant (no delays)
- ✓ 99.9% uptime achieved

## Rollback Plan

If critical issues occur:
1. Switch DNS/load balancer to previous version
2. Restore database from backup dated before issue
3. Notify support team and document incident
4. Root cause analysis and fix
5. Test fixes in staging environment
6. Redeploy to production

---

**Deployment Date**: [To be filled]
**Production URL**: https://[your-vercel-domain].vercel.app
**Supabase Project**: https://supabase.com/dashboard/project/[project-id]
**Support Team**: [Your team contact]
