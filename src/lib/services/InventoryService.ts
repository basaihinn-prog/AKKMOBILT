import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { ProductService } from './ProductService';

export interface Transfer {
  id: string;
  transferNumber: string;
  fromBranch: string;
  toBranch: string;
  transferDate: string;
  receivedDate?: string;
  status: 'pending' | 'in_transit' | 'received';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: TransferItem[];
}

export interface TransferItem {
  id: string;
  transferId: string;
  productId: string;
  quantity: number;
  createdAt: string;
}

export class InventoryService {
  static generateTransferNumber(fromBranch: string, toBranch: string): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const fromCode = fromBranch.split('-')[1]?.toUpperCase() || 'XX';
    const toCode = toBranch.split('-')[1]?.toUpperCase() || 'XX';
    const count = db.prepare(`SELECT COUNT(*) as count FROM inventory_transfers`).get() as { count: number };
    return `TRF-${fromCode}${toCode}-${dateStr}-${String(count.count + 1).padStart(4, '0')}`;
  }

  static createTransfer(data: Partial<Transfer>): Transfer {
    const id = uuidv4();
    const now = new Date().toISOString();
    const transferNumber = this.generateTransferNumber(data.fromBranch!, data.toBranch!);

    const stmt = db.prepare(`
      INSERT INTO inventory_transfers (id, transfer_number, from_branch, to_branch, transfer_date, received_date, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, transferNumber, data.fromBranch, data.toBranch, data.transferDate || now, null, 'pending', data.notes || null, now, now
    );

    return this.getTransferById(id)!;
  }

  static addTransferItem(transferId: string, productId: string, quantity: number): TransferItem {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO transfer_items (id, transfer_id, product_id, quantity, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, transferId, productId, quantity, now);
    return { id, transferId, productId, quantity, createdAt: now };
  }

  static getTransferById(id: string): Transfer | null {
    const stmt = db.prepare(`
      SELECT id, transfer_number as transferNumber, from_branch as fromBranch, to_branch as toBranch,
             transfer_date as transferDate, received_date as receivedDate, status, notes,
             created_at as createdAt, updated_at as updatedAt
      FROM inventory_transfers WHERE id = ?
    `);

    const transfer = stmt.get(id) as Transfer | undefined;
    if (!transfer) return null;

    const itemStmt = db.prepare(`
      SELECT id, transfer_id as transferId, product_id as productId, quantity, created_at as createdAt
      FROM transfer_items WHERE transfer_id = ?
    `);

    transfer.items = itemStmt.all(id) as TransferItem[];
    return transfer;
  }

  static getTransferByNumber(transferNumber: string): Transfer | null {
    const stmt = db.prepare(`SELECT id FROM inventory_transfers WHERE transfer_number = ?`);
    const result = stmt.get(transferNumber) as { id: string } | undefined;
    return result ? this.getTransferById(result.id) : null;
  }

  static getPendingTransfers(): Transfer[] {
    const stmt = db.prepare(`
      SELECT id, transfer_number as transferNumber, from_branch as fromBranch, to_branch as toBranch,
             transfer_date as transferDate, received_date as receivedDate, status, notes,
             created_at as createdAt, updated_at as updatedAt
      FROM inventory_transfers WHERE status IN ('pending', 'in_transit')
      ORDER BY transfer_date ASC
    `);

    return stmt.all() as Transfer[];
  }

  static confirmTransfer(transferId: string): Transfer {
    const now = new Date().toISOString();

    const transfer = this.getTransferById(transferId);
    if (!transfer) throw new Error('Transfer not found');

    const updateStmt = db.prepare(`UPDATE inventory_transfers SET status = 'received', received_date = ?, updated_at = ? WHERE id = ?`);
    updateStmt.run(now, now, transferId);

    // Transfer stocks
    if (transfer.items) {
      for (const item of transfer.items) {
        // Reduce from source branch
        const fromProduct = ProductService.getById(item.productId);
        if (fromProduct) {
          ProductService.adjustStock(item.productId, -item.quantity, `Transfer out to ${transfer.toBranch}`);
          ProductService.adjustStock(item.productId, item.quantity, `Transfer in from ${transfer.fromBranch}`);
        }
      }
    }

    return this.getTransferById(transferId)!;
  }

  static getTransfersForBranch(branchId: string, direction: 'in' | 'out'): Transfer[] {
    const column = direction === 'in' ? 'to_branch' : 'from_branch';
    const stmt = db.prepare(`
      SELECT id, transfer_number as transferNumber, from_branch as fromBranch, to_branch as toBranch,
             transfer_date as transferDate, received_date as receivedDate, status, notes,
             created_at as createdAt, updated_at as updatedAt
      FROM inventory_transfers WHERE ${column} = ?
      ORDER BY transfer_date DESC
    `);

    return stmt.all(branchId) as Transfer[];
  }
}
