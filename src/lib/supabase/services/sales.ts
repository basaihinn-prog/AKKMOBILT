import { createClient } from '@/lib/supabase/client';
import { generateSaleNumber } from '@/lib/utils/generators';

export async function createSale(branchId: string, saleData: any, userId: string) {
  const supabase = createClient();
  
  // Generate unique sale number
  const saleNumber = await generateSaleNumber(branchId);
  
  // Create sale
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      branch_id: branchId,
      sale_number: saleNumber,
      customer_id: saleData.customerId,
      total_amount: saleData.totalAmount,
      tax_amount: saleData.taxAmount || 0,
      discount_amount: saleData.discountAmount || 0,
      payment_method: saleData.paymentMethod,
      cashier_id: userId,
      notes: saleData.notes,
      status: 'completed',
    })
    .select()
    .single();
  
  if (saleError) throw saleError;
  
  // Create sale items and handle IMEI tracking
  for (const item of saleData.items) {
    const { error: itemError } = await supabase
      .from('sale_items')
      .insert({
        sale_id: sale.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
        imei_numbers: item.imeiNumbers || [],
      });
    
    if (itemError) throw itemError;
    
    // Register IMEIs if provided
    if (item.imeiNumbers && item.imeiNumbers.length > 0) {
      for (const imei of item.imeiNumbers) {
        const warrantyExpiry = new Date();
        const product = await supabase
          .from('products')
          .select('warranty_months')
          .eq('id', item.productId)
          .single();
        
        if (product.data) {
          warrantyExpiry.setMonth(warrantyExpiry.getMonth() + (product.data.warranty_months || 12));
        }
        
        await supabase
          .from('imei_tracking')
          .insert({
            company_id: sale.branch_id, // This will need the company_id, get from branch
            imei: imei,
            product_id: item.productId,
            sale_id: sale.id,
            status: 'active',
            warranty_expiry_date: warrantyExpiry.toISOString().split('T')[0],
          });
      }
    }
  }
  
  return sale;
}

export async function getSales(branchId: string, startDate?: string, endDate?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('sales')
    .select('*, customers(name, phone), auth_users(name)')
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false });
  
  if (startDate) {
    query = query.gte('sale_date', startDate);
  }
  if (endDate) {
    query = query.lte('sale_date', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function getSaleById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*, products(*)), customers(*), auth_users(name)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getDailySalesReport(branchId: string, date: string) {
  const supabase = createClient();
  
  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;
  
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('branch_id', branchId)
    .gte('sale_date', startOfDay)
    .lte('sale_date', endOfDay);
  
  if (error) throw error;
  
  const totalSales = data.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalTax = data.reduce((sum, sale) => sum + sale.tax_amount, 0);
  const totalDiscount = data.reduce((sum, sale) => sum + sale.discount_amount, 0);
  
  return {
    date,
    totalTransactions: data.length,
    totalSales,
    totalTax,
    totalDiscount,
    netAmount: totalSales - totalDiscount,
    transactions: data,
  };
}

export async function getPaymentMethodSummary(branchId: string, startDate?: string, endDate?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('sales')
    .select('payment_method, total_amount')
    .eq('branch_id', branchId);
  
  if (startDate) query = query.gte('sale_date', startDate);
  if (endDate) query = query.lte('sale_date', endDate);
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  const summary: Record<string, number> = {};
  data.forEach((sale: any) => {
    summary[sale.payment_method] = (summary[sale.payment_method] || 0) + sale.total_amount;
  });
  
  return summary;
}
