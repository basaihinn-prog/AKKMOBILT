import { createClient } from '@/lib/supabase/client';

export async function recordExpense(branchId: string, expenseData: any, userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      branch_id: branchId,
      category: expenseData.category,
      description: expenseData.description,
      amount: expenseData.amount,
      expense_date: expenseData.expenseDate,
      created_by: userId,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getExpenses(branchId: string, startDate?: string, endDate?: string, status?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('expenses')
    .select('*, auth_users(name)')
    .eq('branch_id', branchId);
  
  if (startDate) query = query.gte('expense_date', startDate);
  if (endDate) query = query.lte('expense_date', endDate);
  if (status) query = query.eq('status', status);
  
  const { data, error } = await query.order('expense_date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function approveExpense(id: string, userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('expenses')
    .update({
      status: 'approved',
      approved_by: userId,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getDailyReport(branchId: string, date: string) {
  const supabase = createClient();
  
  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;
  
  // Get sales
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('total_amount, tax_amount, discount_amount, payment_method')
    .eq('branch_id', branchId)
    .gte('sale_date', startOfDay)
    .lte('sale_date', endOfDay);
  
  if (salesError) throw salesError;
  
  // Get expenses
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('branch_id', branchId)
    .eq('status', 'approved')
    .gte('expense_date', startOfDay)
    .lte('expense_date', endOfDay);
  
  if (expensesError) throw expensesError;
  
  const totalSales = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalTax = sales.reduce((sum, s) => sum + s.tax_amount, 0);
  const totalDiscount = sales.reduce((sum, s) => sum + s.discount_amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    date,
    sales: {
      count: sales.length,
      total: totalSales,
      tax: totalTax,
      discount: totalDiscount,
      netAmount: totalSales - totalDiscount,
    },
    expenses: {
      count: expenses.length,
      total: totalExpenses,
      byCategory: expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>),
    },
    profit: totalSales - totalDiscount - totalExpenses,
  };
}

export async function getMonthlyReport(branchId: string, year: number, month: number) {
  const supabase = createClient();
  
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  
  // Get sales
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('total_amount, tax_amount, discount_amount')
    .eq('branch_id', branchId)
    .gte('sale_date', startDate)
    .lte('sale_date', endDate);
  
  if (salesError) throw salesError;
  
  // Get expenses
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('amount')
    .eq('branch_id', branchId)
    .eq('status', 'approved')
    .gte('expense_date', startDate)
    .lte('expense_date', endDate);
  
  if (expensesError) throw expensesError;
  
  const totalSales = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    period: `${year}-${String(month).padStart(2, '0')}`,
    totalSales,
    totalExpenses,
    profit: totalSales - totalExpenses,
    transactionCount: sales.length,
  };
}

export async function getTaxes(companyId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('taxes')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data;
}

export async function getDiscounts(companyId: string) {
  const supabase = createClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('discounts')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today);
  
  if (error) throw error;
  return data;
}

export async function getBanks(companyId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('banks')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true);
  
  if (error) throw error;
  return data;
}
