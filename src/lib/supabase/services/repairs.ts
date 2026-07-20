import { createClient } from '@/lib/supabase/client';
import { generateTicketNumber } from '@/lib/utils/generators';

export async function createRepair(branchId: string, repairData: any) {
  const supabase = createClient();
  
  const ticketNumber = await generateTicketNumber(branchId);
  
  const { data, error } = await supabase
    .from('repairs')
    .insert({
      branch_id: branchId,
      ticket_number: ticketNumber,
      customer_id: repairData.customerId,
      device_model: repairData.deviceModel,
      imei: repairData.imei,
      complaint: repairData.complaint,
      status: 'received',
      estimated_completion: repairData.estimatedCompletion,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getRepairs(branchId: string, status?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('repairs')
    .select('*, customers(name, phone), auth_users(name)')
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function getRepairById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('repairs')
    .select('*, repair_services(*, repair_types(*)), customers(*), auth_users(name)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateRepairStatus(id: string, status: string, notes?: string) {
  const supabase = createClient();
  
  const updates: any = { status };
  if (status === 'delivered') {
    updates.actual_completion = new Date().toISOString().split('T')[0];
  }
  
  const { data, error } = await supabase
    .from('repairs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function addRepairService(repairId: string, serviceData: any) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('repair_services')
    .insert({
      repair_id: repairId,
      service_type_id: serviceData.serviceTypeId,
      service_name: serviceData.serviceName,
      labor_cost: serviceData.laborCost,
      parts_cost: serviceData.partsCost,
      total_cost: (serviceData.laborCost || 0) + (serviceData.partsCost || 0),
      notes: serviceData.notes,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getRepairTypes(companyId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('repair_types')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data;
}

export async function getPendingRepairs(branchId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('repairs')
    .select('*')
    .eq('branch_id', branchId)
    .in('status', ['received', 'diagnostic', 'repairing', 'testing', 'ready'])
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getRepairsByWarrantyStatus(companyId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('imei_tracking')
    .select('*, repairs(id)')
    .eq('company_id', companyId)
    .lte('warranty_expiry_date', new Date().toISOString().split('T')[0]);
  
  if (error) throw error;
  return data;
}
