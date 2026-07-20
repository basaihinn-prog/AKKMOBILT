-- ============================================================================
-- AKK MOBILE ENTERPRISE SUITE - SUPABASE POSTGRESQL SCHEMA
-- Generated: 2026-07-18
-- Target Platform: Supabase (PostgreSQL 15+)
-- Description: Core database structures, constraints, indices, automated 
--              triggers, and Row Level Security (RLS) policies.
-- ============================================================================

-- Enable UUID extension for standard record identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUM TYPES & CUSTOM DOMAINS
-- ============================================================================

CREATE TYPE repair_status_enum AS ENUM (
  'received', 
  'diagnostic', 
  'repairing', 
  'testing', 
  'ready', 
  'delivered'
);

CREATE TYPE payment_method_enum AS ENUM (
  'cash', 
  'kbzpay', 
  'wavepay', 
  'ayapay', 
  'cbpay', 
  'uabpay', 
  'credit', 
  'split'
);

CREATE TYPE branch_id_enum AS ENUM (
  'b-yangon', 
  'b-mandalay', 
  'b-naypyitaw'
);

CREATE TYPE product_category_enum AS ENUM (
  'Phone', 
  'Accessories', 
  'Electronics', 
  'Repair Parts'
);

CREATE TYPE transfer_status_enum AS ENUM (
  'pending', 
  'shipped', 
  'delivered'
);

CREATE TYPE customer_tier_enum AS ENUM (
  'Bronze', 
  'Silver', 
  'Gold', 
  'VIP'
);

CREATE TYPE vtu_type_enum AS ENUM (
  'airtime', 
  'data'
);

CREATE TYPE vtu_operator_enum AS ENUM (
  'MPT', 
  'Atom', 
  'Ooredoo', 
  'Mytel'
);

CREATE TYPE vtu_status_enum AS ENUM (
  'pending', 
  'completed', 
  'failed'
);

CREATE TYPE expense_category_enum AS ENUM (
  'Rent', 
  'Salary', 
  'Utilities', 
  'Marketing', 
  'Repair Parts', 
  'Other'
);

CREATE TYPE employee_role_enum AS ENUM (
  'Owner', 
  'Branch Manager', 
  'Cashier', 
  'Sales', 
  'Technician', 
  'Accountant'
);

CREATE TYPE attendance_status_enum AS ENUM (
  'checked_in', 
  'checked_out', 
  'absent'
);

CREATE TYPE daily_closing_status_enum AS ENUM (
  'draft', 
  'audited'
);

CREATE TYPE online_order_status_enum AS ENUM (
  'pending', 
  'accepted', 
  'shipped', 
  'completed', 
  'cancelled'
);

CREATE TYPE online_order_type_enum AS ENUM (
  'pickup', 
  'delivery'
);

CREATE TYPE notification_channel_enum AS ENUM (
  'SMS', 
  'Telegram', 
  'Email'
);

-- ============================================================================
-- 2. CORE BUSINESS ENTITY TABLES
-- ============================================================================

-- 2.1. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS public.branches (
  id branch_id_enum PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  manager VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(15, 2) NOT NULL CHECK (original_price >= 0),
  image_url TEXT,
  category product_category_enum NOT NULL DEFAULT 'Phone',
  specs JSONB DEFAULT '{}'::jsonb NOT NULL,
  colors VARCHAR(50)[] DEFAULT '{}'::VARCHAR(50)[] NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5.0),
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  badge VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
  branch_id branch_id_enum NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_alert_threshold INTEGER NOT NULL DEFAULT 5 CHECK (min_alert_threshold >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (branch_id, product_id)
);

-- 2.4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'cust_' || uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150),
  telegram VARCHAR(100),
  facebook VARCHAR(150),
  tier customer_tier_enum DEFAULT 'Bronze' NOT NULL,
  loyalty_points INTEGER DEFAULT 0 CHECK (loyalty_points >= 0) NOT NULL,
  total_spent NUMERIC(15, 2) DEFAULT 0.00 CHECK (total_spent >= 0.00) NOT NULL,
  credit_balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (credit_balance >= 0.00) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 3. TRANSACTION & LOGISTICAL TABLES
