// server.ts
import express from "express";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// src/lib/database.ts
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var dbPath = path.join(__dirname, "../../data/akk_enterprise.db");
var db = new Database(dbPath);
db.pragma("foreign_keys = ON");
function initializeDatabase() {
  const tables = [
    // Users and Access Control
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(branch_id) REFERENCES branches(id)
    )`,
    // Branches
    `CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      location TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      manager_id TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(manager_id) REFERENCES users(id)
    )`,
    // Products and Inventory
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category_id TEXT,
      brand_id TEXT,
      model_id TEXT,
      description TEXT,
      cost_price DECIMAL(12,2),
      selling_price DECIMAL(12,2),
      stock_quantity INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 10,
      max_stock INTEGER DEFAULT 100,
      unit TEXT DEFAULT 'piece',
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id),
      FOREIGN KEY(brand_id) REFERENCES brands(id),
      FOREIGN KEY(model_id) REFERENCES models(id)
    )`,
    // IMEI Tracking
    `CREATE TABLE IF NOT EXISTS imei_tracking (
      id TEXT PRIMARY KEY,
      imei TEXT UNIQUE NOT NULL,
      product_id TEXT NOT NULL,
      serial_number TEXT,
      status TEXT DEFAULT 'stock',
      purchase_date DATETIME,
      sale_date DATETIME,
      customer_id TEXT,
      supplier_id TEXT,
      branch_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY(branch_id) REFERENCES branches(id)
    )`,
    // Categories, Brands, Models
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS models (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(brand_id) REFERENCES brands(id),
      FOREIGN KEY(category_id) REFERENCES categories(id),
      UNIQUE(name, brand_id)
    )`,
    // POS Sales
    `CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      sale_number TEXT UNIQUE NOT NULL,
      branch_id TEXT NOT NULL,
      cashier_id TEXT NOT NULL,
      customer_id TEXT,
      sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_amount DECIMAL(12,2) NOT NULL,
      subtotal DECIMAL(12,2),
      tax_amount DECIMAL(12,2),
      discount_amount DECIMAL(12,2),
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(branch_id) REFERENCES branches(id),
      FOREIGN KEY(cashier_id) REFERENCES users(id),
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    )`,
    `CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      imei TEXT,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      line_total DECIMAL(12,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`,
    // Customers
    `CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      loyalty_points INTEGER DEFAULT 0,
      total_purchases DECIMAL(12,2) DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // Repair Management
    `CREATE TABLE IF NOT EXISTS repairs (
      id TEXT PRIMARY KEY,
      ticket_number TEXT UNIQUE NOT NULL,
      branch_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      device_brand TEXT,
      device_model TEXT,
      imei TEXT,
      issue_description TEXT NOT NULL,
      received_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expected_completion DATETIME,
      completion_date DATETIME,
      status TEXT DEFAULT 'received',
      assigned_to TEXT,
      repair_cost DECIMAL(12,2),
      diagnosis TEXT,
      parts_used TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(branch_id) REFERENCES branches(id),
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(assigned_to) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS repair_services (
      id TEXT PRIMARY KEY,
      repair_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      cost DECIMAL(12,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(repair_id) REFERENCES repairs(id) ON DELETE CASCADE
    )`,
    // Inventory Transfers
    `CREATE TABLE IF NOT EXISTS inventory_transfers (
      id TEXT PRIMARY KEY,
      transfer_number TEXT UNIQUE NOT NULL,
      from_branch TEXT NOT NULL,
      to_branch TEXT NOT NULL,
      transfer_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      received_date DATETIME,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(from_branch) REFERENCES branches(id),
      FOREIGN KEY(to_branch) REFERENCES branches(id)
    )`,
    `CREATE TABLE IF NOT EXISTS transfer_items (
      id TEXT PRIMARY KEY,
      transfer_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(transfer_id) REFERENCES inventory_transfers(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`,
    // Accounting
    `CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      category TEXT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      description TEXT,
      expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_by TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(branch_id) REFERENCES branches(id),
      FOREIGN KEY(approved_by) REFERENCES users(id)
    )`,
    // Purchases
    `CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      purchase_number TEXT UNIQUE NOT NULL,
      branch_id TEXT NOT NULL,
      supplier_id TEXT,
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      expected_delivery DATETIME,
      actual_delivery DATETIME,
      total_amount DECIMAL(12,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(branch_id) REFERENCES branches(id),
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )`,
    `CREATE TABLE IF NOT EXISTS purchase_items (
      id TEXT PRIMARY KEY,
      purchase_id TEXT NOT NULL,
      product_id TEXT,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(12,2) NOT NULL,
      line_total DECIMAL(12,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`,
    // Suppliers
    `CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      payment_terms TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // HR - Employees
    `CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE,
      employee_id TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      date_of_birth DATE,
      gender TEXT,
      address TEXT,
      branch_id TEXT NOT NULL,
      department_id TEXT,
      position_id TEXT,
      join_date DATE NOT NULL,
      base_salary DECIMAL(12,2),
      commission_rate DECIMAL(5,2),
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(branch_id) REFERENCES branches(id),
      FOREIGN KEY(department_id) REFERENCES departments(id),
      FOREIGN KEY(position_id) REFERENCES positions(id)
    )`,
    // Departments and Positions
    `CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      branch_id TEXT,
      manager_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(branch_id) REFERENCES branches(id),
      FOREIGN KEY(manager_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS positions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      department_id TEXT,
      base_salary DECIMAL(12,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(department_id) REFERENCES departments(id)
    )`,
    // Attendance
    `CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      attendance_date DATE NOT NULL,
      check_in_time TIME,
      check_out_time TIME,
      status TEXT DEFAULT 'present',
      work_hours DECIMAL(5,2),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employee_id) REFERENCES employees(id),
      FOREIGN KEY(branch_id) REFERENCES branches(id),
      UNIQUE(employee_id, attendance_date)
    )`,
    // Leave Requests
    `CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      duration_days INTEGER NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      approved_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employee_id) REFERENCES employees(id),
      FOREIGN KEY(approved_by) REFERENCES users(id)
    )`,
    // Payroll
    `CREATE TABLE IF NOT EXISTS payroll (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      base_salary DECIMAL(12,2),
      allowances DECIMAL(12,2) DEFAULT 0,
      bonuses DECIMAL(12,2) DEFAULT 0,
      deductions DECIMAL(12,2) DEFAULT 0,
      taxes DECIMAL(12,2) DEFAULT 0,
      net_salary DECIMAL(12,2),
      status TEXT DEFAULT 'draft',
      approved_by TEXT,
      paid_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(employee_id) REFERENCES employees(id),
      FOREIGN KEY(approved_by) REFERENCES users(id),
      UNIQUE(employee_id, month, year)
    )`,
    // Audit Logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      branch_id TEXT,
      old_values TEXT,
      new_values TEXT,
      ip_address TEXT,
      user_agent TEXT,
      status TEXT DEFAULT 'success',
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(branch_id) REFERENCES branches(id)
    )`,
    // Approval Requests
    `CREATE TABLE IF NOT EXISTS approval_requests (
      id TEXT PRIMARY KEY,
      request_type TEXT NOT NULL,
      requester_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      amount DECIMAL(12,2),
      description TEXT,
      data TEXT,
      status TEXT DEFAULT 'pending',
      current_level TEXT DEFAULT 'manager',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY(requester_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS approval_chain (
      id TEXT PRIMARY KEY,
      approval_request_id TEXT NOT NULL,
      level TEXT NOT NULL,
      approver_id TEXT,
      status TEXT DEFAULT 'pending',
      comments TEXT,
      action_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(approval_request_id) REFERENCES approval_requests(id) ON DELETE CASCADE,
      FOREIGN KEY(approver_id) REFERENCES users(id)
    )`
  ];
  for (const sql of tables) {
    db.exec(sql);
  }
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
    "CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id)",
    "CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)",
    "CREATE INDEX IF NOT EXISTS idx_imei_imei ON imei_tracking(imei)",
    "CREATE INDEX IF NOT EXISTS idx_sales_branch_date ON sales(branch_id, sale_date)",
    "CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status)",
    "CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date)",
    "CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at)"
  ];
  for (const sql of indexes) {
    db.exec(sql);
  }
  console.log("Database initialized successfully");
}

