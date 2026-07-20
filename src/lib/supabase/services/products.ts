import { createClient } from '@/lib/supabase/client';

export async function getProducts(companyId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), brands(name), models(name)')
    .eq('company_id', companyId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), brands(name), models(name)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getProductBySku(companyId: string, sku: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', companyId)
    .eq('sku', sku)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createProduct(companyId: string, product: any) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .insert({
      company_id: companyId,
      sku: product.sku,
      name: product.name,
      description: product.description,
      category_id: product.categoryId,
      brand_id: product.brandId,
      model_id: product.modelId,
      cost_price: product.costPrice,
      selling_price: product.sellingPrice,
      warranty_months: product.warrantyMonths || 12,
      is_active: true,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: any) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCategories(companyId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data;
}

export async function getBrands(companyId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data;
}

export async function getModels(companyId: string, brandId?: string) {
  const supabase = createClient();
  let query = supabase
    .from('models')
    .select('*, brands(name)')
    .eq('company_id', companyId)
    .eq('is_active', true);
  
  if (brandId) {
    query = query.eq('brand_id', brandId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}
