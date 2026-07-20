import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface Expense {
  id: string;
  branchId: string;
  category: string;
  amount: number;
  description?: string;
  expenseDate: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  totalCogs: number;
  netProfit: number;
  profitMargin: number;
  salesByPaymentMethod: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export class AccountingService {
  static recordExpense(data: Partial<Expense>): Expense {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO expenses (id, branch_id, category, amount, description, expense_date, approved_by, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, data.branchId, data.category, data.amount, data.description || null,
      data.expenseDate || now, null, 'pending', now
    );

    return this.getExpenseById(id)!;
  }

  static getExpenseById(id: string): Expense | null {
    const stmt = db.prepare(`
      SELECT id, branch_id as branchId, category, amount, description, expense_date as expenseDate,
             approved_by as approvedBy, status, created_at as createdAt
      FROM expenses WHERE id = ?
    `);

    return stmt.get(id) as Expense | undefined || null;
  }

  static getExpensesByBranch(branchId: string, startDate?: string, endDate?: string): Expense[] {
    let query = `
      SELECT id, branch_id as branchId, category, amount, description, expense_date as expenseDate,
             approved_by as approvedBy, status, created_at as createdAt
      FROM expenses WHERE branch_id = ?
    `;

    const values: any[] = [branchId];

    if (startDate) {
      query += ` AND expense_date >= ?`;
      values.push(startDate);
    }
    if (endDate) {
      query += ` AND expense_date <= ?`;
      values.push(endDate);
    }

    query += ` ORDER BY expense_date DESC`;

    const stmt = db.prepare(query);
    return stmt.all(...values) as Expense[];
  }

  static approveExpense(id: string, approvedBy: string): Expense {
    const stmt = db.prepare(`UPDATE expenses SET status = 'approved', approved_by = ? WHERE id = ?`);
    stmt.run(approvedBy, id);
    return this.getExpenseById(id)!;
  }

  static rejectExpense(id: string): Expense {
    const stmt = db.prepare(`UPDATE expenses SET status = 'rejected' WHERE id = ?`);
    stmt.run(id);
    return this.getExpenseById(id)!;
  }

  static getDailyReport(branchId: string, date: string): FinancialReport {
    // Get sales data
    const salesStmt = db.prepare(`
      SELECT SUM(total_amount) as total, COUNT(*) as count FROM sales
      WHERE branch_id = ? AND DATE(sale_date) = DATE(?)
    `);
    const salesData = salesStmt.get(branchId, date) as { total: number; count: number };

    // Get payment methods breakdown
    const paymentStmt = db.prepare(`
      SELECT payment_method, SUM(total_amount) as total FROM sales
      WHERE branch_id = ? AND DATE(sale_date) = DATE(?)
      GROUP BY payment_method
    `);
    const paymentData = paymentStmt.all(branchId, date) as any[];
    const salesByPaymentMethod: Record<string, number> = {};
    paymentData.forEach(row => {
      salesByPaymentMethod[row.payment_method] = row.total;
    });

    // Get expenses
    const expenseStmt = db.prepare(`
      SELECT category, SUM(amount) as total FROM expenses
      WHERE branch_id = ? AND DATE(expense_date) = DATE(?) AND status = 'approved'
      GROUP BY category
    `);
    const expenseData = expenseStmt.all(branchId, date) as any[];
    const expensesByCategory: Record<string, number> = {};
    let totalExpenses = 0;
    expenseData.forEach(row => {
      expensesByCategory[row.category] = row.total;
      totalExpenses += row.total;
    });

    // Calculate metrics
    const totalRevenue = salesData.total || 0;
    const totalCogs = totalRevenue * 0.4; // Approximate COGS (40% of revenue)
    const netProfit = totalRevenue - totalExpenses - totalCogs;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      period: date,
      totalRevenue,
      totalExpenses,
      totalCogs,
      netProfit,
      profitMargin,
      salesByPaymentMethod,
      expensesByCategory,
    };
  }

  static getMonthlyReport(branchId: string, month: string, year: number): FinancialReport {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, parseInt(month), 0).toISOString().split('T')[0];

    // Get sales data
    const salesStmt = db.prepare(`
      SELECT SUM(total_amount) as total FROM sales
      WHERE branch_id = ? AND sale_date >= ? AND sale_date <= ?
    `);
    const salesData = salesStmt.get(branchId, startDate, endDate) as { total: number };

    // Get payment methods breakdown
    const paymentStmt = db.prepare(`
      SELECT payment_method, SUM(total_amount) as total FROM sales
      WHERE branch_id = ? AND sale_date >= ? AND sale_date <= ?
      GROUP BY payment_method
    `);
    const paymentData = paymentStmt.all(branchId, startDate, endDate) as any[];
    const salesByPaymentMethod: Record<string, number> = {};
    paymentData.forEach(row => {
      salesByPaymentMethod[row.payment_method] = row.total;
    });

    // Get expenses
    const expenseStmt = db.prepare(`
      SELECT category, SUM(amount) as total FROM expenses
      WHERE branch_id = ? AND expense_date >= ? AND expense_date <= ? AND status = 'approved'
      GROUP BY category
    `);
    const expenseData = expenseStmt.all(branchId, startDate, endDate) as any[];
    const expensesByCategory: Record<string, number> = {};
    let totalExpenses = 0;
    expenseData.forEach(row => {
      expensesByCategory[row.category] = row.total;
      totalExpenses += row.total;
    });

    const totalRevenue = salesData.total || 0;
    const totalCogs = totalRevenue * 0.4;
    const netProfit = totalRevenue - totalExpenses - totalCogs;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      period: `${year}-${String(month).padStart(2, '0')}`,
      totalRevenue,
      totalExpenses,
      totalCogs,
      netProfit,
      profitMargin,
      salesByPaymentMethod,
      expensesByCategory,
    };
  }

  static getPendingExpenseApprovals(limit: number = 20): Expense[] {
    const stmt = db.prepare(`
      SELECT id, branch_id as branchId, category, amount, description, expense_date as expenseDate,
             approved_by as approvedBy, status, created_at as createdAt
      FROM expenses WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT ?
    `);

    return stmt.all(limit) as Expense[];
  }
}
