import { useEffect, useState, useCallback } from 'react';
import { getProducts, getCategories, getBrands, getModels } from '@/lib/supabase/services/products';
import { getSales, getDailySalesReport } from '@/lib/supabase/services/sales';
import { getRepairs, getPendingRepairs } from '@/lib/supabase/services/repairs';
import { getCustomers, searchCustomers } from '@/lib/supabase/services/customers';
import { getInventory, getLowStockItems, getInventorySummary } from '@/lib/supabase/services/inventory';
import { getExpenses, getDailyReport } from '@/lib/supabase/services/accounting';
import { getIMEIStats, getExpiredWarrantyIMEIs } from '@/lib/supabase/services/imei';

interface UseSupabaseDataProps {
  companyId: string;
  branchId: string;
  warehouseId?: string;
}

export function useSupabaseData({ companyId, branchId, warehouseId }: UseSupabaseDataProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [imeiStats, setImeiStats] = useState<any>(null);
  const [expiredIMEIs, setExpiredIMEIs] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products and metadata
  const fetchProducts = useCallback(async () => {
    try {
      const [prods, cats, brds] = await Promise.all([
        getProducts(companyId),
        getCategories(companyId),
        getBrands(companyId),
      ]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brds);
    } catch (err) {
      console.error('[useSupabaseData] Products fetch error:', err);
      setError('Failed to load products');
    }
  }, [companyId]);

  // Fetch sales data
  const fetchSales = useCallback(async () => {
    try {
      const sls = await getSales(branchId);
      setSales(sls);
    } catch (err) {
      console.error('[useSupabaseData] Sales fetch error:', err);
    }
  }, [branchId]);

  // Fetch repairs
  const fetchRepairs = useCallback(async () => {
    try {
      const reps = await getRepairs(branchId);
      setRepairs(reps);
    } catch (err) {
      console.error('[useSupabaseData] Repairs fetch error:', err);
    }
  }, [branchId]);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      const cust = await getCustomers(companyId);
      setCustomers(cust);
    } catch (err) {
      console.error('[useSupabaseData] Customers fetch error:', err);
    }
  }, [companyId]);

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    try {
      if (warehouseId) {
        const inv = await getInventory(warehouseId);
        setInventory(inv);
      }
      const low = await getLowStockItems(branchId);
      setLowStockItems(low);
    } catch (err) {
      console.error('[useSupabaseData] Inventory fetch error:', err);
    }
  }, [branchId, warehouseId]);

  // Fetch expenses and daily report
  const fetchExpensesAndReport = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const exps = await getExpenses(branchId);
      const report = await getDailyReport(branchId, today);
      setExpenses(exps);
      setDailyReport(report);
    } catch (err) {
      console.error('[useSupabaseData] Expenses fetch error:', err);
    }
  }, [branchId]);

  // Fetch IMEI stats
  const fetchIMEIStats = useCallback(async () => {
    try {
      const stats = await getIMEIStats(companyId);
      const expired = await getExpiredWarrantyIMEIs(companyId);
      setImeiStats(stats);
      setExpiredIMEIs(expired);
    } catch (err) {
      console.error('[useSupabaseData] IMEI stats fetch error:', err);
    }
  }, [companyId]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchProducts(),
          fetchSales(),
          fetchRepairs(),
          fetchCustomers(),
          fetchInventory(),
          fetchExpensesAndReport(),
          fetchIMEIStats(),
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, [
    fetchProducts,
    fetchSales,
    fetchRepairs,
    fetchCustomers,
    fetchInventory,
    fetchExpensesAndReport,
    fetchIMEIStats,
  ]);

  return {
    // Data
    products,
    categories,
    brands,
    sales,
    repairs,
    customers,
    inventory,
    expenses,
    dailyReport,
    imeiStats,
    expiredIMEIs,
    lowStockItems,

    // State
    isLoading,
    error,

    // Refetch functions
    refetch: {
      products: fetchProducts,
      sales: fetchSales,
      repairs: fetchRepairs,
      customers: fetchCustomers,
      inventory: fetchInventory,
      expenses: fetchExpensesAndReport,
      imei: fetchIMEIStats,
    },
  };
}
