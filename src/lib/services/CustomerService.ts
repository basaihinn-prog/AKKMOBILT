import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  loyaltyPoints: number;
  totalPurchases: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class CustomerService {
  static create(data: Partial<Customer>): Customer {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO customers (id, name, phone, email, address, city, loyalty_points, total_purchases, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, data.name, data.phone || null, data.email || null, data.address || null,
      data.city || null, 0, 0, 1, now, now
    );

    return this.getById(id)!;
  }

  static getById(id: string): Customer | null {
    const stmt = db.prepare(`
      SELECT id, name, phone, email, address, city, loyalty_points as loyaltyPoints,
             total_purchases as totalPurchases, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM customers WHERE id = ?
    `);

    return stmt.get(id) as Customer | undefined || null;
  }

  static getAll(filters?: { isActive?: boolean; city?: string }): Customer[] {
    let query = `
      SELECT id, name, phone, email, address, city, loyalty_points as loyaltyPoints,
             total_purchases as totalPurchases, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM customers WHERE 1=1
    `;

    const values: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ` AND is_active = ?`;
      values.push(filters.isActive ? 1 : 0);
    }

    if (filters?.city) {
      query += ` AND city = ?`;
      values.push(filters.city);
    }

    query += ` ORDER BY created_at DESC`;

    const stmt = db.prepare(query);
    return (values.length ? stmt.all(...values) : stmt.all()) as Customer[];
  }

  static update(id: string, data: Partial<Customer>): Customer {
    const now = new Date().toISOString();
    const updates: string[] = ['updated_at = ?'];
    const values: any[] = [now];

    if (data.name !== undefined) {
      updates.unshift('name = ?');
      values.unshift(data.name);
    }
    if (data.phone !== undefined) {
      updates.unshift('phone = ?');
      values.unshift(data.phone);
    }
    if (data.email !== undefined) {
      updates.unshift('email = ?');
      values.unshift(data.email);
    }
    if (data.address !== undefined) {
      updates.unshift('address = ?');
      values.unshift(data.address);
    }
    if (data.city !== undefined) {
      updates.unshift('city = ?');
      values.unshift(data.city);
    }

    values.push(id);

    const stmt = db.prepare(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getById(id)!;
  }

  static addLoyaltyPoints(id: string, points: number): Customer {
    const customer = this.getById(id);
    if (!customer) throw new Error('Customer not found');

    const stmt = db.prepare(`UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?`);
    stmt.run(points, id);

    return this.getById(id)!;
  }

  static recordPurchase(id: string, amount: number): Customer {
    const customer = this.getById(id);
    if (!customer) throw new Error('Customer not found');

    const stmt = db.prepare(`UPDATE customers SET total_purchases = total_purchases + ? WHERE id = ?`);
    stmt.run(amount, id);

    return this.getById(id)!;
  }

  static getTopCustomers(limit: number = 10): Customer[] {
    const stmt = db.prepare(`
      SELECT id, name, phone, email, address, city, loyalty_points as loyaltyPoints,
             total_purchases as totalPurchases, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM customers WHERE is_active = 1
      ORDER BY total_purchases DESC
      LIMIT ?
    `);

    return stmt.all(limit) as Customer[];
  }

  static searchByName(name: string): Customer[] {
    const stmt = db.prepare(`
      SELECT id, name, phone, email, address, city, loyalty_points as loyaltyPoints,
             total_purchases as totalPurchases, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM customers WHERE name LIKE ? AND is_active = 1
      ORDER BY name
    `);

    return stmt.all(`%${name}%`) as Customer[];
  }

  static searchByPhone(phone: string): Customer | null {
    const stmt = db.prepare(`
      SELECT id, name, phone, email, address, city, loyalty_points as loyaltyPoints,
             total_purchases as totalPurchases, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM customers WHERE phone = ?
    `);

    return stmt.get(phone) as Customer | undefined || null;
  }
}
