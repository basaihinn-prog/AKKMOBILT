import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface IMEIRecord {
  id: string;
  imei: string;
  productId: string;
  serialNumber?: string;
  status: 'stock' | 'sold' | 'in_repair' | 'warranty' | 'returned' | 'discarded';
  purchaseDate?: string;
  saleDate?: string;
  customerId?: string;
  supplierId?: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export class IMEIService {
  static register(data: Partial<IMEIRecord>): IMEIRecord {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Check if IMEI already exists
    const existing = db.prepare(`SELECT id FROM imei_tracking WHERE imei = ?`).get(data.imei);
    if (existing) throw new Error('IMEI already registered');

    const stmt = db.prepare(`
      INSERT INTO imei_tracking (id, imei, product_id, serial_number, status, purchase_date, sale_date, customer_id, supplier_id, branch_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, data.imei, data.productId, data.serialNumber || null, data.status || 'stock',
      data.purchaseDate || null, data.saleDate || null, data.customerId || null, data.supplierId || null,
      data.branchId, now, now
    );

    return this.getById(id)!;
  }

  static getById(id: string): IMEIRecord | null {
    const stmt = db.prepare(`
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE id = ?
    `);

    return stmt.get(id) as IMEIRecord | undefined || null;
  }

  static getByIMEI(imei: string): IMEIRecord | null {
    const stmt = db.prepare(`
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE imei = ?
    `);

    return stmt.get(imei) as IMEIRecord | undefined || null;
  }

  static updateStatus(imei: string, status: string, updates?: Partial<IMEIRecord>): IMEIRecord {
    const now = new Date().toISOString();
    const record = this.getByIMEI(imei);
    if (!record) throw new Error('IMEI not found');

    let query = `UPDATE imei_tracking SET status = ?, updated_at = ?`;
    const values: any[] = [status, now];

    if (updates?.saleDate) {
      query += `, sale_date = ?`;
      values.push(updates.saleDate);
    }
    if (updates?.customerId) {
      query += `, customer_id = ?`;
      values.push(updates.customerId);
    }
    if (updates?.supplierId) {
      query += `, supplier_id = ?`;
      values.push(updates.supplierId);
    }

    query += ` WHERE imei = ?`;
    values.push(imei);

    const stmt = db.prepare(query);
    stmt.run(...values);

    return this.getByIMEI(imei)!;
  }

  static getByProduct(productId: string): IMEIRecord[] {
    const stmt = db.prepare(`
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE product_id = ?
      ORDER BY created_at DESC
    `);

    return stmt.all(productId) as IMEIRecord[];
  }

  static getByBranch(branchId: string, status?: string): IMEIRecord[] {
    let query = `
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE branch_id = ?
    `;

    const values: any[] = [branchId];

    if (status) {
      query += ` AND status = ?`;
      values.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const stmt = db.prepare(query);
    return (values.length > 1 ? stmt.all(...values) : stmt.all(branchId)) as IMEIRecord[];
  }

  static getByCustomer(customerId: string): IMEIRecord[] {
    const stmt = db.prepare(`
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE customer_id = ?
      ORDER BY sale_date DESC
    `);

    return stmt.all(customerId) as IMEIRecord[];
  }

  static getStockByProduct(productId: string): IMEIRecord[] {
    const stmt = db.prepare(`
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE product_id = ? AND status = 'stock'
    `);

    return stmt.all(productId) as IMEIRecord[];
  }

  static trackWarranty(imei: string): { warrantyStatus: string; expiryDate?: string; claimable: boolean } {
    const record = this.getByIMEI(imei);
    if (!record || !record.saleDate) return { warrantyStatus: 'no_warranty', claimable: false };

    // Assume 1-year warranty from sale date
    const saleDate = new Date(record.saleDate);
    const expiryDate = new Date(saleDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const now = new Date();
    const isUnderWarranty = now <= expiryDate;

    return {
      warrantyStatus: isUnderWarranty ? 'active' : 'expired',
      expiryDate: expiryDate.toISOString(),
      claimable: isUnderWarranty && (record.status === 'in_repair' || record.status === 'warranty'),
    };
  }
}
