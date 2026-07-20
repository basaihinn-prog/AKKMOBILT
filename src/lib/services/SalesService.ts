import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { ProductService } from './ProductService';

export interface Sale {
  id: string;
  saleNumber: string;
  branchId: string;
  cashierId: string;
  customerId?: string;
  saleDate: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  imei?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: string;
}

export class SalesService {
  static generateSaleNumber(branchId: string): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const branchCode = branchId.split('-')[1]?.toUpperCase() || 'XX';
    const count = db.prepare(`SELECT COUNT(*) as count FROM sales WHERE branch_id = ? AND sale_date LIKE ?`).get(branchId, dateStr + '%') as { count: number };
    return `SL-${branchCode}-${dateStr}-${String(count.count + 1).padStart(4, '0')}`;
  }

  static create(data: Partial<Sale>): Sale {
    const id = uuidv4();
    const now = new Date().toISOString();
    const saleNumber = this.generateSaleNumber(data.branchId!);

    const stmt = db.prepare(`
      INSERT INTO sales (id, sale_number, branch_id, cashier_id, customer_id, sale_date, 
                        total_amount, subtotal, tax_amount, discount_amount, payment_method, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, saleNumber, data.branchId, data.cashierId, data.customerId || null,
      data.saleDate || now, data.totalAmount, data.subtotal || 0, data.taxAmount || 0,
      data.discountAmount || 0, data.paymentMethod, data.status || 'completed', data.notes || null, now, now
    );

    return this.getById(id)!;
  }

  static addItem(saleId: string, item: Partial<SaleItem>): SaleItem {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO sale_items (id, sale_id, product_id, imei, quantity, unit_price, line_total, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, saleId, item.productId, item.imei || null, item.quantity,
      item.unitPrice, item.lineTotal || item.quantity! * item.unitPrice!, now
    );

    // Adjust product stock
    ProductService.adjustStock(item.productId!, -item.quantity!, 'sale');

    return { id, saleId, ...item, createdAt: now } as SaleItem;
  }

  static getById(id: string): Sale | null {
    const stmt = db.prepare(`
      SELECT id, sale_number as saleNumber, branch_id as branchId, cashier_id as cashierId, 
             customer_id as customerId, sale_date as saleDate, total_amount as totalAmount,
             subtotal, tax_amount as taxAmount, discount_amount as discountAmount, 
             payment_method as paymentMethod, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM sales WHERE id = ?
    `);

    const sale = stmt.get(id) as Sale | undefined;
    if (!sale) return null;

    const itemStmt = db.prepare(`
      SELECT id, sale_id as saleId, product_id as productId, imei, quantity, unit_price as unitPrice, 
             line_total as lineTotal, created_at as createdAt
      FROM sale_items WHERE sale_id = ?
    `);

    sale.items = itemStmt.all(id) as SaleItem[];
    return sale;
  }

  static getBySaleNumber(saleNumber: string): Sale | null {
    const stmt = db.prepare(`SELECT id FROM sales WHERE sale_number = ?`);
    const result = stmt.get(saleNumber) as { id: string } | undefined;
    return result ? this.getById(result.id) : null;
  }

  static getByBranch(branchId: string, startDate?: string, endDate?: string): Sale[] {
    let query = `
      SELECT id, sale_number as saleNumber, branch_id as branchId, cashier_id as cashierId, 
             customer_id as customerId, sale_date as saleDate, total_amount as totalAmount,
             subtotal, tax_amount as taxAmount, discount_amount as discountAmount, 
             payment_method as paymentMethod, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM sales WHERE branch_id = ?
    `;

    const values: any[] = [branchId];

    if (startDate) {
      query += ` AND sale_date >= ?`;
      values.push(startDate);
    }
    if (endDate) {
      query += ` AND sale_date <= ?`;
      values.push(endDate);
    }

    query += ` ORDER BY sale_date DESC`;

    const stmt = db.prepare(query);
    return stmt.all(...values) as Sale[];
  }

  static calculateDailySales(branchId: string, date: string): { total: number; count: number; byPayment: Record<string, number> } {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count, SUM(total_amount) as total FROM sales 
      WHERE branch_id = ? AND DATE(sale_date) = DATE(?)
    `);

    const result = stmt.get(branchId, date) as { count: number; total: number };

    const paymentStmt = db.prepare(`
      SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total FROM sales
      WHERE branch_id = ? AND DATE(sale_date) = DATE(?)
      GROUP BY payment_method
    `);

    const byPayment: Record<string, number> = {};
    (paymentStmt.all(branchId, date) as any[]).forEach(row => {
      byPayment[row.payment_method] = row.total;
    });

    return { total: result.total || 0, count: result.count || 0, byPayment };
  }
}