// src/lib/services/ProductService.ts
import { v4 as uuidv4 } from "uuid";
var ProductService = class {
  static create(data) {
    const id = uuidv4();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = db.prepare(`
      INSERT INTO products (id, sku, name, category_id, brand_id, model_id, description, 
                           cost_price, selling_price, stock_quantity, min_stock, max_stock, unit, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.sku,
      data.name,
      data.categoryId,
      data.brandId,
      data.modelId,
      data.description,
      data.costPrice,
      data.sellingPrice,
      data.stockQuantity || 0,
      data.minStock || 10,
      data.maxStock || 100,
      data.unit || "piece",
      1,
      now,
      now
    );
    return this.getById(id);
  }
  static getById(id) {
    const stmt = db.prepare(`
      SELECT id, sku, name, category_id as categoryId, brand_id as brandId, model_id as modelId,
             description, cost_price as costPrice, selling_price as sellingPrice, stock_quantity as stockQuantity,
             min_stock as minStock, max_stock as maxStock, unit, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM products WHERE id = ?
    `);
    return stmt.get(id) || null;
  }
  static getAll(filters) {
    let query = `
      SELECT id, sku, name, category_id as categoryId, brand_id as brandId, model_id as modelId,
             description, cost_price as costPrice, selling_price as sellingPrice, stock_quantity as stockQuantity,
             min_stock as minStock, max_stock as maxStock, unit, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM products WHERE 1=1
    `;
    if (filters?.categoryId) query += ` AND category_id = ?`;
    if (filters?.isActive !== void 0) query += ` AND is_active = ?`;
    const values = [];
    if (filters?.categoryId) values.push(filters.categoryId);
    if (filters?.isActive !== void 0) values.push(filters.isActive ? 1 : 0);
    const stmt = db.prepare(query);
    return values.length ? stmt.all(...values) : stmt.all();
  }
  static update(id, data) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const updates = [];
    const values = [];
    Object.entries(data).forEach(([key, value]) => {
      const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (dbKey !== "id") {
        updates.push(`${dbKey} = ?`);
        values.push(value);
      }
    });
    updates.push(`updated_at = ?`);
    values.push(now);
    values.push(id);
    const stmt = db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    return this.getById(id);
  }
  static delete(id) {
    const stmt = db.prepare(`UPDATE products SET is_active = 0 WHERE id = ?`);
    stmt.run(id);
    return true;
  }
  static adjustStock(id, quantity, reason) {
    const product = this.getById(id);
    if (!product) throw new Error("Product not found");
    const newQuantity = product.stockQuantity + quantity;
    if (newQuantity < 0) throw new Error("Insufficient stock");
    return this.update(id, { stockQuantity: newQuantity });
  }
  static getLowStockProducts() {
    const stmt = db.prepare(`
      SELECT id, sku, name, category_id as categoryId, brand_id as brandId, model_id as modelId,
             description, cost_price as costPrice, selling_price as sellingPrice, stock_quantity as stockQuantity,
             min_stock as minStock, max_stock as maxStock, unit, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM products WHERE stock_quantity <= min_stock AND is_active = 1
    `);
    return stmt.all();
  }
};

// src/lib/services/SalesService.ts
import { v4 as uuidv42 } from "uuid";
var SalesService = class {
  static generateSaleNumber(branchId) {
    const date = /* @__PURE__ */ new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const branchCode = branchId.split("-")[1]?.toUpperCase() || "XX";
    const count = db.prepare(`SELECT COUNT(*) as count FROM sales WHERE branch_id = ? AND sale_date LIKE ?`).get(branchId, dateStr + "%");
    return `SL-${branchCode}-${dateStr}-${String(count.count + 1).padStart(4, "0")}`;
  }
  static create(data) {
    const id = uuidv42();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const saleNumber = this.generateSaleNumber(data.branchId);
    const stmt = db.prepare(`
      INSERT INTO sales (id, sale_number, branch_id, cashier_id, customer_id, sale_date, 
                        total_amount, subtotal, tax_amount, discount_amount, payment_method, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      saleNumber,
      data.branchId,
      data.cashierId,
      data.customerId || null,
      data.saleDate || now,
      data.totalAmount,
      data.subtotal || 0,
      data.taxAmount || 0,
      data.discountAmount || 0,
      data.paymentMethod,
      data.status || "completed",
      data.notes || null,
      now,
      now
    );
    return this.getById(id);
  }
  static addItem(saleId, item) {
    const id = uuidv42();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = db.prepare(`
      INSERT INTO sale_items (id, sale_id, product_id, imei, quantity, unit_price, line_total, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      saleId,
      item.productId,
      item.imei || null,
      item.quantity,
      item.unitPrice,
      item.lineTotal || item.quantity * item.unitPrice,
      now
    );
    ProductService.adjustStock(item.productId, -item.quantity, "sale");
    return { id, saleId, ...item, createdAt: now };
  }
  static getById(id) {
    const stmt = db.prepare(`
      SELECT id, sale_number as saleNumber, branch_id as branchId, cashier_id as cashierId, 
             customer_id as customerId, sale_date as saleDate, total_amount as totalAmount,
             subtotal, tax_amount as taxAmount, discount_amount as discountAmount, 
             payment_method as paymentMethod, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM sales WHERE id = ?
    `);
    const sale = stmt.get(id);
    if (!sale) return null;
    const itemStmt = db.prepare(`
      SELECT id, sale_id as saleId, product_id as productId, imei, quantity, unit_price as unitPrice, 
             line_total as lineTotal, created_at as createdAt
      FROM sale_items WHERE sale_id = ?
    `);
    sale.items = itemStmt.all(id);
    return sale;
  }
  static getBySaleNumber(saleNumber) {
    const stmt = db.prepare(`SELECT id FROM sales WHERE sale_number = ?`);
    const result = stmt.get(saleNumber);
    return result ? this.getById(result.id) : null;
  }
  static getByBranch(branchId, startDate, endDate) {
    let query = `
      SELECT id, sale_number as saleNumber, branch_id as branchId, cashier_id as cashierId, 
             customer_id as customerId, sale_date as saleDate, total_amount as totalAmount,
             subtotal, tax_amount as taxAmount, discount_amount as discountAmount, 
             payment_method as paymentMethod, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM sales WHERE branch_id = ?
    `;
    const values = [branchId];
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
    return stmt.all(...values);
  }
  static calculateDailySales(branchId, date) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count, SUM(total_amount) as total FROM sales 
      WHERE branch_id = ? AND DATE(sale_date) = DATE(?)
    `);
    const result = stmt.get(branchId, date);
    const paymentStmt = db.prepare(`
      SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total FROM sales
      WHERE branch_id = ? AND DATE(sale_date) = DATE(?)
      GROUP BY payment_method
    `);
    const byPayment = {};
    paymentStmt.all(branchId, date).forEach((row) => {
      byPayment[row.payment_method] = row.total;
    });
    return { total: result.total || 0, count: result.count || 0, byPayment };
  }
};

// src/lib/services/RepairService.ts
import { v4 as uuidv43 } from "uuid";
var RepairService = class {
  static generateTicketNumber(branchId) {
    const date = /* @__PURE__ */ new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const branchCode = branchId.split("-")[1]?.toUpperCase() || "XX";
    const count = db.prepare(`SELECT COUNT(*) as count FROM repairs WHERE branch_id = ?`).get(branchId);
    return `REP-${branchCode}-${dateStr}-${String(count.count + 1).padStart(4, "0")}`;
  }
  static create(data) {
    const id = uuidv43();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const ticketNumber = this.generateTicketNumber(data.branchId);
    const stmt = db.prepare(`
      INSERT INTO repairs (id, ticket_number, branch_id, customer_id, device_brand, device_model, imei,
                          issue_description, received_date, expected_completion, status, assigned_to, 
                          repair_cost, diagnosis, parts_used, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      ticketNumber,
      data.branchId,
      data.customerId,
      data.deviceBrand,
      data.deviceModel,
      data.imei || null,
      data.issueDescription,
      data.receivedDate || now,
      data.expectedCompletion || null,
      "received",
      data.assignedTo || null,
      data.repairCost || null,
      data.diagnosis || null,
      data.partsUsed || null,
      data.notes || null,
      now,
      now
    );
    return this.getById(id);
  }
  static getById(id) {
    const stmt = db.prepare(`
      SELECT id, ticket_number as ticketNumber, branch_id as branchId, customer_id as customerId,
             device_brand as deviceBrand, device_model as deviceModel, imei, issue_description as issueDescription,
             received_date as receivedDate, expected_completion as expectedCompletion, completion_date as completionDate,
             status, assigned_to as assignedTo, repair_cost as repairCost, diagnosis, parts_used as partsUsed,
             notes, created_at as createdAt, updated_at as updatedAt
      FROM repairs WHERE id = ?
    `);
    const repair = stmt.get(id);
    if (!repair) return null;
    const serviceStmt = db.prepare(`
      SELECT id, repair_id as repairId, service_name as serviceName, cost, created_at as createdAt
      FROM repair_services WHERE repair_id = ?
    `);
    repair.services = serviceStmt.all(id);
    return repair;
  }
  static getByTicketNumber(ticketNumber) {
    const stmt = db.prepare(`SELECT id FROM repairs WHERE ticket_number = ?`);
    const result = stmt.get(ticketNumber);
    return result ? this.getById(result.id) : null;
  }
  static getByBranch(branchId, status) {
    let query = `
      SELECT id, ticket_number as ticketNumber, branch_id as branchId, customer_id as customerId,
             device_brand as deviceBrand, device_model as deviceModel, imei, issue_description as issueDescription,
             received_date as receivedDate, expected_completion as expectedCompletion, completion_date as completionDate,
             status, assigned_to as assignedTo, repair_cost as repairCost, diagnosis, parts_used as partsUsed,
             notes, created_at as createdAt, updated_at as updatedAt
      FROM repairs WHERE branch_id = ?
    `;
    const values = [branchId];
    if (status) {
      query += ` AND status = ?`;
      values.push(status);
    }
    query += ` ORDER BY received_date DESC`;
    const stmt = db.prepare(query);
    return stmt.all(...values);
  }
  static updateStatus(id, status, notes) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const completionDate = status === "delivered" ? now : null;
    const stmt = db.prepare(`
      UPDATE repairs SET status = ?, completion_date = ?, notes = ?, updated_at = ? WHERE id = ?
    `);
    stmt.run(status, completionDate, notes || null, now, id);
    return this.getById(id);
  }
  static addService(repairId, serviceName, cost) {
    const id = uuidv43();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = db.prepare(`
      INSERT INTO repair_services (id, repair_id, service_name, cost, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, repairId, serviceName, cost, now);
    return { id, repairId, serviceName, cost, createdAt: now };
  }
  static getPendingRepairs() {
    const stmt = db.prepare(`
      SELECT id, ticket_number as ticketNumber, branch_id as branchId, customer_id as customerId,
             device_brand as deviceBrand, device_model as deviceModel, imei, issue_description as issueDescription,
             received_date as receivedDate, expected_completion as expectedCompletion, completion_date as completionDate,
             status, assigned_to as assignedTo, repair_cost as repairCost, diagnosis, parts_used as partsUsed,
             notes, created_at as createdAt, updated_at as updatedAt
      FROM repairs WHERE status NOT IN ('ready', 'delivered')
      ORDER BY received_date ASC
    `);
    return stmt.all();
  }
  static getOverdueRepairs() {
    const stmt = db.prepare(`
      SELECT id, ticket_number as ticketNumber, branch_id as branchId, customer_id as customerId,
             device_brand as deviceBrand, device_model as deviceModel, imei, issue_description as issueDescription,
             received_date as receivedDate, expected_completion as expectedCompletion, completion_date as completionDate,
             status, assigned_to as assignedTo, repair_cost as repairCost, diagnosis, parts_used as partsUsed,
             notes, created_at as createdAt, updated_at as updatedAt
      FROM repairs WHERE expected_completion < datetime('now') AND status NOT IN ('ready', 'delivered')
      ORDER BY expected_completion ASC
    `);
    return stmt.all();
  }
};

// src/lib/services/CustomerService.ts
import { v4 as uuidv44 } from "uuid";
var CustomerService = class {
  static create(data) {
    const id = uuidv44();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = db.prepare(`
      INSERT INTO customers (id, name, phone, email, address, city, loyalty_points, total_purchases, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.name,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.city || null,
      0,
      0,
      1,
      now,
      now
    );
    return this.getById(id);
  }
  static getById(id) {
    const stmt = db.prepare(`
      SELECT id, name, phone, email, address, city, loyalty_points as loyaltyPoints,
             total_purchases as totalPurchases, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM customers WHERE id = ?
    `);
    return stmt.get(id) || null;
  }
  static getAll(filters) {
    let query = `
      SELECT id, name, phone, email, address, city, loyalty_points as loyaltyPoints,
             total_purchases as totalPurchases, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM customers WHERE 1=1
    `;
    const values = [];
    if (filters?.isActive !== void 0) {
      query += ` AND is_active = ?`;
      values.push(filters.isActive ? 1 : 0);
    }
    if (filters?.city) {
      query += ` AND city = ?`;
      values.push(filters.city);
    }
    query += ` ORDER BY created_at DESC`;
    const stmt = db.prepare(query);
    return values.length ? stmt.all(...values) : stmt.all();
  }
  static update(id, data) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const updates = ["updated_at = ?"];
    const values = [now];
    if (data.name !== void 0) {
      updates.unshift("name = ?");
      values.unshift(data.name);
    }
    if (data.phone !== void 0) {
      updates.unshift("phone = ?");
      values.unshift(data.phone);
    }
    if (data.email !== void 0) {
      updates.unshift("email = ?");
      values.unshift(data.email);
    }
    if (data.address !== void 0) {
      updates.unshift("address = ?");
      values.unshift(data.address);
    }
    if (data.city !== void 0) {
      updates.unshift("city = ?");
      values.unshift(data.city);
    }
    values.push(id);
    const stmt = db.prepare(`UPDATE customers SET ${updates.join(", ")} WHERE id = ?`);
    stmt.run(...values);
    return this.getById(id);
  }
  static addLoyaltyPoints(id, points) {
    const customer = this.getById(id);
    if (!customer) throw new Error("Customer not found");
    const stmt = db.prepare(`UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?`);
    stmt.run(points, id);
    return this.getById(id);
  }
  static recordPurchase(id, amount) {
    const customer = this.getById(id);
    if (!customer) throw new Error("Customer not found");
    const stmt = db.prepare(`UPDATE customers SET total_purchases = total_purchases + ? WHERE id = ?`);
    stmt.run(amount, id);
    return this.getById(id);
  }
  static getTopCustomers(limit = 10) {
    const stmt = db.prepare(`
      SELECT id, name, phone, email, address, city, loyalty_points as loyaltyPoints,
             total_purchases as totalPurchases, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM customers WHERE is_active = 1
      ORDER BY total_purchases DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }
  static searchByName(name) {
    const stmt = db.prepare(`
      SELECT id, name, phone, email, address, city, loyalty_points as loyaltyPoints,
             total_purchases as totalPurchases, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM customers WHERE name LIKE ? AND is_active = 1
      ORDER BY name
    `);
    return stmt.all(`%${name}%`);
  }
  static searchByPhone(phone) {
    const stmt = db.prepare(`
      SELECT id, name, phone, email, address, city, loyalty_points as loyaltyPoints,
             total_purchases as totalPurchases, is_active as isActive, created_at as createdAt, updated_at as updatedAt
      FROM customers WHERE phone = ?
    `);
    return stmt.get(phone) || null;
  }
};

// src/lib/services/InventoryService.ts
import { v4 as uuidv45 } from "uuid";
var InventoryService = class {
  static generateTransferNumber(fromBranch, toBranch) {
    const date = /* @__PURE__ */ new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const fromCode = fromBranch.split("-")[1]?.toUpperCase() || "XX";
    const toCode = toBranch.split("-")[1]?.toUpperCase() || "XX";
    const count = db.prepare(`SELECT COUNT(*) as count FROM inventory_transfers`).get();
    return `TRF-${fromCode}${toCode}-${dateStr}-${String(count.count + 1).padStart(4, "0")}`;
  }
  static createTransfer(data) {
    const id = uuidv45();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const transferNumber = this.generateTransferNumber(data.fromBranch, data.toBranch);
    const stmt = db.prepare(`
      INSERT INTO inventory_transfers (id, transfer_number, from_branch, to_branch, transfer_date, received_date, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      transferNumber,
      data.fromBranch,
      data.toBranch,
      data.transferDate || now,
      null,
      "pending",
      data.notes || null,
      now,
      now
    );
    return this.getTransferById(id);
  }
  static addTransferItem(transferId, productId, quantity) {
    const id = uuidv45();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = db.prepare(`
      INSERT INTO transfer_items (id, transfer_id, product_id, quantity, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, transferId, productId, quantity, now);
    return { id, transferId, productId, quantity, createdAt: now };
  }
  static getTransferById(id) {
    const stmt = db.prepare(`
      SELECT id, transfer_number as transferNumber, from_branch as fromBranch, to_branch as toBranch,
             transfer_date as transferDate, received_date as receivedDate, status, notes,
             created_at as createdAt, updated_at as updatedAt
      FROM inventory_transfers WHERE id = ?
    `);
    const transfer = stmt.get(id);
    if (!transfer) return null;
    const itemStmt = db.prepare(`
      SELECT id, transfer_id as transferId, product_id as productId, quantity, created_at as createdAt
      FROM transfer_items WHERE transfer_id = ?
    `);
    transfer.items = itemStmt.all(id);
    return transfer;
  }
  static getTransferByNumber(transferNumber) {
    const stmt = db.prepare(`SELECT id FROM inventory_transfers WHERE transfer_number = ?`);
    const result = stmt.get(transferNumber);
    return result ? this.getTransferById(result.id) : null;
  }
  static getPendingTransfers() {
    const stmt = db.prepare(`
      SELECT id, transfer_number as transferNumber, from_branch as fromBranch, to_branch as toBranch,
             transfer_date as transferDate, received_date as receivedDate, status, notes,
             created_at as createdAt, updated_at as updatedAt
      FROM inventory_transfers WHERE status IN ('pending', 'in_transit')
      ORDER BY transfer_date ASC
    `);
    return stmt.all();
  }
  static confirmTransfer(transferId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const transfer = this.getTransferById(transferId);
    if (!transfer) throw new Error("Transfer not found");
    const updateStmt = db.prepare(`UPDATE inventory_transfers SET status = 'received', received_date = ?, updated_at = ? WHERE id = ?`);
    updateStmt.run(now, now, transferId);
    if (transfer.items) {
      for (const item of transfer.items) {
        const fromProduct = ProductService.getById(item.productId);
        if (fromProduct) {
          ProductService.adjustStock(item.productId, -item.quantity, `Transfer out to ${transfer.toBranch}`);
          ProductService.adjustStock(item.productId, item.quantity, `Transfer in from ${transfer.fromBranch}`);
        }
      }
    }
    return this.getTransferById(transferId);
  }
  static getTransfersForBranch(branchId, direction) {
    const column = direction === "in" ? "to_branch" : "from_branch";
    const stmt = db.prepare(`
      SELECT id, transfer_number as transferNumber, from_branch as fromBranch, to_branch as toBranch,
             transfer_date as transferDate, received_date as receivedDate, status, notes,
             created_at as createdAt, updated_at as updatedAt
      FROM inventory_transfers WHERE ${column} = ?
      ORDER BY transfer_date DESC
    `);
    return stmt.all(branchId);
  }
};

// src/lib/services/PurchaseService.ts
import { v4 as uuidv46 } from "uuid";
var PurchaseService = class {
  static generatePurchaseNumber(branchId) {
    const date = /* @__PURE__ */ new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const branchCode = branchId.split("-")[1]?.toUpperCase() || "XX";
    const count = db.prepare(`SELECT COUNT(*) as count FROM purchases WHERE branch_id = ?`).get(branchId);
    return `PO-${branchCode}-${dateStr}-${String(count.count + 1).padStart(4, "0")}`;
  }
  static create(data) {
    const id = uuidv46();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const purchaseNumber = this.generatePurchaseNumber(data.branchId);
    const stmt = db.prepare(`
      INSERT INTO purchases (id, purchase_number, branch_id, supplier_id, purchase_date, expected_delivery, total_amount, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      purchaseNumber,
      data.branchId,
      data.supplierId || null,
      data.purchaseDate || now,
      data.expectedDelivery || null,
      data.totalAmount,
      "pending",
      data.notes || null,
      now,
      now
    );
    return this.getById(id);
  }
  static addItem(purchaseId, item) {
    const id = uuidv46();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = db.prepare(`
      INSERT INTO purchase_items (id, purchase_id, product_id, quantity, unit_price, line_total, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      purchaseId,
      item.productId || null,
      item.quantity,
      item.unitPrice,
      item.lineTotal || item.quantity * item.unitPrice,
      now
    );
    return { id, purchaseId, ...item, createdAt: now };
  }
  static getById(id) {
    const stmt = db.prepare(`
      SELECT id, purchase_number as purchaseNumber, branch_id as branchId, supplier_id as supplierId,
             purchase_date as purchaseDate, expected_delivery as expectedDelivery, actual_delivery as actualDelivery,
             total_amount as totalAmount, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM purchases WHERE id = ?
    `);
    const purchase = stmt.get(id);
    if (!purchase) return null;
    const itemStmt = db.prepare(`
      SELECT id, purchase_id as purchaseId, product_id as productId, quantity, unit_price as unitPrice,
             line_total as lineTotal, created_at as createdAt
      FROM purchase_items WHERE purchase_id = ?
    `);
    purchase.items = itemStmt.all(id);
    return purchase;
  }
  static getByPurchaseNumber(purchaseNumber) {
    const stmt = db.prepare(`SELECT id FROM purchases WHERE purchase_number = ?`);
    const result = stmt.get(purchaseNumber);
    return result ? this.getById(result.id) : null;
  }
  static getByBranch(branchId, status) {
    let query = `
      SELECT id, purchase_number as purchaseNumber, branch_id as branchId, supplier_id as supplierId,
             purchase_date as purchaseDate, expected_delivery as expectedDelivery, actual_delivery as actualDelivery,
             total_amount as totalAmount, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM purchases WHERE branch_id = ?
    `;
    const values = [branchId];
    if (status) {
      query += ` AND status = ?`;
      values.push(status);
    }
    query += ` ORDER BY purchase_date DESC`;
    const stmt = db.prepare(query);
    return stmt.all(...values);
  }
  static receivePurchase(purchaseId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const purchase = this.getById(purchaseId);
    if (!purchase) throw new Error("Purchase not found");
    const stmt = db.prepare(`UPDATE purchases SET status = 'received', actual_delivery = ?, updated_at = ? WHERE id = ?`);
    stmt.run(now, now, purchaseId);
    if (purchase.items) {
      for (const item of purchase.items) {
        if (item.productId) {
          ProductService.adjustStock(item.productId, item.quantity, `Received from purchase ${purchase.purchaseNumber}`);
        }
      }
    }
    return this.getById(purchaseId);
  }
  static getPendingPurchases() {
    const stmt = db.prepare(`
      SELECT id, purchase_number as purchaseNumber, branch_id as branchId, supplier_id as supplierId,
             purchase_date as purchaseDate, expected_delivery as expectedDelivery, actual_delivery as actualDelivery,
             total_amount as totalAmount, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM purchases WHERE status IN ('pending', 'ordered')
      ORDER BY purchase_date ASC
    `);
    return stmt.all();
  }
  static getOverduePurchases() {
    const stmt = db.prepare(`
      SELECT id, purchase_number as purchaseNumber, branch_id as branchId, supplier_id as supplierId,
             purchase_date as purchaseDate, expected_delivery as expectedDelivery, actual_delivery as actualDelivery,
             total_amount as totalAmount, status, notes, created_at as createdAt, updated_at as updatedAt
      FROM purchases WHERE expected_delivery < datetime('now') AND status != 'received'
      ORDER BY expected_delivery ASC
    `);
    return stmt.all();
  }
};

// src/lib/services/AccountingService.ts
import { v4 as uuidv47 } from "uuid";
var AccountingService = class {
  static recordExpense(data) {
    const id = uuidv47();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const stmt = db.prepare(`
      INSERT INTO expenses (id, branch_id, category, amount, description, expense_date, approved_by, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.branchId,
      data.category,
      data.amount,
      data.description || null,
      data.expenseDate || now,
      null,
      "pending",
      now
    );
    return this.getExpenseById(id);
  }
  static getExpenseById(id) {
    const stmt = db.prepare(`
      SELECT id, branch_id as branchId, category, amount, description, expense_date as expenseDate,
             approved_by as approvedBy, status, created_at as createdAt
      FROM expenses WHERE id = ?
    `);
    return stmt.get(id) || null;
  }
  static getExpensesByBranch(branchId, startDate, endDate) {
    let query = `
      SELECT id, branch_id as branchId, category, amount, description, expense_date as expenseDate,
             approved_by as approvedBy, status, created_at as createdAt
      FROM expenses WHERE branch_id = ?
    `;
    const values = [branchId];
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
    return stmt.all(...values);
  }
  static approveExpense(id, approvedBy) {
    const stmt = db.prepare(`UPDATE expenses SET status = 'approved', approved_by = ? WHERE id = ?`);
    stmt.run(approvedBy, id);
    return this.getExpenseById(id);
  }
  static rejectExpense(id) {
    const stmt = db.prepare(`UPDATE expenses SET status = 'rejected' WHERE id = ?`);
    stmt.run(id);
    return this.getExpenseById(id);
  }
  static getDailyReport(branchId, date) {
    const salesStmt = db.prepare(`
      SELECT SUM(total_amount) as total, COUNT(*) as count FROM sales
      WHERE branch_id = ? AND DATE(sale_date) = DATE(?)
    `);
    const salesData = salesStmt.get(branchId, date);
    const paymentStmt = db.prepare(`
      SELECT payment_method, SUM(total_amount) as total FROM sales
      WHERE branch_id = ? AND DATE(sale_date) = DATE(?)
      GROUP BY payment_method
    `);
    const paymentData = paymentStmt.all(branchId, date);
    const salesByPaymentMethod = {};
    paymentData.forEach((row) => {
      salesByPaymentMethod[row.payment_method] = row.total;
    });
    const expenseStmt = db.prepare(`
      SELECT category, SUM(amount) as total FROM expenses
      WHERE branch_id = ? AND DATE(expense_date) = DATE(?) AND status = 'approved'
      GROUP BY category
    `);
    const expenseData = expenseStmt.all(branchId, date);
    const expensesByCategory = {};
    let totalExpenses = 0;
    expenseData.forEach((row) => {
      expensesByCategory[row.category] = row.total;
      totalExpenses += row.total;
    });
    const totalRevenue = salesData.total || 0;
    const totalCogs = totalRevenue * 0.4;
    const netProfit = totalRevenue - totalExpenses - totalCogs;
    const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue * 100 : 0;
    return {
      period: date,
      totalRevenue,
      totalExpenses,
      totalCogs,
      netProfit,
      profitMargin,
      salesByPaymentMethod,
      expensesByCategory
    };
  }
  static getMonthlyReport(branchId, month, year) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, parseInt(month), 0).toISOString().split("T")[0];
    const salesStmt = db.prepare(`
      SELECT SUM(total_amount) as total FROM sales
      WHERE branch_id = ? AND sale_date >= ? AND sale_date <= ?
    `);
    const salesData = salesStmt.get(branchId, startDate, endDate);
    const paymentStmt = db.prepare(`
      SELECT payment_method, SUM(total_amount) as total FROM sales
      WHERE branch_id = ? AND sale_date >= ? AND sale_date <= ?
      GROUP BY payment_method
    `);
    const paymentData = paymentStmt.all(branchId, startDate, endDate);
    const salesByPaymentMethod = {};
    paymentData.forEach((row) => {
      salesByPaymentMethod[row.payment_method] = row.total;
    });
    const expenseStmt = db.prepare(`
      SELECT category, SUM(amount) as total FROM expenses
      WHERE branch_id = ? AND expense_date >= ? AND expense_date <= ? AND status = 'approved'
      GROUP BY category
    `);
    const expenseData = expenseStmt.all(branchId, startDate, endDate);
    const expensesByCategory = {};
    let totalExpenses = 0;
    expenseData.forEach((row) => {
      expensesByCategory[row.category] = row.total;
      totalExpenses += row.total;
    });
    const totalRevenue = salesData.total || 0;
    const totalCogs = totalRevenue * 0.4;
    const netProfit = totalRevenue - totalExpenses - totalCogs;
    const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue * 100 : 0;
    return {
      period: `${year}-${String(month).padStart(2, "0")}`,
      totalRevenue,
      totalExpenses,
      totalCogs,
      netProfit,
      profitMargin,
      salesByPaymentMethod,
      expensesByCategory
    };
  }
  static getPendingExpenseApprovals(limit = 20) {
    const stmt = db.prepare(`
      SELECT id, branch_id as branchId, category, amount, description, expense_date as expenseDate,
             approved_by as approvedBy, status, created_at as createdAt
      FROM expenses WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT ?
    `);
    return stmt.all(limit);
  }
};

// src/lib/services/IMEIService.ts
import { v4 as uuidv48 } from "uuid";
var IMEIService = class {
  static register(data) {
    const id = uuidv48();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const existing = db.prepare(`SELECT id FROM imei_tracking WHERE imei = ?`).get(data.imei);
    if (existing) throw new Error("IMEI already registered");
    const stmt = db.prepare(`
      INSERT INTO imei_tracking (id, imei, product_id, serial_number, status, purchase_date, sale_date, customer_id, supplier_id, branch_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.imei,
      data.productId,
      data.serialNumber || null,
      data.status || "stock",
      data.purchaseDate || null,
      data.saleDate || null,
      data.customerId || null,
      data.supplierId || null,
      data.branchId,
      now,
      now
    );
    return this.getById(id);
  }
  static getById(id) {
    const stmt = db.prepare(`
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE id = ?
    `);
    return stmt.get(id) || null;
  }
  static getByIMEI(imei) {
    const stmt = db.prepare(`
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE imei = ?
    `);
    return stmt.get(imei) || null;
  }
  static updateStatus(imei, status, updates) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const record = this.getByIMEI(imei);
    if (!record) throw new Error("IMEI not found");
    let query = `UPDATE imei_tracking SET status = ?, updated_at = ?`;
    const values = [status, now];
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
    return this.getByIMEI(imei);
  }
  static getByProduct(productId) {
    const stmt = db.prepare(`
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE product_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(productId);
  }
  static getByBranch(branchId, status) {
    let query = `
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE branch_id = ?
    `;
    const values = [branchId];
    if (status) {
      query += ` AND status = ?`;
      values.push(status);
    }
    query += ` ORDER BY created_at DESC`;
    const stmt = db.prepare(query);
    return values.length > 1 ? stmt.all(...values) : stmt.all(branchId);
  }
  static getByCustomer(customerId) {
    const stmt = db.prepare(`
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE customer_id = ?
      ORDER BY sale_date DESC
    `);
    return stmt.all(customerId);
  }
  static getStockByProduct(productId) {
    const stmt = db.prepare(`
      SELECT id, imei, product_id as productId, serial_number as serialNumber, status, purchase_date as purchaseDate,
             sale_date as saleDate, customer_id as customerId, supplier_id as supplierId, branch_id as branchId,
             created_at as createdAt, updated_at as updatedAt
      FROM imei_tracking WHERE product_id = ? AND status = 'stock'
    `);
    return stmt.all(productId);
  }
  static trackWarranty(imei) {
    const record = this.getByIMEI(imei);
    if (!record || !record.saleDate) return { warrantyStatus: "no_warranty", claimable: false };
    const saleDate = new Date(record.saleDate);
    const expiryDate = new Date(saleDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const now = /* @__PURE__ */ new Date();
    const isUnderWarranty = now <= expiryDate;
    return {
      warrantyStatus: isUnderWarranty ? "active" : "expired",
      expiryDate: expiryDate.toISOString(),
      claimable: isUnderWarranty && (record.status === "in_repair" || record.status === "warranty")
    };
  }
};

// src/lib/api-routes.ts
function setupDatabaseRoutes(app2) {
  app2.get("/api/products", (req, res) => {
    try {
      const products2 = ProductService.getAll();
      res.json(products2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/products", (req, res) => {
    try {
      const { sku, name, categoryId, brandId, modelId, description, costPrice, sellingPrice, stockQuantity, minStock, maxStock, unit } = req.body;
      const product = ProductService.create({
        sku,
        name,
        categoryId,
        brandId,
        modelId,
        description,
        costPrice,
        sellingPrice,
        stockQuantity,
        minStock,
        maxStock,
        unit
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/products/:id", (req, res) => {
    try {
      const product = ProductService.getById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/products/:id", (req, res) => {
    try {
      const product = ProductService.update(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/products/:id/adjust-stock", (req, res) => {
    try {
      const { quantity, reason } = req.body;
      const product = ProductService.adjustStock(req.params.id, quantity, reason);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/products/low-stock", (req, res) => {
    try {
      const products2 = ProductService.getLowStockProducts();
      res.json(products2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/sales", (req, res) => {
    try {
      const { branchId, cashierId, customerId, saleDate, totalAmount, subtotal, taxAmount, discountAmount, paymentMethod, items, notes } = req.body;
      const sale = SalesService.create({ branchId, cashierId, customerId, saleDate, totalAmount, subtotal, taxAmount, discountAmount, paymentMethod, notes });
      if (items && Array.isArray(items)) {
        for (const item of items) {
          SalesService.addItem(sale.id, item);
        }
      }
      res.status(201).json(SalesService.getById(sale.id));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/sales/:id", (req, res) => {
    try {
      const sale = SalesService.getById(req.params.id);
      if (!sale) return res.status(404).json({ error: "Sale not found" });
      res.json(sale);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/sales/branch/:branchId", (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const sales = SalesService.getByBranch(req.params.branchId, startDate, endDate);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/sales/daily/:branchId/:date", (req, res) => {
    try {
      const report = SalesService.calculateDailySales(req.params.branchId, req.params.date);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/repairs", (req, res) => {
    try {
      const repair = RepairService.create(req.body);
      res.status(201).json(repair);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/repairs/:id", (req, res) => {
    try {
      const repair = RepairService.getById(req.params.id);
      if (!repair) return res.status(404).json({ error: "Repair not found" });
      res.json(repair);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/repairs/branch/:branchId", (req, res) => {
    try {
      const { status } = req.query;
      const repairs = RepairService.getByBranch(req.params.branchId, status);
      res.json(repairs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/repairs/:id/status", (req, res) => {
    try {
      const { status, notes } = req.body;
      const repair = RepairService.updateStatus(req.params.id, status, notes);
      res.json(repair);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/repairs/:id/service", (req, res) => {
    try {
      const { serviceName, cost } = req.body;
      const service = RepairService.addService(req.params.id, serviceName, cost);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/repairs/pending", (req, res) => {
    try {
      const repairs = RepairService.getPendingRepairs();
      res.json(repairs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/customers", (req, res) => {
    try {
      const customer = CustomerService.create(req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/customers/:id", (req, res) => {
    try {
      const customer = CustomerService.getById(req.params.id);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/customers", (req, res) => {
    try {
      const customers2 = CustomerService.getAll();
      res.json(customers2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/customers/:id", (req, res) => {
    try {
      const customer = CustomerService.update(req.params.id, req.body);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/customers/:id/loyalty/:points", (req, res) => {
    try {
      const customer = CustomerService.addLoyaltyPoints(req.params.id, parseInt(req.params.points));
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/customers/search/:name", (req, res) => {
    try {
      const customers2 = CustomerService.searchByName(req.params.name);
      res.json(customers2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/customers/phone/:phone", (req, res) => {
    try {
      const customer = CustomerService.searchByPhone(req.params.phone);
      if (!customer) return res.status(404).json({ error: "Customer not found" });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/transfers", (req, res) => {
    try {
      const transfer = InventoryService.createTransfer(req.body);
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          InventoryService.addTransferItem(transfer.id, item.productId, item.quantity);
        }
      }
      res.status(201).json(InventoryService.getTransferById(transfer.id));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/transfers/:id", (req, res) => {
    try {
      const transfer = InventoryService.getTransferById(req.params.id);
      if (!transfer) return res.status(404).json({ error: "Transfer not found" });
      res.json(transfer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/transfers/pending", (req, res) => {
    try {
      const transfers = InventoryService.getPendingTransfers();
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/transfers/:id/confirm", (req, res) => {
    try {
      const transfer = InventoryService.confirmTransfer(req.params.id);
      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/purchases", (req, res) => {
    try {
      const purchase = PurchaseService.create(req.body);
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          PurchaseService.addItem(purchase.id, item);
        }
      }
      res.status(201).json(PurchaseService.getById(purchase.id));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/purchases/:id", (req, res) => {
    try {
      const purchase = PurchaseService.getById(req.params.id);
      if (!purchase) return res.status(404).json({ error: "Purchase not found" });
      res.json(purchase);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/purchases/:id/receive", (req, res) => {
    try {
      const purchase = PurchaseService.receivePurchase(req.params.id);
      res.json(purchase);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/purchases/pending", (req, res) => {
    try {
      const purchases = PurchaseService.getPendingPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/expenses", (req, res) => {
    try {
      const expense = AccountingService.recordExpense(req.body);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/expenses/branch/:branchId", (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const expenses2 = AccountingService.getExpensesByBranch(req.params.branchId, startDate, endDate);
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/reports/daily/:branchId/:date", (req, res) => {
    try {
      const report = AccountingService.getDailyReport(req.params.branchId, req.params.date);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/reports/monthly/:branchId/:month/:year", (req, res) => {
    try {
      const report = AccountingService.getMonthlyReport(req.params.branchId, req.params.month, parseInt(req.params.year));
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/imei/register", (req, res) => {
    try {
      const record = IMEIService.register(req.body);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/imei/:imei", (req, res) => {
    try {
      const record = IMEIService.getByIMEI(req.params.imei);
      if (!record) return res.status(404).json({ error: "IMEI not found" });
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/imei/:imei/status", (req, res) => {
    try {
      const { status, saleDate, customerId, supplierId } = req.body;
      const record = IMEIService.updateStatus(req.params.imei, status, { saleDate, customerId, supplierId });
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/imei/:imei/warranty", (req, res) => {
    try {
      const warranty = IMEIService.trackWarranty(req.params.imei);
      res.json(warranty);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// server.ts
dotenv.config();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
initializeDatabase();
var app = express();
app.use(express.json());
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var branches = [
  { id: "b-yangon", name: "Yangon HQ (Kaba Aye Pagoda Rd)", city: "Yangon", manager: "U Kyaw Swar", phone: "09777123456" },
  { id: "b-mandalay", name: "Mandalay Branch (73rd St)", city: "Mandalay", manager: "Daw Hla Hla", phone: "09511223344" },
  { id: "b-naypyitaw", name: "Naypyitaw Store (Thiri Mandalar)", city: "Naypyitaw", manager: "U Aung Ko", phone: "09444555666" }
];
var products = [
  {
    id: "phone-001",
    name: "Galaxy S26 Ultra",
    brand: "Samsung",
    price: 36e5,
    originalPrice: 38e5,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
    specs: {
      screen: '6.8" Dynamic AMOLED 2X, 120Hz',
      processor: "Snapdragon 8 Gen 5",
      ram: "16GB LPDDR5X",
      storage: "512GB UFS 4.0",
      battery: "5000mAh with 45W charging",
      camera: "200MP Main + 50MP Periscope + 12MP Ultra-wide"
    },
    colors: ["Titanium Gray", "Titanium Black", "Titanium Violet"],
    rating: 4.9,
    reviewsCount: 128,
    badge: "Flagship Choice",
    category: "Phone"
  },
  {
    id: "phone-002",
    name: "iPhone 17 Pro Max",
    brand: "Apple",
    price: 39e5,
    originalPrice: 41e5,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
    specs: {
      screen: '6.9" Super Retina XDR OLED, ProMotion',
      processor: "Apple A19 Pro (3nm)",
      ram: "12GB unified memory",
      storage: "256GB NVMe",
      battery: "4852mAh with MagSafe wireless",
      camera: "48MP Fusion + 48MP Telephoto + 48MP Ultra-wide"
    },
    colors: ["Desert Titanium", "Natural Titanium", "Space Black"],
    rating: 4.8,
    reviewsCount: 245,
    badge: "Popular",
    category: "Phone"
  },
  {
    id: "phone-003",
    name: "Pixel 10 Pro",
    brand: "Google",
    price: 3e6,
    originalPrice: 31e5,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    specs: {
      screen: '6.7" Super Actua Display, 120Hz',
      processor: "Google Tensor G5 (with AI Coprocessor)",
      ram: "16GB LPDDR5X",
      storage: "256GB UFS 4.0",
      battery: "5060mAh with AI smart saving",
      camera: "50MP Octa PD Main + 48MP Zoom + 48MP Wide"
    },
    colors: ["Obsidian Black", "Porcelain White", "Hazel Gray"],
    rating: 4.7,
    reviewsCount: 92,
    badge: "Pure AI Phone",
    category: "Phone"
  },
  {
    id: "phone-004",
    name: "OnePlus 13 5G",
    brand: "OnePlus",
    price: 22e5,
    originalPrice: 24e5,
    image: "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&w=600&q=80",
    specs: {
      screen: '6.82" 2K Oriental AMOLED, 120Hz',
      processor: "Snapdragon 8 Gen 4",
      ram: "16GB",
      storage: "256GB",
      battery: "6000mAh with 100W SuperVOOC",
      camera: "50MP Sony Lythia Main + 50MP Periscope + 50MP Wide"
    },
    colors: ["Glacier White", "Silk Black", "Sage Green"],
    rating: 4.6,
    reviewsCount: 67,
    badge: "Value Killer",
    category: "Phone"
  },
  {
    id: "phone-005",
    name: "Redmi Note 15 Pro+",
    brand: "Xiaomi",
    price: 12e5,
    originalPrice: 135e4,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    specs: {
      screen: '6.67" CrystalRes AMOLED, 120Hz',
      processor: "Dimensity 7400-Ultra",
      ram: "12GB",
      storage: "256GB",
      battery: "5100mAh with 120W HyperCharge",
      camera: "200MP Main + 8MP Ultra-wide + 2MP Macro"
    },
    colors: ["Aurora Purple", "Midnight Black", "Forest Blue"],
    rating: 4.5,
    reviewsCount: 156,
    badge: "Best Budget",
    category: "Phone"
  },
  {
    id: "acc-001",
    name: "AKK Premium Powerbank 20,000mAh",
    brand: "AKK",
    price: 9e4,
    originalPrice: 11e4,
    image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=600&q=80",
    specs: {
      screen: "N/A",
      processor: "N/A",
      ram: "N/A",
      storage: "20,000mAh Power Capacity",
      battery: "Li-Polymer 22.5W QC PD",
      camera: "N/A"
    },
    colors: ["Charcoal Black", "Arctic White"],
    rating: 4.7,
    reviewsCount: 88,
    badge: "Local Best Seller",
    category: "Accessories"
  },
  {
    id: "acc-002",
    name: "Silicon Protective Armor Case",
    brand: "AKK",
    price: 25e3,
    originalPrice: 35e3,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
    specs: {
      screen: "Shock-proof edges",
      processor: "TPU Silicon Material",
      ram: "N/A",
      storage: "Military-Grade Certified",
      battery: "N/A",
      camera: "Lens slide protection"
    },
    colors: ["Clear Matte", "Space Blue", "Tactical Green"],
    rating: 4.5,
    reviewsCount: 112,
    badge: "Top Protection",
    category: "Accessories"
  },
  {
    id: "parts-001",
    name: "OEM OLED Replacement Screen - iPhone 15",
    brand: "Apple-OEM",
    price: 45e4,
    originalPrice: 5e5,
    image: "https://images.unsplash.com/photo-1597740985671-2a8a3b80f02e?auto=format&fit=crop&w=600&q=80",
    specs: {
      screen: '6.1" OLED Retina Grade',
      processor: "Multi-touch calibrated",
      ram: "N/A",
      storage: "OEM glass hardness",
      battery: "N/A",
      camera: "Dynamic Island fully compatible"
    },
    colors: ["Black"],
    rating: 4.9,
    reviewsCount: 34,
    badge: "Service Lab Certified",
    category: "Repair Parts"
  }
];
var branchInventories = [
  // Yangon HQ
  { branchId: "b-yangon", productId: "phone-001", stock: 15, minAlertThreshold: 5 },
  { branchId: "b-yangon", productId: "phone-002", stock: 18, minAlertThreshold: 5 },
  { branchId: "b-yangon", productId: "phone-003", stock: 10, minAlertThreshold: 3 },
  { branchId: "b-yangon", productId: "phone-004", stock: 25, minAlertThreshold: 5 },
  { branchId: "b-yangon", productId: "phone-005", stock: 35, minAlertThreshold: 8 },
  { branchId: "b-yangon", productId: "acc-001", stock: 80, minAlertThreshold: 15 },
  { branchId: "b-yangon", productId: "acc-002", stock: 120, minAlertThreshold: 20 },
  { branchId: "b-yangon", productId: "parts-001", stock: 14, minAlertThreshold: 3 },
  // Mandalay Branch
  { branchId: "b-mandalay", productId: "phone-001", stock: 6, minAlertThreshold: 3 },
  { branchId: "b-mandalay", productId: "phone-002", stock: 4, minAlertThreshold: 4 },
  { branchId: "b-mandalay", productId: "phone-003", stock: 12, minAlertThreshold: 3 },
  { branchId: "b-mandalay", productId: "phone-004", stock: 8, minAlertThreshold: 3 },
  { branchId: "b-mandalay", productId: "phone-005", stock: 20, minAlertThreshold: 6 },
  { branchId: "b-mandalay", productId: "acc-001", stock: 40, minAlertThreshold: 10 },
  { branchId: "b-mandalay", productId: "acc-002", stock: 55, minAlertThreshold: 10 },
  { branchId: "b-mandalay", productId: "parts-001", stock: 5, minAlertThreshold: 2 },
  // Naypyitaw Store
  { branchId: "b-naypyitaw", productId: "phone-001", stock: 2, minAlertThreshold: 3 },
  // triggers low stock!
  { branchId: "b-naypyitaw", productId: "phone-002", stock: 7, minAlertThreshold: 3 },
  { branchId: "b-naypyitaw", productId: "phone-003", stock: 1, minAlertThreshold: 3 },
  // triggers low stock!
  { branchId: "b-naypyitaw", productId: "phone-004", stock: 15, minAlertThreshold: 4 },
  { branchId: "b-naypyitaw", productId: "phone-005", stock: 10, minAlertThreshold: 5 },
  { branchId: "b-naypyitaw", productId: "acc-001", stock: 15, minAlertThreshold: 10 },
  { branchId: "b-naypyitaw", productId: "acc-002", stock: 20, minAlertThreshold: 10 },
  { branchId: "b-naypyitaw", productId: "parts-001", stock: 1, minAlertThreshold: 2 }
  // triggers low stock!
];
var customers = [
  { id: "c-1", name: "Ko Min Thuta", phone: "09799112233", email: "minthuta@gmail.com", facebook: "MinThuta.AKK", tier: "Gold", loyaltyPoints: 4500, totalSpent: 124e5, creditBalance: 0, createdAt: new Date(Date.now() - 36e5 * 240).toISOString() },
  { id: "c-2", name: "Ma Thandar Myint", phone: "09450887766", email: "thandar.m@gmail.com", telegram: "@thandarmyint", tier: "Silver", loyaltyPoints: 2200, totalSpent: 75e5, creditBalance: 2e5, createdAt: new Date(Date.now() - 36e5 * 180).toISOString() },
  { id: "c-3", name: "Dr. Aung Kyaw", phone: "095012345", email: "aungkyaw.doc@naypyitaw.gov.mm", telegram: "@draungkyaw", tier: "VIP", loyaltyPoints: 9500, totalSpent: 228e5, creditBalance: 0, createdAt: new Date(Date.now() - 36e5 * 320).toISOString() },
  { id: "c-4", name: "Ko Chit Ko Ko", phone: "09252334455", email: "chitkoko@gmail.com", facebook: "KoChit.Retail", tier: "Bronze", loyaltyPoints: 800, totalSpent: 18e5, creditBalance: 0, createdAt: new Date(Date.now() - 36e5 * 50).toISOString() }
];
var repairTickets = [
  {
    id: "REP-9482",
    branchId: "b-yangon",
    customerName: "Ko Min Thuta",
    customerPhone: "09799112233",
    deviceBrand: "Apple",
    deviceModel: "iPhone 15 Pro",
    issueDescription: "Shattered front panel, flickering bottom screen, touch unresponsive.",
    status: "repairing",
    estimatedCost: 48e4,
    partsUsed: ["OEM OLED Replacement Screen - iPhone 15"],
    createdAt: new Date(Date.now() - 36e5 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 36e5 * 4).toISOString(),
    assignedTechnician: "U Hla Tun (Senior Tech)",
    technicianNotes: "Removed shattered assembly. Preparing new Apple OEM Display panel for full adhesive seal & TrueTone re-flashing.",
    warrantyMonths: 6
  },
  {
    id: "REP-1029",
    branchId: "b-mandalay",
    customerName: "Ma Thandar Myint",
    customerPhone: "09450887766",
    deviceBrand: "Samsung",
    deviceModel: "Galaxy S23 Ultra",
    issueDescription: "Battery thermal bloat, dropping from 80% to dead within minutes.",
    status: "testing",
    estimatedCost: 11e4,
    partsUsed: ["Samsung High-Cap Battery Cell"],
    createdAt: new Date(Date.now() - 36e5 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 36e5 * 1).toISOString(),
    assignedTechnician: "Ko Nay Lin (Tech)",
    technicianNotes: "Fitted replacement battery unit. Running charging stress cycle to test thermal thresholds. No signs of motherboard leaks.",
    warrantyMonths: 3
  },
  {
    id: "REP-3841",
    branchId: "b-naypyitaw",
    customerName: "Ko Chit Ko Ko",
    customerPhone: "09252334455",
    deviceBrand: "Google",
    deviceModel: "Pixel 8 Pro",
    issueDescription: "Rear telephoto lens glass shattered, dust inside camera module.",
    status: "ready",
    estimatedCost: 15e4,
    partsUsed: ["Google Pixel 8 Rear Lens Unit"],
    createdAt: new Date(Date.now() - 36e5 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 36e5 * 12).toISOString(),
    assignedTechnician: "U Aung Ko (Manager/Tech)",
    technicianNotes: "Cleaned internal imaging sensors in clean room environment. Fitted new crystal telephoto outer lens glass. Calibrated focal length successfully.",
    warrantyMonths: 12
  }
];
var posSales = [
  {
    id: "SAL-10021",
    branchId: "b-yangon",
    customerName: "Ma Thandar Myint",
    customerPhone: "09450887766",
    items: [
      { productId: "phone-002", name: "iPhone 17 Pro Max", price: 39e5, color: "Desert Titanium", quantity: 1, imei: "358912345678901" },
      { productId: "acc-001", name: "AKK Premium Powerbank 20,000mAh", price: 9e4, color: "Charcoal Black", quantity: 1 }
    ],
    taxAmount: 199500,
    discountAmount: 5e4,
    totalAmount: 4139500,
    paymentMethod: "kbzpay",
    cashierName: "Daw Su Su",
    createdAt: new Date(Date.now() - 36e5 * 6).toISOString()
  },
  {
    id: "SAL-10022",
    branchId: "b-mandalay",
    customerName: "Ko Chit Ko Ko",
    customerPhone: "09252334455",
    items: [
      { productId: "phone-004", name: "OnePlus 13 5G", price: 22e5, color: "Glacier White", quantity: 1, imei: "862045612345678" }
    ],
    taxAmount: 11e4,
    discountAmount: 0,
    totalAmount: 231e4,
    paymentMethod: "wavepay",
    cashierName: "Ko Thura",
    createdAt: new Date(Date.now() - 36e5 * 15).toISOString()
  },
  {
    id: "SAL-10023",
    branchId: "b-naypyitaw",
    customerName: "Walk-In Customer",
    customerPhone: "N/A",
    items: [
      { productId: "phone-005", name: "Redmi Note 15 Pro+", price: 12e5, color: "Forest Blue", quantity: 2, imei: "860124578125479,860124578125480" }
    ],
    taxAmount: 12e4,
    discountAmount: 1e4,
    totalAmount: 251e4,
    paymentMethod: "cash",
    cashierName: "Ma Khin Hnin",
    createdAt: new Date(Date.now() - 36e5 * 22).toISOString()
  }
];
var stockTransfers = [
  {
    id: "TRF-3001",
    productId: "phone-001",
    productName: "Galaxy S26 Ultra",
    fromBranchId: "b-yangon",
    toBranchId: "b-naypyitaw",
    quantity: 3,
    status: "delivered",
    requestedBy: "U Aung Ko",
    createdAt: new Date(Date.now() - 36e5 * 96).toISOString()
  },
  {
    id: "TRF-3002",
    productId: "phone-002",
    productName: "iPhone 17 Pro Max",
    fromBranchId: "b-yangon",
    toBranchId: "b-mandalay",
    quantity: 4,
    status: "shipped",
    requestedBy: "Daw Hla Hla",
    createdAt: new Date(Date.now() - 36e5 * 24).toISOString()
  }
];
var eLoadTransactions = [
  { id: "VTU-58291", type: "data", operator: "MPT", phoneNumber: "09777123456", amount: 8e3, planDetails: "MPT 10GB 30-Day Super Data", status: "completed", branchId: "b-yangon", createdAt: new Date(Date.now() - 36e5 * 3).toISOString() },
  { id: "VTU-48201", type: "airtime", operator: "Atom", phoneNumber: "09450887766", amount: 5e3, planDetails: "Atom 5000 Kyat Refill", status: "completed", branchId: "b-mandalay", createdAt: new Date(Date.now() - 36e5 * 8).toISOString() }
];
var expenses = [
  { id: "EXP-101", branchId: "b-yangon", category: "Rent", amount: 8e5, description: "Kaba Aye Showroom monthly rental fee", date: new Date(Date.now() - 36e5 * 120).toISOString() },
  { id: "EXP-102", branchId: "b-mandalay", category: "Utilities", amount: 15e4, description: "Power grid & backup generator diesel", date: new Date(Date.now() - 36e5 * 90).toISOString() },
  { id: "EXP-103", branchId: "b-naypyitaw", category: "Marketing", amount: 25e4, description: "Naypyitaw local Facebook Page promotion boost", date: new Date(Date.now() - 36e5 * 48).toISOString() }
];
var employees = [
  { id: "emp-001", name: "U Kyaw Swar", role: "Branch Manager", branchId: "b-yangon", phone: "09777123456", attendanceStatus: "checked_in", attendanceTime: "08:15 AM", salesTarget: 15e6, currentSales: 115e5, commissionRate: 0.015 },
  { id: "emp-002", name: "Daw Su Su", role: "Cashier", branchId: "b-yangon", phone: "0979111222", attendanceStatus: "checked_in", attendanceTime: "08:00 AM", salesTarget: 5e6, currentSales: 4139500, commissionRate: 5e-3 },
  { id: "emp-003", name: "U Hla Tun", role: "Technician", branchId: "b-yangon", phone: "0978222333", attendanceStatus: "checked_in", attendanceTime: "08:30 AM", salesTarget: 2e6, currentSales: 48e4, commissionRate: 0.05 },
  { id: "emp-004", name: "Daw Hla Hla", role: "Branch Manager", branchId: "b-mandalay", phone: "09511223344", attendanceStatus: "checked_out", salesTarget: 12e6, currentSales: 75e5, commissionRate: 0.015 },
  { id: "emp-005", name: "Ko Thura", role: "Cashier", branchId: "b-mandalay", phone: "0950333444", attendanceStatus: "checked_in", attendanceTime: "08:05 AM", salesTarget: 4e6, currentSales: 231e4, commissionRate: 5e-3 },
  { id: "emp-006", name: "U Aung Ko", role: "Branch Manager", branchId: "b-naypyitaw", phone: "09444555666", attendanceStatus: "checked_in", attendanceTime: "07:45 AM", salesTarget: 1e7, currentSales: 251e4, commissionRate: 0.02 }
];
var chartOfAccounts = [
  { code: "1010", name: "Cash on Hand (POS Drawer)", category: "Asset", balance: 145e4 },
  { code: "1020", name: "KBZPay Business Account", category: "Asset", balance: 845e4 },
  { code: "1030", name: "WavePay Business Account", category: "Asset", balance: 52e5 },
  { code: "1200", name: "Inventory Asset Ledger", category: "Asset", balance: 135e6 },
  { code: "2100", name: "Accounts Payable (Suppliers)", category: "Liability", balance: 12e6 },
  { code: "3000", name: "AKK Mobile Owner Capital", category: "Equity", balance: 13e7 },
  { code: "4000", name: "Retail Handset Sales Revenue", category: "Revenue", balance: 8959500 },
  { code: "4100", name: "Repair Service Income", category: "Revenue", balance: 74e4 },
  { code: "5000", name: "Cost of Goods Sold (COGS)", category: "Expense", balance: 71e5 },
  { code: "5100", name: "Branch Rent Expense", category: "Expense", balance: 8e5 },
  { code: "5200", name: "Utilities & Diesel Expense", category: "Expense", balance: 15e4 },
  { code: "5300", name: "Marketing & Promos Expense", category: "Expense", balance: 25e4 }
];
var dailyClosings = [
  { id: "CLS-001", branchId: "b-yangon", closingDate: new Date(Date.now() - 36e5 * 24).toISOString().split("T")[0], cashSales: 45e4, kPaySales: 245e4, wavePaySales: 12e5, otherDigitalSales: 5e5, totalSales: 46e5, expenseAmount: 8e4, drawerDifference: 0, closedBy: "Daw Su Su", status: "audited" }
];
var integrationSettings = {
  telegramBotToken: "739482015:AAH_fG40b2-u8q5_kMh1lZp608q",
  telegramChatId: "-100204918231",
  webhookUrl: "https://api.externalpartner.com/v1/pos-webhooks",
  webhookAuthToken: "bearer_sec_tkn_8492041285102",
  supabaseUrl: "https://kkmgkti67zhhq6zrc2gngs.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbWdrdGk2N3poaHF6cmMyZ25ncyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjc4OTI4NDAwLCJleHAiOjIwOTQ1MDQ0MDB9.someSignatureKey",
  smsGatewayKey: "sms_live_api_8390159182049182042",
  vtuMerchantId: "vtu_merch_94821",
  vtuSecretKey: "vtu_sec_key_948291048201"
};
var onlineOrders = [
  { id: "ONL-201", customerName: "Ma Moe Moe", customerPhone: "09798765432", address: "Bahan Township, Yangon", items: [{ productId: "phone-005", name: "Redmi Note 15 Pro+", price: 12e5, quantity: 1 }], totalAmount: 12e5, orderType: "delivery", status: "pending", createdAt: new Date(Date.now() - 36e5 * 2).toISOString() },
  { id: "ONL-202", customerName: "Ko Aung Phyo", customerPhone: "09420112233", address: "Mandalay, Near Palace Wall", items: [{ productId: "acc-001", name: "AKK Premium Powerbank 20,000mAh", price: 9e4, quantity: 2 }], totalAmount: 18e4, orderType: "pickup", status: "accepted", createdAt: new Date(Date.now() - 36e5 * 5).toISOString() }
];
var notificationLogs = [
  { id: "NOT-1001", channel: "Telegram", recipient: "@draungkyaw", message: "Hello VIP Customer! Your repair ticket REP-3841 is completed and ready for pickup at our Naypyitaw Branch. Thank you!", sentAt: new Date(Date.now() - 36e5 * 12).toISOString() },
  { id: "NOT-1002", channel: "SMS", recipient: "09450887766", message: "AKK Mobile: Your payment of 4,139,500 MMK via KBZPay was successfully processed. Points earned: 41,395.", sentAt: new Date(Date.now() - 36e5 * 6).toISOString() }
];
app.get("/api/branches", (req, res) => {
  res.json(branches);
});
app.get("/api/products", (req, res) => {
  res.json(products);
});
app.post("/api/products", (req, res) => {
  const { name, brand, price, originalPrice, category, colors, specs } = req.body;
  if (!name || !brand || !price) {
    return res.status(400).json({ error: "Name, brand, and price are required." });
  }
  const newId = `phone-${Math.floor(100 + Math.random() * 900)}`;
  const newProduct = {
    id: newId,
    name,
    brand,
    price: Number(price),
    originalPrice: Number(originalPrice || price),
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    specs: specs || {
      screen: '6.7" Super Retina Screen',
      processor: "High-speed Multi-core Chip",
      ram: "8GB RAM",
      storage: "256GB Storage",
      battery: "5000mAh Battery Power",
      camera: "50MP Professional Lens"
    },
    colors: colors && colors.length ? colors : ["Black", "Silver", "Gold"],
    rating: 5,
    reviewsCount: 1,
    badge: "New Arrival",
    category: category || "Phone"
  };
  products.push(newProduct);
  branches.forEach((b) => {
    branchInventories.push({
      branchId: b.id,
      productId: newId,
      stock: 0,
      minAlertThreshold: 3
    });
  });
  res.status(201).json(newProduct);
});
app.get("/api/products/:id", (req, res) => {
  const prod = products.find((p) => p.id === req.params.id);
  if (prod) {
    res.json(prod);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});
app.get("/api/inventory", (req, res) => {
  const joinedInventory = branchInventories.map((inv) => {
    const product = products.find((p) => p.id === inv.productId);
    const branch = branches.find((b) => b.id === inv.branchId);
    return {
      ...inv,
      productName: product?.name || "Unknown Handset",
      productBrand: product?.brand || "Unknown",
      productPrice: product?.price || 0,
      productImage: product?.image || "",
      branchName: branch?.name || "Unknown Branch"
    };
  });
  res.json(joinedInventory);
});
app.post("/api/inventory", (req, res) => {
  const { branchId, productId, stock, minAlertThreshold } = req.body;
  if (!branchId || !productId) {
    return res.status(400).json({ error: "branchId and productId are required." });
  }
  let item = branchInventories.find((i) => i.branchId === branchId && i.productId === productId);
  if (item) {
    if (stock !== void 0) {
      item.stock = Number(stock);
    }
    if (minAlertThreshold !== void 0) {
      item.minAlertThreshold = Number(minAlertThreshold);
    }
  } else {
    item = {
      branchId,
      productId,
      stock: stock !== void 0 ? Number(stock) : 0,
      minAlertThreshold: minAlertThreshold !== void 0 ? Number(minAlertThreshold) : 3
    };
    branchInventories.push(item);
  }
  res.status(200).json(item);
});
app.put("/api/inventory/threshold", (req, res) => {
  const { branchId, productId, threshold } = req.body;
  const item = branchInventories.find((i) => i.branchId === branchId && i.productId === productId);
  if (item) {
    item.minAlertThreshold = Number(threshold);
    return res.json({ success: true, item });
  }
  res.status(404).json({ error: "Inventory record not found" });
});
app.get("/api/transfers", (req, res) => {
  const enrichedTransfers = stockTransfers.map((trsf) => {
    const fromBranchName = branches.find((b) => b.id === trsf.fromBranchId)?.name || "Unknown";
    const toBranchName = branches.find((b) => b.id === trsf.toBranchId)?.name || "Unknown";
    return {
      ...trsf,
      fromBranchName,
      toBranchName
    };
  });
  res.json(enrichedTransfers);
});
app.post("/api/transfers", (req, res) => {
  const { productId, fromBranchId, toBranchId, quantity, requestedBy } = req.body;
  if (!productId || !fromBranchId || !toBranchId || !quantity) {
    return res.status(400).json({ error: "Missing transfer request metrics" });
  }
  const sourceInv = branchInventories.find((i) => i.branchId === fromBranchId && i.productId === productId);
  if (!sourceInv || sourceInv.stock < Number(quantity)) {
    return res.status(400).json({ error: "Insufficient stock at source branch" });
  }
  const prod = products.find((p) => p.id === productId);
  const newTransfer = {
    id: `TRF-${Math.floor(1e3 + Math.random() * 9e3)}`,
    productId,
    productName: prod?.name || "Unknown Handset",
    fromBranchId,
    toBranchId,
    quantity: Number(quantity),
    status: "pending",
    requestedBy: requestedBy || "Manager",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  stockTransfers.unshift(newTransfer);
  res.status(201).json(newTransfer);
});
app.put("/api/transfers/:id", (req, res) => {
  const { status } = req.body;
  const transfer = stockTransfers.find((t) => t.id === req.params.id);
  if (!transfer) {
    return res.status(404).json({ error: "Transfer not found" });
  }
  if (status === "shipped" && transfer.status === "pending") {
    const sourceInv = branchInventories.find((i) => i.branchId === transfer.fromBranchId && i.productId === transfer.productId);
    if (sourceInv) {
      sourceInv.stock = Math.max(0, sourceInv.stock - transfer.quantity);
    }
    transfer.status = "shipped";
  } else if (status === "delivered" && transfer.status === "shipped") {
    const destInv = branchInventories.find((i) => i.branchId === transfer.toBranchId && i.productId === transfer.productId);
    if (destInv) {
      destInv.stock += transfer.quantity;
    } else {
      branchInventories.push({
        branchId: transfer.toBranchId,
        productId: transfer.productId,
        stock: transfer.quantity,
        minAlertThreshold: 3
      });
    }
    transfer.status = "delivered";
  }
  res.json(transfer);
});
app.post("/api/pos/checkout", (req, res) => {
  const { branchId, customerName, customerPhone, customerEmail, items, paymentMethod, discountAmount, cashierName } = req.body;
  if (!branchId || !items || !items.length) {
    return res.status(400).json({ error: "Missing branch or cart items" });
  }
  for (const item of items) {
    const inv = branchInventories.find((i) => i.branchId === branchId && i.productId === item.productId);
    if (!inv || inv.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient inventory for ${item.name} at this branch.` });
    }
  }
  let totalOrder = 0;
  items.forEach((item) => {
    const inv = branchInventories.find((i) => i.branchId === branchId && i.productId === item.productId);
    if (inv) {
      inv.stock -= item.quantity;
    }
    totalOrder += item.price * item.quantity;
  });
  const disc = discountAmount ? Number(discountAmount) : 0;
  const tax = Math.round((totalOrder - disc) * 0.05);
  const totalWithTax = totalOrder - disc + tax;
  const salesId = `SAL-${Math.floor(1e4 + Math.random() * 9e4)}`;
  const newSale = {
    id: salesId,
    branchId,
    customerName: customerName || "Walk-In Customer",
    customerPhone: customerPhone || "N/A",
    items,
    taxAmount: tax,
    discountAmount: disc,
    totalAmount: totalWithTax,
    paymentMethod: paymentMethod || "cash",
    cashierName: cashierName || "Cashier Terminal",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  posSales.unshift(newSale);
  const matchedCashier = employees.find((e) => e.name === cashierName);
  if (matchedCashier) {
    matchedCashier.currentSales += totalWithTax;
  }
  const salesRevAcct = chartOfAccounts.find((c) => c.code === "4000");
  if (salesRevAcct) salesRevAcct.balance += totalWithTax;
  const cogsAcct = chartOfAccounts.find((c) => c.code === "5000");
  if (cogsAcct) cogsAcct.balance += Math.round(totalOrder * 0.7);
  if (paymentMethod === "cash") {
    const cashAcct = chartOfAccounts.find((c) => c.code === "1010");
    if (cashAcct) cashAcct.balance += totalWithTax;
  } else if (paymentMethod === "kbzpay") {
    const kbzAcct = chartOfAccounts.find((c) => c.code === "1020");
    if (kbzAcct) kbzAcct.balance += totalWithTax;
  } else if (paymentMethod === "wavepay") {
    const waveAcct = chartOfAccounts.find((c) => c.code === "1030");
    if (waveAcct) waveAcct.balance += totalWithTax;
  }
  if (customerPhone && customerPhone !== "N/A") {
    let customer = customers.find((c) => c.phone === customerPhone);
    const addedPoints = Math.floor(totalWithTax / 1e3);
    if (customer) {
      customer.loyaltyPoints += addedPoints;
      customer.totalSpent += totalWithTax;
      if (paymentMethod === "credit") {
        customer.creditBalance += totalWithTax;
      }
      if (customer.totalSpent >= 15e6) {
        customer.tier = "VIP";
      } else if (customer.totalSpent >= 8e6) {
        customer.tier = "Gold";
      } else if (customer.totalSpent >= 3e6) {
        customer.tier = "Silver";
      }
    } else {
      const newC = {
        id: `c-${Math.floor(100 + Math.random() * 900)}`,
        name: customerName,
        phone: customerPhone,
        email: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
        tier: totalWithTax >= 15e6 ? "VIP" : totalWithTax >= 8e6 ? "Gold" : totalWithTax >= 3e6 ? "Silver" : "Bronze",
        loyaltyPoints: addedPoints,
        totalSpent: totalWithTax,
        creditBalance: paymentMethod === "credit" ? totalWithTax : 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      customers.push(newC);
    }
  }
  res.status(201).json(newSale);
});
app.get("/api/sales", (req, res) => {
  const enrichedSales = posSales.map((sale) => {
    const branchName = branches.find((b) => b.id === sale.branchId)?.name || "Unknown";
    return {
      ...sale,
      branchName
    };
  });
  res.json(enrichedSales);
});
app.get("/api/customers", (req, res) => {
  res.json(customers);
});
app.post("/api/customers", (req, res) => {
  const { name, phone, email, telegram, facebook, tier } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required." });
  }
  const exists = customers.find((c) => c.phone === phone);
  if (exists) {
    return res.status(400).json({ error: "Customer phone already registered." });
  }
  const newC = {
    id: `c-${Math.floor(100 + Math.random() * 900)}`,
    name,
    phone,
    email: email || `${name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
    telegram: telegram || "",
    facebook: facebook || "",
    tier: tier || "Bronze",
    loyaltyPoints: 100,
    // Sign up points
    totalSpent: 0,
    creditBalance: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  customers.push(newC);
  res.status(201).json(newC);
});
app.get("/api/repairs", (req, res) => {
  const enrichedRepairs = repairTickets.map((rep) => {
    const branchName = branches.find((b) => b.id === rep.branchId)?.name || "Unknown";
    return {
      ...rep,
      branchName
    };
  });
  res.json(enrichedRepairs);
});
app.post("/api/repairs", (req, res) => {
  const { customerName, customerPhone, deviceBrand, deviceModel, issueDescription, branchId, estimatedCost, assignedTechnician, warrantyMonths } = req.body;
  if (!customerName || !customerPhone || !deviceBrand || !deviceModel || !issueDescription) {
    return res.status(400).json({ error: "Missing diagnostic details." });
  }
  const selectedBranch = branchId || "b-yangon";
  const finalCost = estimatedCost ? Number(estimatedCost) : 1e5;
  const newTicket = {
    id: `REP-${Math.floor(1e3 + Math.random() * 9e3)}`,
    branchId: selectedBranch,
    customerName,
    customerPhone,
    deviceBrand,
    deviceModel,
    issueDescription,
    status: "received",
    estimatedCost: finalCost,
    partsUsed: [],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    assignedTechnician: assignedTechnician || employees.find((e) => e.branchId === selectedBranch && e.role === "Technician")?.name || "Lead Technician",
    technicianNotes: "Ticket created. Awaiting initial teardown analysis.",
    warrantyMonths: warrantyMonths ? Number(warrantyMonths) : 3
  };
  repairTickets.unshift(newTicket);
  res.status(201).json(newTicket);
});
app.get("/api/repairs/:id", (req, res) => {
  const ticket = repairTickets.find((t) => t.id.toUpperCase() === req.params.id.toUpperCase());
  if (ticket) {
    res.json(ticket);
  } else {
    res.status(404).json({ error: "Repair ticket not found." });
  }
});
app.put("/api/repairs/:id", (req, res) => {
  const { status, technicianNotes, estimatedCost, partsUsed, customerSignature } = req.body;
  const ticket = repairTickets.find((t) => t.id.toUpperCase() === req.params.id.toUpperCase());
  if (!ticket) {
    return res.status(404).json({ error: "Repair ticket not found." });
  }
  if (status) {
    ticket.status = status;
    if (status === "ready" || status === "delivered") {
      const logId = `NOT-${Math.floor(1e3 + Math.random() * 9e3)}`;
      notificationLogs.unshift({
        id: logId,
        channel: "Telegram",
        recipient: ticket.customerPhone,
        message: `Dear ${ticket.customerName}, your ${ticket.deviceBrand} ${ticket.deviceModel} repair (Ticket: ${ticket.id}) status is now updated to [${status.toUpperCase()}]. Total: ${ticket.estimatedCost.toLocaleString()} MMK. Thank you for choosing AKK Mobile!`,
        sentAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  if (technicianNotes) ticket.technicianNotes = technicianNotes;
  if (estimatedCost) ticket.estimatedCost = Number(estimatedCost);
  if (partsUsed) ticket.partsUsed = partsUsed;
  if (customerSignature) ticket.customerSignature = customerSignature;
  ticket.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  res.json(ticket);
});
app.get("/api/vtu", (req, res) => {
  res.json(eLoadTransactions);
});
app.post("/api/vtu", (req, res) => {
  const { type, operator, phoneNumber, amount, planDetails, branchId } = req.body;
  if (!type || !operator || !phoneNumber || !amount) {
    return res.status(400).json({ error: "Missing load attributes." });
  }
  const txId = `VTU-${Math.floor(1e4 + Math.random() * 9e4)}`;
  const transaction = {
    id: txId,
    type,
    operator,
    phoneNumber,
    amount: Number(amount),
    planDetails: planDetails || `${operator} ${type === "airtime" ? "Refill" : "Data Pack"}`,
    status: "completed",
    branchId: branchId || "b-yangon",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  eLoadTransactions.unshift(transaction);
  res.status(201).json(transaction);
});
app.get("/api/expenses", (req, res) => {
  res.json(expenses);
});
app.post("/api/expenses", (req, res) => {
  const { branchId, category, amount, description } = req.body;
  if (!branchId || !category || !amount) {
    return res.status(400).json({ error: "Missing expense indices" });
  }
  const exp = {
    id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
    branchId,
    category,
    amount: Number(amount),
    description: description || "",
    date: (/* @__PURE__ */ new Date()).toISOString()
  };
  expenses.unshift(exp);
  const cashAcct = chartOfAccounts.find((c) => c.code === "1010");
  if (cashAcct) cashAcct.balance -= Number(amount);
  let acctCode = "5300";
  if (category === "Rent") acctCode = "5100";
  else if (category === "Utilities") acctCode = "5200";
  const expAcct = chartOfAccounts.find((c) => c.code === acctCode);
  if (expAcct) expAcct.balance += Number(amount);
  res.status(201).json(exp);
});
app.get("/api/hr", (req, res) => {
  res.json(employees);
});
app.post("/api/hr", (req, res) => {
  const { name, role, branchId, phone, salesTarget, commissionRate } = req.body;
  if (!name || !phone || !role) {
    return res.status(400).json({ error: "Name, phone and role are required" });
  }
  const newEmp = {
    id: `emp-00${employees.length + 1}`,
    name,
    role,
    branchId: branchId || "b-yangon",
    phone,
    attendanceStatus: "checked_out",
    salesTarget: Number(salesTarget || 5e6),
    currentSales: 0,
    commissionRate: Number(commissionRate || 0.01)
  };
  employees.push(newEmp);
  res.status(201).json(newEmp);
});
app.get("/api/integrations", (req, res) => {
  res.json(integrationSettings);
});
app.post("/api/integrations", (req, res) => {
  integrationSettings = { ...integrationSettings, ...req.body };
  res.json(integrationSettings);
});
app.post("/api/hr/attendance", (req, res) => {
  const { employeeId, status } = req.body;
  const emp = employees.find((e) => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: "Employee not found" });
  emp.attendanceStatus = status;
  if (status === "checked_in") {
    const now = /* @__PURE__ */ new Date();
    emp.attendanceTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else {
    emp.attendanceTime = void 0;
  }
  res.json(emp);
});
app.post("/api/hr/targets", (req, res) => {
  const { employeeId, target } = req.body;
  const emp = employees.find((e) => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: "Employee not found" });
  emp.salesTarget = Number(target);
  res.json(emp);
});
app.get("/api/accounting/coa", (req, res) => {
  res.json(chartOfAccounts);
});
app.get("/api/accounting/closing", (req, res) => {
  res.json(dailyClosings);
});
app.post("/api/accounting/closing", (req, res) => {
  const { branchId, cashSales, kPaySales, wavePaySales, otherDigitalSales, expenseAmount, drawerDifference, closedBy } = req.body;
  if (!branchId || !closedBy) {
    return res.status(400).json({ error: "Missing daily closing details" });
  }
  const closing = {
    id: `CLS-${Math.floor(100 + Math.random() * 900)}`,
    branchId,
    closingDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    cashSales: Number(cashSales || 0),
    kPaySales: Number(kPaySales || 0),
    wavePaySales: Number(wavePaySales || 0),
    otherDigitalSales: Number(otherDigitalSales || 0),
    totalSales: Number(cashSales || 0) + Number(kPaySales || 0) + Number(wavePaySales || 0) + Number(otherDigitalSales || 0),
    expenseAmount: Number(expenseAmount || 0),
    drawerDifference: Number(drawerDifference || 0),
    closedBy,
    status: "audited"
  };
  dailyClosings.unshift(closing);
  res.status(201).json(closing);
});
app.get("/api/online-orders", (req, res) => {
  res.json(onlineOrders);
});
app.post("/api/online-orders", (req, res) => {
  const { customerName, customerPhone, address, items, orderType } = req.body;
  if (!customerName || !customerPhone || !items || !items.length) {
    return res.status(400).json({ error: "Missing online checkout indices." });
  }
  let total = 0;
  const parsedItems = items.map((i) => {
    const prod = products.find((p) => p.id === i.productId);
    const pPrice = prod?.price || 12e5;
    total += pPrice * (i.quantity || 1);
    return {
      productId: i.productId,
      name: prod?.name || "Accessories SKU",
      price: pPrice,
      quantity: i.quantity || 1
    };
  });
  const order = {
    id: `ONL-${Math.floor(200 + Math.random() * 800)}`,
    customerName,
    customerPhone,
    address: address || "Yangon, Myanmar",
    items: parsedItems,
    totalAmount: total,
    orderType: orderType || "delivery",
    status: "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  onlineOrders.unshift(order);
  res.status(201).json(order);
});
app.put("/api/online-orders/:id", (req, res) => {
  const { status } = req.body;
  const order = onlineOrders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.status = status;
  res.json(order);
});
app.get("/api/notifications", (req, res) => {
  res.json(notificationLogs);
});
app.post("/api/notifications", (req, res) => {
  const { channel, recipient, message } = req.body;
  if (!recipient || !message) {
    return res.status(400).json({ error: "Missing notification parameters" });
  }
  const log = {
    id: `NOT-${Math.floor(1e3 + Math.random() * 9e3)}`,
    channel: channel || "SMS",
    recipient,
    message,
    sentAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  notificationLogs.unshift(log);
  res.status(201).json(log);
});
app.post("/api/assistant", async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Inquiry message payload is required." });
  }
  const catalogStr = products.map((p) => `- [ID: ${p.id}] ${p.name} (${p.brand}) Category: ${p.category} Price: ${p.price.toLocaleString()} MMK`).join("\n");
  const inventoryStr = branchInventories.map((inv) => {
    const b = branches.find((branch) => branch.id === inv.branchId)?.name || inv.branchId;
    const p = products.find((prod) => prod.id === inv.productId)?.name || inv.productId;
    return `- ${b}: ${p} (Stock: ${inv.stock} units, Alert Threshold: ${inv.minAlertThreshold})`;
  }).join("\n");
  const crmStr = customers.map((c) => `- ${c.name} (Tier: ${c.tier}, Phone: ${c.phone}, Spent: ${c.totalSpent.toLocaleString()} MMK, points: ${c.loyaltyPoints})`).join("\n");
  const activeTickets = repairTickets.map((r) => `- [${r.id}] ${r.customerName}'s ${r.deviceBrand} ${r.deviceModel} is [${r.status.toUpperCase()}] at branch ${r.branchId}. Est. Cost: ${r.estimatedCost.toLocaleString()} MMK`).join("\n");
  const recentSalesStr = posSales.slice(0, 10).map((s) => `- Sale [${s.id}] at ${s.branchId}: ${s.totalAmount.toLocaleString()} MMK paid via ${s.paymentMethod.toUpperCase()} for ${s.items.length} item(s)`).join("\n");
  const totalRevenue = posSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netEarnings = totalRevenue - totalExpenses;
  const systemPrompt = `You are "AKK Mobile Enterprise Brain", an elite AI Business Intelligence Director and CRM Agent for AKK Mobile, based in Myanmar. 
You possess full access to the real-time Cloud POS database, CRM directories, multi-branch inventories, financial ledger accounts, and service center tickets.
Your objective is to provide high-fidelity, extremely professional, data-driven answers to operators, or respond gracefully to CRM customer service inquiries.

--- LIVE AKK ENTERPRISE DATABASE ---
LOCAL BUSINESS REGION: Myanmar (Burmese / English)
CURRENCY: Myanmar Kyat (MMK)
BRANCHES:
- Yangon HQ: Kaba Aye Pagoda Road (Managed by U Kyaw Swar)
- Mandalay Branch: 73rd Street (Managed by Daw Hla Hla)
- Naypyitaw Store: Thiri Mandalar Market (Managed by U Aung Ko)

GLOBAL HARDWARE CATALOG:
${catalogStr}

CURRENT MULTI-BRANCH STOCK LEVELS:
${inventoryStr}

LOW STOCK ALERT EXCEPTIONS:
${branchInventories.filter((i) => i.stock <= i.minAlertThreshold).map((i) => {
    const b = branches.find((branch) => branch.id === i.branchId)?.name;
    const p = products.find((prod) => prod.id === i.productId)?.name;
    return `- ${p} at ${b} is critically low! (${i.stock} units left, Min limit is ${i.minAlertThreshold})`;
  }).join("\n") || "None. All inventories stable."}

CRM LOYALTY DATABASE:
${crmStr}

SERVICE LAB REPAIR TICKETS:
${activeTickets}

LATEST 10 TRANSACTION LOGS:
${recentSalesStr}

FINANCIALS TOTALS (MMK):
- Total System Revenue: ${totalRevenue.toLocaleString()} MMK
- System Expenses: ${totalExpenses.toLocaleString()} MMK
- Net Operating Income: ${netEarnings.toLocaleString()} MMK
----------------------------------

YOUR INSTRUCTIONS & SKILLS:
1. Sales Forecast & Intelligence: If asked about predictions, demand, or branch comparisons, provide a thorough, structured response. Use clean table lists and bullet points. Propose actual numbers styled in MMK.
2. Smart Inventory Balancing: Propose stock transfers (e.g. "We can dispatch 5 units of iPhone 17 Pro Max from Yangon HQ which has 18 units to Mandalay Branch which only has 4 units").
3. VIP Recommendations: Propose personalized promo items based on spending patterns or brand preference.
4. Professional & Polite: Keep your tone authoritative, analytical, and highly structured. Do not output raw JSON unless specifically requested. Avoid hallucinated IDs. Feel free to use appropriate Myanmar terms like "U" (Mr.) and "Daw" (Ms.) when referencing staff or VIP clients.

PREVIOUS CHAT:
${(chatHistory || []).map((h) => `${h.sender === "user" ? "Operator" : "AI"}: ${h.text}`).join("\n")}

LATEST INQUIRY: "${message}"`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        systemInstruction: "You are the intelligent business intelligence engine for AKK Mobile Enterprise Suite, localized to Myanmar."
      }
    });
    res.json({ text: response.text || "Synchronizations stable. Query parsed." });
  } catch (error) {
    console.error("Gemini Enterprise assistant failed:", error);
    res.status(500).json({
      error: "Failed to access AI Intelligence Core",
      details: error.message || String(error)
    });
  }
});
setupDatabaseRoutes(app);
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path2.join(__dirname2, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path2.join(__dirname2, "dist", "index.html"));
  });
}
var PORT = 3e3;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[SERVER] AKK Mobile Enterprise backend operational on port ${PORT}`);
});
//# sourceMappingURL=server.js.map
