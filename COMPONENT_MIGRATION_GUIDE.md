# Component Migration Guide - Mock Data to Real APIs

This guide shows exactly how to update each component from mock data to real APIs.

---

## Pattern: Replace Mock State with API Calls

### Before Pattern (Mock Data)
```typescript
const [products, setProducts] = useState(mockProductsData);
const [sales, setSales] = useState(mockSalesData);
```

### After Pattern (Real API)
```typescript
import { APIClient } from '../utils/api-client';

const [products, setProducts] = useState([]);
const [sales, setSales] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  loadData();
}, []);

async function loadData() {
  try {
    setLoading(true);
    setError(null);
    const data = await APIClient.getProducts();
    setProducts(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load data');
  } finally {
    setLoading(false);
  }
}
```

---

## Component Migration Checklist

### 1. POSSubTab.tsx
**Status**: Priority 1 (Core revenue module)

**Changes**:
- Replace `mockPosSales` with `APIClient.getBranchSales()`
- Replace `mockProducts` with `APIClient.getProducts()`
- Update "Create Sale" handler to use `APIClient.createSale()`
- Update IMEI tracking to use `APIClient.updateIMEIStatus()`

**Example**:
```typescript
// OLD
const [sales, setSales] = useState(mockPosSales);
const handleCreateSale = (data) => setSales([...sales, data]);

// NEW
const [sales, setSales] = useState([]);
const handleCreateSale = async (data) => {
  try {
    const newSale = await APIClient.createSale({
      branchId: currentBranchId,
      cashierId: currentUserId,
      ...data
    });
    setSales([...sales, newSale]);
    showSuccess(`Sale #${newSale.saleNumber} created`);
  } catch (error) {
    showError(error.message);
  }
};
```

---

### 2. InventorySubTab.tsx
**Status**: Priority 1 (Stock management)

**Changes**:
- Replace inventory with `APIClient.getProducts()` with branch filter
- Replace transfers with `APIClient.getPendingTransfers()`
- Update "Create Transfer" to use `APIClient.createTransfer()`
- Update "Confirm Transfer" to use `APIClient.confirmTransfer()`

**Example**:
```typescript
// OLD
const [transfers, setTransfers] = useState(mockTransfers);
const confirmTransfer = (id) => {
  setTransfers(transfers.map(t => t.id === id ? {...t, status: 'received'} : t));
};

// NEW
const confirmTransfer = async (id) => {
  try {
    const updated = await APIClient.confirmTransfer(id);
    setTransfers(transfers.map(t => t.id === id ? updated : t));
    showSuccess('Transfer confirmed');
  } catch (error) {
    showError(error.message);
  }
};
```

---

### 3. RepairsSubTab.tsx
**Status**: Priority 1 (Customer service)

**Changes**:
- Replace repairs with `APIClient.getBranchRepairs()`
- Replace "Create Ticket" with `APIClient.createRepair()`
- Update status changes with `APIClient.updateRepairStatus()`
- Update service additions with `APIClient.addRepairService()`

**Example**:
```typescript
// OLD
const [repairs, setRepairs] = useState(mockRepairs);
const handleUpdateStatus = (id, status) => {
  setRepairs(repairs.map(r => r.id === id ? {...r, status} : r));
};

// NEW
const handleUpdateStatus = async (id, status, notes) => {
  try {
    const updated = await APIClient.updateRepairStatus(id, status, notes);
    setRepairs(repairs.map(r => r.id === id ? updated : r));
    showSuccess('Repair status updated');
  } catch (error) {
    showError(error.message);
  }
};
```

---

### 4. CRMSubTab.tsx
**Status**: Priority 2 (Customer management)

**Changes**:
- Replace customers with `APIClient.getAllCustomers()`
- Replace "Add Customer" with `APIClient.createCustomer()`
- Update search with `APIClient.searchCustomers()`
- Add phone lookup with `APIClient.getCustomerByPhone()`

**Example**:
```typescript
// OLD
const [customers, setCustomers] = useState(mockCustomers);
const addCustomer = (data) => setCustomers([...customers, {...data, id: generateId()}]);

// NEW
const addCustomer = async (data) => {
  try {
    const newCustomer = await APIClient.createCustomer(data);
    setCustomers([...customers, newCustomer]);
    showSuccess('Customer created');
  } catch (error) {
    showError(error.message);
  }
};
```

---

### 5. AccountingSubTab.tsx
**Status**: Priority 2 (Financial tracking)

**Changes**:
- Replace expenses with `APIClient.getBranchExpenses()`
- Replace "Add Expense" with `APIClient.recordExpense()`
- Update daily report with `APIClient.getDailyReport()`
- Update chart with monthly data from `APIClient.getMonthlyReport()`

**Example**:
```typescript
// OLD
const [expenses, setExpenses] = useState(mockExpenses);
const [report, setReport] = useState(mockReport);

// NEW
useEffect(() => {
  const date = new Date().toISOString().split('T')[0];
  APIClient.getDailyReport(currentBranchId, date)
    .then(setReport)
    .catch(error => showError(error.message));
}, [currentBranchId]);

