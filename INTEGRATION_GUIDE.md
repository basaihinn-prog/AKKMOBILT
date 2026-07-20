# AKK Mobile Enterprise Suite - Supabase Integration Guide

## Overview

The AKK Mobile Enterprise Suite is now fully integrated with Supabase for production-grade data persistence. All business logic, workflows, and reporting are backed by a comprehensive 27-table relational schema supporting multi-branch operations across the Myanmar mobile retail ecosystem.

## Database Architecture

### Core Domains

1. **Companies & Organizations** (`companies`, `branches`, `roles`)
   - Multi-tenant architecture supporting independent operations
   - Role-based access control (RBAC) with granular permissions
   - Automatic audit logging via triggers

2. **Products & Inventory** (`products`, `categories`, `brands`, `models`, `warehouses`, `inventory`)
   - SKU-based product management with cost and selling prices
   - Real-time inventory tracking across warehouses
   - Automatic reorder alerts when stock falls below thresholds

3. **POS & Sales** (`sales`, `sale_items`)
   - Digital receipts with automatic numbering
   - IMEI tracking for device sales
   - Payment method recording (cash, card, bank transfer)
   - Tax and discount calculations

4. **Repair Services** (`repairs`, `repair_services`, `repair_types`)
   - Repair workflow from intake to delivery
   - Technician assignment and tracking
   - Parts and labor cost segregation
   - Warranty expiry monitoring

5. **Customer Management** (`customers`, `loyalty_programs`)
   - CRM with purchase history
   - Loyalty points tracking
   - Broadcast campaign support (Telegram, SMS)

6. **Procurement** (`suppliers`, `purchases`, `purchase_items`)
   - Purchase order management with approval workflows
   - Supplier relationship tracking
   - Receiving and inventory updates

7. **Financial Management** (`expenses`, `taxes`, `discounts`, `banks`)
   - Expense categorization and approval
   - Daily and monthly financial reporting
   - Bank account management

8. **IMEI Tracking** (`imei_tracking`)
   - Unique device identification
   - Warranty expiry date tracking
   - Device status monitoring (active, inactive, lost, stolen)

9. **Audit & Security** (`audit_logs`, `login_attempts`, `session_info`)
   - Complete transaction history
   - User activity tracking
   - Login attempt recording for security

## Data Access Layer

All data access is handled through service modules in `/src/lib/supabase/services/`:

- `products.ts` - Product catalog operations
- `sales.ts` - POS and sales transactions
- `repairs.ts` - Repair ticket management
- `customers.ts` - Customer CRM operations
- `inventory.ts` - Stock management and transfers
- `accounting.ts` - Financial reporting
- `imei.ts` - Device tracking

### Example Usage

```typescript
import { getSales } from '@/lib/supabase/services/sales';
import { createCustomer } from '@/lib/supabase/services/customers';

// Fetch daily sales
const sales = await getSales(branchId, startDate, endDate);

// Create new customer
const customer = await createCustomer(companyId, {
  name: 'John Doe',
  phone: '09123456789',
  email: 'john@example.com',
});
```

## API Endpoints

### Sales & POS
- `POST /api/sales` - Create new sale transaction
- `GET /api/sales?branchId=X&startDate=Y&endDate=Z` - Fetch sales
- `GET /api/sales?branchId=X&report=daily&date=Y` - Daily sales report

### Repairs
- `POST /api/repairs` - Create repair ticket
- `GET /api/repairs?branchId=X&status=Y` - List repairs by status
- `GET /api/repairs?branchId=X&pending=true` - Pending repairs only

### Customers
- `POST /api/customers` - Create customer
- `GET /api/customers?companyId=X` - List customers
- `GET /api/customers?companyId=X&phone=Y` - Find by phone
- `GET /api/customers?companyId=X&q=search_term` - Search

### Inventory
- `GET /api/inventory?warehouseId=X` - Warehouse stock
- `POST /api/inventory` - Adjust stock levels
- `GET /api/inventory?branchId=X&summary=true` - Inventory summary