-- ============================================================================

-- 3.1. STOCK TRANSFERS TABLE
CREATE TABLE IF NOT EXISTS public.stock_transfers (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'tx_' || uuid_generate_v4(),
  product_id VARCHAR(50) NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  from_branch_id branch_id_enum NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  to_branch_id branch_id_enum NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status transfer_status_enum NOT NULL DEFAULT 'pending',
  requested_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT different_branches CHECK (from_branch_id <> to_branch_id)
);

-- 3.2. POS SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'sale_' || uuid_generate_v4(),
  branch_id branch_id_enum NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  tax_amount NUMERIC(15, 2) DEFAULT 0.00 CHECK (tax_amount >= 0.00) NOT NULL,
  discount_amount NUMERIC(15, 2) DEFAULT 0.00 CHECK (discount_amount >= 0.00) NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0.00),
  payment_method payment_method_enum NOT NULL DEFAULT 'cash',
  cashier_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.3. POS SALE ITEMS (CHILD TABLE)
CREATE TABLE IF NOT EXISTS public.sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id VARCHAR(50) NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(15, 2) NOT NULL CHECK (price >= 0.00),
  color VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- 3.4. REPAIR TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.repair_tickets (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'rep_' || uuid_generate_v4(),
  branch_id branch_id_enum NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  device_brand VARCHAR(100) NOT NULL,
  device_model VARCHAR(100) NOT NULL,
  issue_description TEXT NOT NULL,
  status repair_status_enum NOT NULL DEFAULT 'received',
  estimated_cost NUMERIC(15, 2) DEFAULT 0.00 CHECK (estimated_cost >= 0.00) NOT NULL,
  parts_used TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  technician_notes TEXT,
  assigned_technician VARCHAR(100),
  customer_signature TEXT,
  warranty_months INTEGER DEFAULT 0 CHECK (warranty_months >= 0) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.5. VTU TRANSACTIONS TABLE (Mobile Topups & Data packs)
CREATE TABLE IF NOT EXISTS public.vtu_transactions (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'vtu_' || uuid_generate_v4(),
  type vtu_type_enum NOT NULL,
  operator vtu_operator_enum NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  plan_details TEXT,
  status vtu_status_enum NOT NULL DEFAULT 'pending',
  branch_id branch_id_enum NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.6. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'exp_' || uuid_generate_v4(),
  branch_id branch_id_enum NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  category expense_category_enum NOT NULL DEFAULT 'Other',
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.7. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'emp_' || uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  role employee_role_enum NOT NULL,
  branch_id branch_id_enum NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  phone VARCHAR(20) NOT NULL,
  attendance_status attendance_status_enum NOT NULL DEFAULT 'absent',
  attendance_time TIMESTAMP WITH TIME ZONE,
  sales_target NUMERIC(15, 2) DEFAULT 0.00 CHECK (sales_target >= 0.00) NOT NULL,
  current_sales NUMERIC(15, 2) DEFAULT 0.00 CHECK (current_sales >= 0.00) NOT NULL,
  commission_rate NUMERIC(5, 4) DEFAULT 0.0000 CHECK (commission_rate >= 0.0000 AND commission_rate <= 1.0000) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.8. DAILY CLOSINGS TABLE
CREATE TABLE IF NOT EXISTS public.daily_closings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'close_' || uuid_generate_v4(),
  branch_id branch_id_enum NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  closing_date DATE NOT NULL,
  cash_sales NUMERIC(15, 2) DEFAULT 0.00 CHECK (cash_sales >= 0.00) NOT NULL,
  kpay_sales NUMERIC(15, 2) DEFAULT 0.00 CHECK (kpay_sales >= 0.00) NOT NULL,
  wavepay_sales NUMERIC(15, 2) DEFAULT 0.00 CHECK (wavepay_sales >= 0.00) NOT NULL,
  other_digital_sales NUMERIC(15, 2) DEFAULT 0.00 CHECK (other_digital_sales >= 0.00) NOT NULL,
  total_sales NUMERIC(15, 2) DEFAULT 0.00 CHECK (total_sales >= 0.00) NOT NULL,
  expense_amount NUMERIC(15, 2) DEFAULT 0.00 CHECK (expense_amount >= 0.00) NOT NULL,
  drawer_difference NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  closed_by VARCHAR(100) NOT NULL,
  status daily_closing_status_enum DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(branch_id, closing_date)
);

-- 3.9. ONLINE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.online_orders (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'ord_' || uuid_generate_v4(),
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  total_amount NUMERIC(15, 2) NOT NULL CHECK (total_amount >= 0.00),
  order_type online_order_type_enum NOT NULL DEFAULT 'delivery',
  status online_order_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.10. ONLINE ORDER ITEMS (CHILD TABLE)
CREATE TABLE IF NOT EXISTS public.online_order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL REFERENCES public.online_orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(15, 2) NOT NULL CHECK (price >= 0.00),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- 3.11. NOTIFICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'notif_' || uuid_generate_v4(),
  channel notification_channel_enum NOT NULL DEFAULT 'Telegram',
  recipient VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 4. DATABASE VIEWS FOR INTELLIGENCE & BUSINESS ANALYSIS
-- ============================================================================

-- 4.1. JOINED INVENTORY VIEW
CREATE OR REPLACE VIEW public.joined_inventory AS
SELECT 
  i.branch_id,
  i.product_id,
  i.stock,
  i.min_alert_threshold,
  p.name AS product_name,
  p.brand AS product_brand,
  p.price AS product_price,
  p.image_url AS product_image,
  b.name AS branch_name
FROM public.inventory i
JOIN public.products p ON i.product_id = p.id
JOIN public.branches b ON i.branch_id = b.id;

-- 4.2. BRANCH CONSOLIDATED REVENUE VIEW
CREATE OR REPLACE VIEW public.branch_revenue_report AS
SELECT 
  branch_id,
  COUNT(id) AS total_sales_count,
  SUM(total_amount) AS total_revenue,
  SUM(tax_amount) AS total_commercial_tax,
  SUM(discount_amount) AS total_discounts_granted
FROM public.sales
GROUP BY branch_id;

-- ============================================================================
-- 5. PERFORMANCE TUNING & HIGH-VOLUME INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory (product_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_status ON public.stock_transfers (status);
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON public.sales (branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales (created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items (sale_id);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_status ON public.repair_tickets (status);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_customer_phone ON public.repair_tickets (customer_phone);
CREATE INDEX IF NOT EXISTS idx_vtu_transactions_phone ON public.vtu_transactions (phone_number);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses (expense_date);
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON public.employees (branch_id);
CREATE INDEX IF NOT EXISTS idx_online_orders_status ON public.online_orders (status);

-- ============================================================================
-- 6. AUTOMATED UPDATE TIMESTAMP FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically bump the updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to respective tables
CREATE TRIGGER set_timestamp_branches
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_customers
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_stock_transfers
  BEFORE UPDATE ON public.stock_transfers
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_repair_tickets
  BEFORE UPDATE ON public.repair_tickets
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_employees
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_daily_closings
  BEFORE UPDATE ON public.daily_closings
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_online_orders
  BEFORE UPDATE ON public.online_orders
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ============================================================================

-- Enable Row Level Security (RLS) on critical tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vtu_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Define Policies
-- Policy: Anyone can read products and branches
CREATE POLICY "Allow public read access to products" 
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow public read access to branches" 
  ON public.branches FOR SELECT USING (true);

-- Policy: Authenticated users can modify products/branches
CREATE POLICY "Allow auth admin modifications on products" 
  ON public.products FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow auth admin modifications on branches" 
  ON public.branches FOR ALL TO authenticated USING (true);

-- Policy: Everything else allows full authenticated operations
CREATE POLICY "Enable all access for authenticated users on inventory" 
  ON public.inventory FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on customers" 
  ON public.customers FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on sales" 
  ON public.sales FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on sale_items" 
  ON public.sale_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on repair_tickets" 
  ON public.repair_tickets FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on vtu_transactions" 
  ON public.vtu_transactions FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on expenses" 
  ON public.expenses FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on employees" 
  ON public.employees FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on daily_closings" 
  ON public.daily_closings FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on online_orders" 
  ON public.online_orders FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on online_order_items" 
  ON public.online_order_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users on notification_logs" 
  ON public.notification_logs FOR ALL TO authenticated USING (true);

-- ============================================================================
-- 8. INITIAL SEED DATA
-- ============================================================================

-- Seed Branches
INSERT INTO public.branches (id, name, city, manager, phone) VALUES
('b-yangon', 'Yangon HQ (Kaba Aye)', 'Yangon', 'U Kyaw Swar', '09-777123456'),
('b-mandalay', 'Mandalay Branch (78th St)', 'Mandalay', 'Daw Phyu Phyu', '09-777987654'),
('b-naypyitaw', 'Naypyitaw Store (Thiri)', 'Naypyitaw', 'U Aung Ko', '09-777555666')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Products
INSERT INTO public.products (id, name, brand, price, original_price, image_url, category, specs, colors, rating, reviews_count, badge) VALUES
('p-iphone15', 'iPhone 15 Pro Max', 'Apple', 4250000.00, 4000000.00, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', 'Phone', '{"screen": "6.7 inch OLED", "processor": "A17 Pro", "ram": "8GB", "storage": "256GB", "battery": "4441 mAh", "camera": "48MP Triple"}', ARRAY['Natural Titanium', 'Blue Titanium', 'Black Titanium'], 4.9, 128, 'HOT'),
('p-s24ultra', 'Galaxy S24 Ultra', 'Samsung', 3850000.00, 3600000.00, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80', 'Phone', '{"screen": "6.8 inch AMOLED", "processor": "Snapdragon 8 Gen 3", "ram": "12GB", "storage": "512GB", "battery": "5000 mAh", "camera": "200MP Quad"}', ARRAY['Titanium Gray', 'Titanium Black', 'Titanium Yellow'], 4.8, 95, 'BEST VALUE'),
('p-redmi13', 'Redmi Note 13 Pro', 'Xiaomi', 950000.00, 880000.00, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', 'Phone', '{"screen": "6.67 inch AMOLED", "processor": "Helio G99 Ultra", "ram": "8GB", "storage": "256GB", "battery": "5000 mAh", "camera": "200MP Triple"}', ARRAY['Midnight Black', 'Forest Green', 'Ocean Blue'], 4.6, 42, NULL),
('p-buds2', 'Galaxy Buds 2 Pro', 'Samsung', 450000.00, 4000000.00, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80', 'Accessories', '{"screen": "N/A", "processor": "Custom Audio SoC", "ram": "N/A", "storage": "N/A", "battery": "8 hours", "camera": "N/A"}', ARRAY['Graphite', 'White', 'Bora Purple'], 4.7, 73, NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Inventory
INSERT INTO public.inventory (branch_id, product_id, stock, min_alert_threshold) VALUES
('b-yangon', 'p-iphone15', 15, 3),
('b-yangon', 'p-s24ultra', 12, 3),
('b-yangon', 'p-redmi13', 25, 5),
('b-yangon', 'p-buds2', 40, 5),
('b-mandalay', 'p-iphone15', 8, 2),
('b-mandalay', 'p-s24ultra', 10, 2),
('b-mandalay', 'p-redmi13', 30, 5),
('b-mandalay', 'p-buds2', 20, 4),
('b-naypyitaw', 'p-iphone15', 5, 2),
('b-naypyitaw', 'p-s24ultra', 4, 2),
('b-naypyitaw', 'p-redmi13', 15, 4),
('b-naypyitaw', 'p-buds2', 12, 3)
ON CONFLICT (branch_id, product_id) DO NOTHING;