const addExpense = async (data) => {
  try {
    const expense = await APIClient.recordExpense({
      branchId: currentBranchId,
      ...data
    });
    setExpenses([...expenses, expense]);
    showSuccess('Expense recorded');
  } catch (error) {
    showError(error.message);
  }
};
```

---

### 6. InventoryTransfersSubTab.tsx
**Status**: Priority 2 (Stock movements)

**Changes**:
- Replace transfers with `APIClient.getTransfersForBranch()`
- Update create transfer to use `APIClient.createTransfer()`
- Implement transfer confirmation with `APIClient.confirmTransfer()`

---

### 7. ERPSubTab.tsx
**Status**: Priority 3 (Reports)

**Changes**:
- Update all report generation to use real APIs
- Link to specific module APIs
- Add data refresh buttons

---

### 8. OnlineOrdersSubTab.tsx
**Status**: Priority 3 (E-commerce)

**Changes**:
- Replace orders with API calls
- Link to customer and sales services

---

## Reusable Hooks for Components

Create this hook to simplify component updates:

**File**: `src/hooks/useAPI.ts`
```typescript
import { useState, useEffect } from 'react';

export function useAPI<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const result = await apiCall();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Error');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}
```

**Usage in Components**:
```typescript
// In POSSubTab.tsx
const { data: products, loading } = useAPI(
  () => APIClient.getProducts(),
  [currentBranchId]
);

const { data: sales } = useAPI(
  () => APIClient.getBranchSales(currentBranchId),
  [currentBranchId]
);
```

---

## Error Handling Best Practices

```typescript
// Global error handler
const showError = (message: string) => {
  console.error('[API Error]', message);
  // Show toast notification
  // TODO: Implement toast notification system
};

// Specific error handling
async function handleOperation(operation: () => Promise<any>) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        showError('Resource not found');
      } else if (error.message.includes('409')) {
        showError('Conflict: Resource already exists');
      } else if (error.message.includes('403')) {
        showError('Access denied');
      } else {
        showError(error.message);
      }
    } else {
      showError('Unknown error occurred');
    }
  }
}
```

---

## Testing Your Component Updates

### 1. Check Console for API Logs
Should see: `[API] POST /api/sales`

### 2. Verify Data Persists
- Create a sale
- Refresh page
- Verify sale is still there

### 3. Test Error Cases
- Try creating with missing required fields
- Check error message displays correctly
- Verify component gracefully handles failures

---

## Step-by-Step Migration Example: POSSubTab

### Step 1: Add imports
```typescript
import { APIClient } from '../utils/api-client';
```

### Step 2: Update state
```typescript
// Remove this:
// const [sales, setSales] = useState(mockPosSales);

// Add this:
const [sales, setSales] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Step 3: Add effect for loading
```typescript
useEffect(() => {
  loadSales();
}, [currentBranchId]);

async function loadSales() {
  try {
    setLoading(true);
    setError(null);
    const data = await APIClient.getBranchSales(currentBranchId);
    setSales(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load sales');
  } finally {
    setLoading(false);
  }
}
```

### Step 4: Update create handler
```typescript
// OLD
const handleCreateSale = (saleData) => {
  setSales([...sales, { id: generateId(), ...saleData }]);
};

// NEW
const handleCreateSale = async (saleData) => {
  try {
    setLoading(true);
    const newSale = await APIClient.createSale({
      branchId: currentBranchId,
      cashierId: currentUserId,
      ...saleData
    });
    setSales([...sales, newSale]);
    showSuccess(`Sale created: #${newSale.saleNumber}`);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Failed to create sale');
  } finally {
    setLoading(false);
  }
};
```

### Step 5: Update UI to show loading/error
```typescript
if (loading && sales.length === 0) return <Spinner />;
if (error) return <ErrorAlert message={error} onRetry={loadSales} />;

return (
  <div>
    {/* Your component JSX */}
  </div>
);
```

---

## Rollout Timeline

### Day 1: Priority 1 Components
- POSSubTab
- InventorySubTab
- RepairsSubTab

### Day 2-3: Priority 2 Components
- CRMSubTab
- AccountingSubTab
- InventoryTransfersSubTab

### Day 4+: Priority 3 Components
- ERPSubTab
- OnlineOrdersSubTab
- Other modules

---

## Frequently Asked Questions

**Q: Will existing mock data be lost?**
A: Yes, you'll start with an empty database. You can seed it with initial data.

**Q: How do I test without replacing the entire component?**
A: Create a new branch to test one component at a time.

**Q: What if an API call fails?**
A: All failures are logged and should display an error message to the user.

**Q: Can I rollback to mock data?**
A: Yes, keep a backup branch with mock data for comparison.

**Q: How do I handle offline mode?**
A: Implement local caching with IndexedDB or localStorage as fallback.

---

## Success Criteria

✅ All data persists after page refresh
✅ Create operations show success message
✅ Delete operations remove from database
✅ Update operations reflect changes immediately
✅ Error messages display for failed operations
✅ Multiple concurrent users don't cause conflicts
✅ Performance is acceptable (<500ms per operation)

---

**Ready to migrate?** Start with POSSubTab and follow the examples above!
