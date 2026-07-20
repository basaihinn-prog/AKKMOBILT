import { createClient } from '@/lib/supabase/client';

export async function getIMEITracking(companyId: string, imei: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('imei_tracking')
    .select('*, products(name, sku), sales(*)')
    .eq('company_id', companyId)
    .eq('imei', imei)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getIMEIsByProduct(companyId: string, productId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('imei_tracking')
    .select('*')
    .eq('company_id', companyId)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function registerIMEI(companyId: string, imeiData: any) {
  const supabase = createClient();
  
  // Check if IMEI already exists
  const existing = await getIMEITracking(companyId, imeiData.imei);
  if (existing) {
    throw new Error('IMEI already registered');
  }
  
  const { data, error } = await supabase
    .from('imei_tracking')
    .insert({
      company_id: companyId,
      imei: imeiData.imei,
      device_model: imeiData.deviceModel,
      product_id: imeiData.productId,
      sale_id: imeiData.saleId,
      status: 'active',
      warranty_expiry_date: imeiData.warrantyExpiryDate,
      customer_phone: imeiData.customerPhone,
      notes: imeiData.notes,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateIMEIStatus(companyId: string, imei: string, status: string, notes?: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('imei_tracking')
    .update({
      status: status,
      notes: notes || undefined,
    })
    .eq('company_id', companyId)
    .eq('imei', imei)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getWarrantyExpiringIMEIs(companyId: string, daysUntilExpiry = 30) {
  const supabase = createClient();
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);
  
  const { data, error } = await supabase
    .from('imei_tracking')
    .select('*, products(name, sku), sales(customer_id)')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .lte('warranty_expiry_date', expiryDate.toISOString().split('T')[0])
    .gte('warranty_expiry_date', new Date().toISOString().split('T')[0]);
  
  if (error) throw error;
  return data;
}

export async function getExpiredWarrantyIMEIs(companyId: string) {
  const supabase = createClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('imei_tracking')
    .select('*, products(name, sku)')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .lt('warranty_expiry_date', today);
  
  if (error) throw error;
  return data;
}

export async function getIMEIStats(companyId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('imei_tracking')
    .select('status')
    .eq('company_id', companyId);
  
  if (error) throw error;
  
  const stats = {
    total: data.length,
    active: 0,
    inactive: 0,
    warrantyExpired: 0,
    lost: 0,
    stolen: 0,
  };
  
  data.forEach((item: any) => {
    if (item.status === 'active') stats.active++;
    else if (item.status === 'inactive') stats.inactive++;
    else if (item.status === 'warranty_expired') stats.warrantyExpired++;
    else if (item.status === 'lost') stats.lost++;
    else if (item.status === 'stolen') stats.stolen++;
  });
  
  return stats;
}

export async function searchIMEI(companyId: string, query: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('imei_tracking')
    .select('*, products(name)')
    .eq('company_id', companyId)
    .or(`imei.ilike.%${query}%,customer_phone.ilike.%${query}%`)
    .limit(10);
  
  if (error) throw error;
  return data;
}