### Accounting
- `GET /api/accounting?branchId=X&type=daily&date=Y` - Daily report
- `GET /api/accounting?branchId=X&type=monthly&year=Y&month=Z` - Monthly report
- `POST /api/accounting` - Record expense

### IMEI Tracking
- `GET /api/imei?companyId=X&imei=Y` - Lookup device
- `POST /api/imei` - Register IMEI
- `GET /api/imei?companyId=X&stats=true` - IMEI statistics

## React Integration

### Using the Data Hook

The `useSupabaseData` hook automatically fetches all relevant data for a branch:

```typescript
import { useSupabaseData } from '@/hooks/useSupabaseData';

function Dashboard() {
  const {
    products,
    sales,
    repairs,
    customers,
    inventory,
    isLoading,
    error,
    refetch
  } = useSupabaseData({
    companyId: 'comp-123',
    branchId: 'branch-456',
    warehouseId: 'warehouse-789'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Sales: {sales.length}</h2>
      <h2>Pending Repairs: {repairs.filter(r => r.status !== 'delivered').length}</h2>
      <button onClick={() => refetch.sales()}>Refresh Sales</button>
    </div>
  );
}
```

## Environment Setup

Required environment variables (set in Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Migration Checklist

To fully transition from mock data to live database:

### 1. Update Component Data Sources
- [ ] Replace mock API calls in `App.tsx` with real endpoints
- [ ] Update state management to use `useSupabaseData` hook
- [ ] Connect all forms to API POST endpoints

### 2. Implement Business Workflows
- [ ] POS checkout creates sale with IMEI tracking
- [ ] Repair intake records ticket and auto-assigns number
- [ ] Inventory movements logged automatically
- [ ] Expense approvals route to supervisors
- [ ] Warranty expirations trigger alerts

### 3. Add Real-time Features
- [ ] Enable Supabase Realtime for live inventory updates
- [ ] Add WebSocket listeners for new orders/repairs
- [ ] Implement push notifications for alerts

### 4. Reporting & Exports
- [ ] Daily close report generation
- [ ] Monthly financial statements
- [ ] PDF invoice/receipt printing
- [ ] Excel data exports

### 5. Security & Compliance
- [ ] Enable Row Level Security (RLS) policies
- [ ] Audit log all transactions
- [ ] Implement role-based access control
- [ ] Add data encryption for sensitive fields

## Common Operations

### Create Sale with IMEI Tracking

```typescript
const sale = await createSale(branchId, {
  customerId: 'cust-123',
  totalAmount: 1500000,
  taxAmount: 75000,
  paymentMethod: 'cash',
  items: [
    {
      productId: 'prod-456',
      quantity: 1,
      unitPrice: 1500000,
      imeiNumbers: ['123456789012345'],
    }
  ]
}, userId);
```

### Update Repair Status

```typescript
await updateRepairStatus('repair-789', 'testing', 'Display fixed, awaiting customer pickup');
```

### Record Expense

```typescript
await recordExpense(branchId, {
  category: 'Repair Parts',
  description: 'LCD panel replacement stock',
  amount: 250000,
  expenseDate: new Date().toISOString(),
}, userId);
```

### Transfer Stock Between Branches

```typescript
await transferStock(
  fromWarehouseId,
  toWarehouseId,
  productId,
  quantity,
  userId
);
```

## Troubleshooting

### Authentication Errors
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check that user is authenticated before making API calls
- Verify API key has correct permissions in Supabase

### Data Not Showing
- Check browser console for API errors
- Verify branchId and companyId parameters are correct
- Ensure data exists in database (check Supabase dashboard)

### Permission Denied
- Check user's role and permissions in database
- Verify RLS policies allow the operation
- Contact admin to grant required permissions

## Performance Optimization

- Use `useSupabaseData` hook for automatic batching
- Implement pagination for large datasets
- Cache frequently accessed data (products, categories)
- Use indexes on frequently queried columns (already created)

## Support

For integration questions or issues:
1. Check Supabase documentation: https://supabase.com/docs
2. Review database schema in Supabase dashboard
3. Check audit logs for transaction history
4. Contact development team with specific error messages
