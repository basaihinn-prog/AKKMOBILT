import { createClient } from '@/lib/supabase/client';

export async function generateSaleNumber(branchId: string): Promise<string> {
  const supabase = createClient();
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  // Get count of sales for today
  const { data, error } = await supabase
    .from('sales')
    .select('id', { count: 'exact' })
    .eq('branch_id', branchId)
    .like('sale_number', `${dateStr}%`);
  
  if (error && error.code !== 'PGRST116') throw error;
  
  const count = data?.length || 0;
  const sequence = String(count + 1).padStart(5, '0');
  return `SAL-${dateStr}-${sequence}`;
}

export async function generateTicketNumber(branchId: string): Promise<string> {
  const supabase = createClient();
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  // Get count of repairs for today
  const { data, error } = await supabase
    .from('repairs')
    .select('id', { count: 'exact' })
    .eq('branch_id', branchId)
    .like('ticket_number', `${dateStr}%`);
  
  if (error && error.code !== 'PGRST116') throw error;
  
  const count = data?.length || 0;
  const sequence = String(count + 1).padStart(5, '0');
  return `TKT-${dateStr}-${sequence}`;
}

export async function generatePurchaseOrderNumber(branchId: string): Promise<string> {
  const supabase = createClient();
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  // Get count of purchases for this month
  const { data, error } = await supabase
    .from('purchases')
    .select('id', { count: 'exact' })
    .eq('branch_id', branchId)
    .like('po_number', `PO-${year}${month}%`);
  
  if (error && error.code !== 'PGRST116') throw error;
  
  const count = data?.length || 0;
  const sequence = String(count + 1).padStart(5, '0');
  return `PO-${year}${month}-${sequence}`;
}

export function formatCurrency(amount: number, currency = 'MMK'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(amount);
}

export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function calculateTax(amount: number, taxRate: number): number {
  return amount * (taxRate / 100);
}

export function calculateDiscount(amount: number, discountValue: number, discountType: 'percentage' | 'fixed'): number {
  if (discountType === 'percentage') {
    return amount * (discountValue / 100);
  }
  return discountValue;
}

export function calculateWarrantyExpiry(warrantyMonths: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + warrantyMonths);
  return date.toISOString().split('T')[0];
}
