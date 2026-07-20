import { createClient } from '@/lib/supabase/client';

export async function createCustomer(companyId: string, customerData: any) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .insert({
      company_id: companyId,
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      address: customerData.address,
      loyalty_points: 0,
      total_purchases: 0,
      is_active: true,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCustomers(companyId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function getCustomerById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function searchCustomers(companyId: string, query: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('company_id', companyId)
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(10);
  
  if (error) throw error;
  return data;
}

export async function getCustomerByPhone(companyId: string, phone: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('company_id', companyId)
    .eq('phone', phone)
    .eq('is_active', true)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateCustomer(id: string, updates: any) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function addLoyaltyPoints(customerId: string, points: number) {
  const supabase = createClient();
  
  // Get current points
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('loyalty_points')
    .eq('id', customerId)
    .single();
  
  if (fetchError) throw fetchError;
  
  const { data, error } = await supabase
    .from('customers')
    .update({ loyalty_points: (customer.loyalty_points || 0) + points })
    .eq('id', customerId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCustomerPurchaseHistory(customerId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('sales')
    .select('*, sale_items(*, products(name, sku))')
    .eq('customer_id', customerId)
    .order('sale_date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getCustomerStats(customerId: string) {
  const supabase = createClient();
  
  const { data: sales, error } = await supabase
    .from('sales')
    .select('total_amount')
    .eq('customer_id', customerId);
  
  if (error) throw error;
  
  const totalSpent = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const purchaseCount = sales.length;
  const avgPurchase = purchaseCount > 0 ? totalSpent / purchaseCount : 0;
  
  return {
    totalSpent,
    purchaseCount,
    avgPurchase,
  };
}

export async function getLoyaltyPrograms(companyId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data;
}
