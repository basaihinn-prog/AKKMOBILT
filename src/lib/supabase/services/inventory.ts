import { createClient } from '@/lib/supabase/client';

export async function getInventory(warehouseId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(name, sku, selling_price), warehouses(name)')
    .eq('warehouse_id', warehouseId);
  
  if (error) throw error;
  return data;
}

export async function getInventoryByProduct(warehouseId: string, productId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('warehouse_id', warehouseId)
    .eq('product_id', productId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function adjustStock(warehouseId: string, productId: string, quantity: number, reason: string, userId: string) {
  const supabase = createClient();
  
  // Get current inventory
  const { data: inv, error: getError } = await supabase
    .from('inventory')
    .select('quantity_on_hand')
    .eq('warehouse_id', warehouseId)
    .eq('product_id', productId)
    .single();
  
  if (getError && getError.code !== 'PGRST116') throw getError;
  
  const currentQuantity = inv?.quantity_on_hand || 0;
  const newQuantity = Math.max(0, currentQuantity + quantity);
  
  // Update inventory
  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity_on_hand: newQuantity })
    .eq('warehouse_id', warehouseId)
    .eq('product_id', productId);
  
  if (updateError) throw updateError;
  
  // Log movement
  const { error: logError } = await supabase
    .from('inventory_movements')
    .insert({
      warehouse_id: warehouseId,
      product_id: productId,
      movement_type: 'adjustment',
      quantity: quantity,
      reason: reason,
      created_by: userId,
    });
  
  if (logError) throw logError;
  
  return { oldQuantity: currentQuantity, newQuantity };
}

export async function getLowStockItems(branchId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(name, sku), warehouses(name)')
    .eq('warehouses.branch_id', branchId)
    .lte('quantity_on_hand', 'reorder_level');
  
  if (error) throw error;
  return data;
}

export async function getInventoryMovements(warehouseId: string, limit = 50) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*, products(name, sku), auth_users(name)')
    .eq('warehouse_id', warehouseId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

export async function transferStock(fromWarehouseId: string, toWarehouseId: string, productId: string, quantity: number, userId: string) {
  const supabase = createClient();
  
  // Deduct from source
  const { error: outError } = await supabase
    .from('inventory_movements')
    .insert({
      warehouse_id: fromWarehouseId,
      product_id: productId,
      movement_type: 'transfer',
      quantity: -quantity,
      reason: `Transfer to warehouse`,
      created_by: userId,
    });
  
  if (outError) throw outError;
  
  // Add to destination
  const { error: inError } = await supabase
    .from('inventory_movements')
    .insert({
      warehouse_id: toWarehouseId,
      product_id: productId,
      movement_type: 'transfer',
      quantity: quantity,
      reason: `Transfer from warehouse`,
      created_by: userId,
    });
  
  if (inError) throw inError;
  
  return { status: 'transferred' };
}

export async function getWarehouses(branchId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('branch_id', branchId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data;
}

export async function getInventorySummary(branchId: string) {
  const supabase = createClient();
  
  const { data: warehouses, error: warehouseError } = await supabase
    .from('warehouses')
    .select('id')
    .eq('branch_id', branchId);
  
  if (warehouseError) throw warehouseError;
  
  const warehouseIds = warehouses.map(w => w.id);
  
  const { data: inventory, error: inventoryError } = await supabase
    .from('inventory')
    .select('*, products(selling_price)')
    .in('warehouse_id', warehouseIds);
  
  if (inventoryError) throw inventoryError;
  
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity_on_hand, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity_on_hand * (item.products.selling_price || 0)), 0);
  
  return {
    totalItems,
    totalValue,
    warehouseCount: warehouses.length,
    productCount: inventory.length,
  };
}
