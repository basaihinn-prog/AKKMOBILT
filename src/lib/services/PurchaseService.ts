import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { ProductService } from './ProductService';

export interface Purchase {
  id: string;
  purchaseNumber: string;
  branchId: string;
  supplierId?: string;
  purchaseDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  totalAmount: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: string;
}

export class PurchaseService {
  static generatePurchaseNumber(branchId: string): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const branchCode = branchId.split('-')[1]?.toUpperCase() || 'XX';
    const count = db.prepare(`SELECT COUNT(*) as count FROM purchases WHERE branch_id = ?`).get(branchId) as { count: number };
    return `PO-${branchCode}-${dateStr}-${String(count.count + 1).padStart(4, '0')}`;
  }

  static create(data: Partial<Purchase>): Purchase {
    const id = uuidv4();
    const now = new Date().toISOString();
    const purchaseNumber = this.generatePurchaseNumber(data.branchId!);

    const stmt = db.prepare(`
      INSERT INTO purchases (id, purchase_number, branch_id, supplier_id, purchase_date, expected_delivery, total_amount, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, purchaseNumber, data.branchId, data.supplierId || null, data.purchaseDate || now,
      data.expectedDelivery || null, data.totalAmount, 'pending', data.notes || null, now, now
    );

    return this.getById(id)!;
  }

  static addItem(purchaseId: string, item: Partial<PurchaseItem>): PurchaseItem {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO purchase_items (id, purchase_id, product_id, quantity, unit_price, line_total, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, purchaseId, item.productId || null, item.quantity, item.unitPrice,
      item.lineTotal || item.quantity! * item.unitPrice!, now
    );

    return { id, purchaseId, ...item, createdAt: now } as PurchaseItem;
  }

  static getById(id: string): Purchase | null {
    const stmt = db.prepare(`
      SELECT id, purchase_number as purchaseNumber, branch_id as branchId, supplier_id as supplierId,
             purchase_date as purchaseDate, expected_delivery as expectedDelivery, actual_delivery as actualDelivery,
             total_amount as totalAmount, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM purchases WHERE id = ?
    `);

    const purchase = stmt.get(id) as Purchase | undefined;
    if (!purchase) return null;

    const itemStmt = db.prepare(`
      SELECT id, purchase_id as purchaseId, product_id as productId, quantity, unit_price as unitPrice,
             line_total as lineTotal, created_at as createdAt
      FROM purchase_items WHERE purchase_id = ?
    `);

    purchase.items = itemStmt.all(id) as PurchaseItem[];
    return purchase;
  }

  static getByPurchaseNumber(purchaseNumber: string): Purchase | null {
    const stmt = db.prepare(`SELECT id FROM purchases WHERE purchase_number = ?`);
    const result = stmt.get(purchaseNumber) as { id: string } | undefined;
    return result ? this.getById(result.id) : null;
  }

  static getByBranch(branchId: string, status?: string): Purchase[] {
    let query = `
      SELECT id, purchase_number as purchaseNumber, branch_id as branchId, supplier_id as supplierId,
             purchase_date as purchaseDate, expected_delivery as expectedDelivery, actual_delivery as actualDelivery,
             total_amount as totalAmount, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM purchases WHERE branch_id = ?
    `;

    const values: any[] = [branchId];

    if (status) {
      query += ` AND status = ?`;
      values.push(status);
    }

    query += ` ORDER BY purchase_date DESC`;

    const stmt = db.prepare(query);
    return stmt.all(...values) as Purchase[];
  }

  static receivePurchase(purchaseId: string): Purchase {
    const now = new Date().toISOString();
    const purchase = this.getById(purchaseId);
    if (!purchase) throw new Error('Purchase not found');

    const stmt = db.prepare(`UPDATE purchases SET status = 'received', actual_delivery = ?, updated_at = ? WHERE id = ?`);
    stmt.run(now, now, purchaseId);

    // Update product stock
    if (purchase.items) {
      for (const item of purchase.items) {
        if (item.productId) {
          ProductService.adjustStock(item.productId, item.quantity, `Received from purchase ${purchase.purchaseNumber}`);
        }
      }
    }

    return this.getById(purchaseId)!;
  }

  static getPendingPurchases(): Purchase[] {
    const stmt = db.prepare(`
      SELECT id, purchase_number as purchaseNumber, branch_id as branchId, supplier_id as supplierId,
             purchase_date as purchaseDate, expected_delivery as expectedDelivery, actual_delivery as actualDelivery,
             total_amount as totalAmount, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM purchases WHERE status IN ('pending', 'ordered')
      ORDER BY purchase_date ASC
    `);

    return stmt.all() as Purchase[];
  }

  static getOverduePurchases(): Purchase[] {
    const stmt = db.prepare(`
      SELECT id, purchase_number as purchaseNumber, branch_id as branchId, supplier_id as supplierId,
             purchase_date as purchaseDate, expected_delivery as expectedDelivery, actual_delivery as actualDelivery,
             total_amount as totalAmount, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM purchases WHERE expected_delivery < datetime('now') AND status != 'received'
      ORDER BY expected_delivery ASC
    `);

    return stmt.all() as Purchase[];
  }
}
