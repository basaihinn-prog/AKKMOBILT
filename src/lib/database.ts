import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/akk_enterprise.db');

// Initialize database connection
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize all tables
export function initializeDatabase() {
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
    )`,
  ];

  for (const sql of tables) {
    db.exec(sql);
  }

  // Create indexes for performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id)',
    'CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)',
    'CREATE INDEX IF NOT EXISTS idx_imei_imei ON imei_tracking(imei)',
    'CREATE INDEX IF NOT EXISTS idx_sales_branch_date ON sales(branch_id, sale_date)',
    'CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status)',
    'CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at)',
  ];

  for (const sql of indexes) {
    db.exec(sql);
  }

  console.log('Database initialized successfully');
}

export function closeDatabase() {
  db.close();
}
