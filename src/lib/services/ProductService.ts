import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  brandId?: string;
  modelId?: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class ProductService {
  static create(data: Partial<Product>): Product {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO products (id, sku, name, category_id, brand_id, model_id, description, 
                           cost_price, selling_price, stock_quantity, min_stock, max_stock, unit, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, data.sku, data.name, data.categoryId, data.brandId, data.modelId,
      data.description, data.costPrice, data.sellingPrice, data.stockQuantity || 0,
      data.minStock || 10, data.maxStock || 100, data.unit || 'piece', 1, now, now
    );

    return this.getById(id)!;
  }

  static getById(id: string): Product | null {
    const stmt = db.prepare(`
      SELECT id, sku, name, category_id as categoryId, brand_id as brandId, model_id as modelId,
             description, cost_price as costPrice, selling_price as sellingPrice, stock_quantity as stockQuantity,
             min_stock as minStock, max_stock as maxStock, unit, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM products WHERE id = ?
    `);
    return stmt.get(id) as Product | undefined || null;
  }

  static getAll(filters?: { categoryId?: string; isActive?: boolean }): Product[] {
    let query = `
      SELECT id, sku, name, category_id as categoryId, brand_id as brandId, model_id as modelId,
             description, cost_price as costPrice, selling_price as sellingPrice, stock_quantity as stockQuantity,
             min_stock as minStock, max_stock as maxStock, unit, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM products WHERE 1=1
    `;

    if (filters?.categoryId) query += ` AND category_id = ?`;
    if (filters?.isActive !== undefined) query += ` AND is_active = ?`;

    const values: any[] = [];
    if (filters?.categoryId) values.push(filters.categoryId);
    if (filters?.isActive !== undefined) values.push(filters.isActive ? 1 : 0);

    const stmt = db.prepare(query);
    return (values.length ? stmt.all(...values) : stmt.all()) as Product[];
  }

  static update(id: string, data: Partial<Product>): Product {
    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (dbKey !== 'id') {
        updates.push(`${dbKey} = ?`);
        values.push(value);
      }
    });

    updates.push(`updated_at = ?`);
    values.push(now);
    values.push(id);

    const stmt = db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getById(id)!;
  }

  static delete(id: string): boolean {
    const stmt = db.prepare(`UPDATE products SET is_active = 0 WHERE id = ?`);
    stmt.run(id);
    return true;
  }

  static adjustStock(id: string, quantity: number, reason: string): Product {
    const product = this.getById(id);
    if (!product) throw new Error('Product not found');

    const newQuantity = product.stockQuantity + quantity;
    if (newQuantity < 0) throw new Error('Insufficient stock');

    return this.update(id, { stockQuantity: newQuantity });
  }

  static getLowStockProducts(): Product[] {
    const stmt = db.prepare(`
      SELECT id, sku, name, category_id as categoryId, brand_id as brandId, model_id as modelId,
             description, cost_price as costPrice, selling_price as sellingPrice, stock_quantity as stockQuantity,
             min_stock as minStock, max_stock as maxStock, unit, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM products WHERE stock_quantity <= min_stock AND is_active = 1
    `);
    return stmt.all() as Product[];
  }
}
