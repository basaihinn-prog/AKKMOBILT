import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface Repair {
  id: string;
  ticketNumber: string;
  branchId: string;
  customerId: string;
  deviceBrand: string;
  deviceModel: string;
  imei?: string;
  issueDescription: string;
  receivedDate: string;
  expectedCompletion?: string;
  completionDate?: string;
  status: 'received' | 'diagnostic' | 'repairing' | 'testing' | 'ready' | 'delivered';
  assignedTo?: string;
  repairCost?: number;
  diagnosis?: string;
  partsUsed?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  services?: RepairService[];
}

export interface RepairServiceItem {
  id: string;
  repairId: string;
  serviceName: string;
  cost: number;
  createdAt: string;
}

export class RepairService {
  static generateTicketNumber(branchId: string): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const branchCode = branchId.split('-')[1]?.toUpperCase() || 'XX';
    const count = db.prepare(`SELECT COUNT(*) as count FROM repairs WHERE branch_id = ?`).get(branchId) as { count: number };
    return `REP-${branchCode}-${dateStr}-${String(count.count + 1).padStart(4, '0')}`;
  }

  static create(data: Partial<Repair>): Repair {
    const id = uuidv4();
    const now = new Date().toISOString();
    const ticketNumber = this.generateTicketNumber(data.branchId!);

    const stmt = db.prepare(`
      INSERT INTO repairs (id, ticket_number, branch_id, customer_id, device_brand, device_model, imei,
                          issue_description, received_date, expected_completion, status, assigned_to, 
                          repair_cost, diagnosis, parts_used, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, ticketNumber, data.branchId, data.customerId, data.deviceBrand, data.deviceModel, data.imei || null,
      data.issueDescription, data.receivedDate || now, data.expectedCompletion || null, 'received',
      data.assignedTo || null, data.repairCost || null, data.diagnosis || null, data.partsUsed || null,
      data.notes || null, now, now
    );

    return this.getById(id)!;
  }

  static getById(id: string): Repair | null {
    const stmt = db.prepare(`
      SELECT id, ticket_number as ticketNumber, branch_id as branchId, customer_id as customerId,
             device_brand as deviceBrand, device_model as deviceModel, imei, issue_description as issueDescription,
             received_date as receivedDate, expected_completion as expectedCompletion, completion_date as completionDate,
             status, assigned_to as assignedTo, repair_cost as repairCost, diagnosis, parts_used as partsUsed,
             notes, created_at as createdAt, updated_at as updatedAt
      FROM repairs WHERE id = ?
    `);

    const repair = stmt.get(id) as Repair | undefined;
    if (!repair) return null;

    const serviceStmt = db.prepare(`
      SELECT id, repair_id as repairId, service_name as serviceName, cost, created_at as createdAt
      FROM repair_services WHERE repair_id = ?
    `);

    repair.services = serviceStmt.all(id) as RepairServiceItem[];
    return repair;
  }

  static getByTicketNumber(ticketNumber: string): Repair | null {
    const stmt = db.prepare(`SELECT id FROM repairs WHERE ticket_number = ?`);
    const result = stmt.get(ticketNumber) as { id: string } | undefined;
    return result ? this.getById(result.id) : null;
  }

  static getByBranch(branchId: string, status?: string): Repair[] {
    let query = `
      SELECT id, ticket_number as ticketNumber, branch_id as branchId, customer_id as customerId,
             device_brand as deviceBrand, device_model as deviceModel, imei, issue_description as issueDescription,
             received_date as receivedDate, expected_completion as expectedCompletion, completion_date as completionDate,
             status, assigned_to as assignedTo, repair_cost as repairCost, diagnosis, parts_used as partsUsed,
             notes, created_at as createdAt, updated_at as updatedAt
      FROM repairs WHERE branch_id = ?
    `;

    const values: any[] = [branchId];

    if (status) {
      query += ` AND status = ?`;
      values.push(status);
    }

    query += ` ORDER BY received_date DESC`;

    const stmt = db.prepare(query);
    return stmt.all(...values) as Repair[];
  }

  static updateStatus(id: string, status: string, notes?: string): Repair {
    const now = new Date().toISOString();
    const completionDate = status === 'delivered' ? now : null;

    const stmt = db.prepare(`
      UPDATE repairs SET status = ?, completion_date = ?, notes = ?, updated_at = ? WHERE id = ?
    `);

    stmt.run(status, completionDate, notes || null, now, id);
    return this.getById(id)!;
  }

  static addService(repairId: string, serviceName: string, cost: number): RepairServiceItem {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO repair_services (id, repair_id, service_name, cost, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, repairId, serviceName, cost, now);
    return { id, repairId, serviceName, cost, createdAt: now };
  }

  static getPendingRepairs(): Repair[] {
    const stmt = db.prepare(`
      SELECT id, ticket_number as ticketNumber, branch_id as branchId, customer_id as customerId,
             device_brand as deviceBrand, device_model as deviceModel, imei, issue_description as issueDescription,
             received_date as receivedDate, expected_completion as expectedCompletion, completion_date as completionDate,
             status, assigned_to as assignedTo, repair_cost as repairCost, diagnosis, parts_used as partsUsed,
             notes, created_at as createdAt, updated_at as updatedAt
      FROM repairs WHERE status NOT IN ('ready', 'delivered')
      ORDER BY received_date ASC
    `);

    return stmt.all() as Repair[];
  }

  static getOverdueRepairs(): Repair[] {
    const stmt = db.prepare(`
      SELECT id, ticket_number as ticketNumber, branch_id as branchId, customer_id as customerId,
             device_brand as deviceBrand, device_model as deviceModel, imei, issue_description as issueDescription,
             received_date as receivedDate, expected_completion as expectedCompletion, completion_date as completionDate,
             status, assigned_to as assignedTo, repair_cost as repairCost, diagnosis, parts_used as partsUsed,
             notes, created_at as createdAt, updated_at as updatedAt
      FROM repairs WHERE expected_completion < datetime('now') AND status NOT IN ('ready', 'delivered')
      ORDER BY expected_completion ASC
    `);

    return stmt.all() as Repair[];
  }
}
