-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  employee_id TEXT,
  outlet_id TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  referral_code TEXT,
  referrer_id TEXT,
  total_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  cost_price NUMERIC,
  stock NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  min_stock NUMERIC DEFAULT 5,
  image TEXT,
  description TEXT,
  batch_number TEXT,
  expiry_date TEXT,
  outlet_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outlets Table
CREATE TABLE IF NOT EXISTS outlets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  radius NUMERIC DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  is_delivery BOOLEAN DEFAULT FALSE,
  total NUMERIC NOT NULL,
  down_payment NUMERIC DEFAULT 0,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_id TEXT,
  customer_type TEXT NOT NULL,
  outlet_id TEXT,
  due_date TEXT,
  bank_name TEXT,
  bank_ref TEXT,
  cashier TEXT,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT NOT NULL,
  check_in_time TEXT,
  check_out_time TEXT,
  base_salary NUMERIC NOT NULL,
  hourly_rate NUMERIC,
  is_warehouse_pic BOOLEAN DEFAULT FALSE,
  phone TEXT,
  outlet_id TEXT,
  device_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  status TEXT NOT NULL,
  time TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  division TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  proof_image TEXT,
  outlet_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receivables Table
CREATE TABLE IF NOT EXISTS receivables (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_id TEXT,
  amount NUMERIC NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  outlet_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debt Payments Table
CREATE TABLE IF NOT EXISTS debt_payments (
  id TEXT PRIMARY KEY,
  receivable_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  collector_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cattle Orders Table
CREATE TABLE IF NOT EXISTS cattle_orders (
  id TEXT PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  order_date TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  weight_type TEXT,
  health_condition TEXT,
  arrival_date TEXT,
  driver_name TEXT,
  vehicle_plate TEXT,
  slaughter_date TEXT,
  slaughtered_count NUMERIC DEFAULT 0,
  total_live_weight NUMERIC DEFAULT 0,
  total_carcass_weight NUMERIC DEFAULT 0,
  distribution JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  role TEXT,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TEXT NOT NULL,
  ip TEXT,
  location TEXT,
  device TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  total_spent NUMERIC DEFAULT 0,
  last_visit TEXT,
  outstanding_debt NUMERIC DEFAULT 0,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  category TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cattle Types Table
CREATE TABLE IF NOT EXISTS cattle_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  default_live_price NUMERIC,
  default_carcass_pct NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cattle Prices Table
CREATE TABLE IF NOT EXISTS cattle_prices (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  cattle_type TEXT NOT NULL,
  live_price_per_kg NUMERIC NOT NULL,
  estimated_carcass_percentage NUMERIC NOT NULL,
  calculated_hpp NUMERIC NOT NULL,
  cattle_type_id TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Items Table
CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty Programs Table
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required NUMERIC NOT NULL,
  reward TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  value NUMERIC NOT NULL,
  purchase_date TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Private Transactions Table
CREATE TABLE IF NOT EXISTS private_transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Divisions Table
CREATE TABLE IF NOT EXISTS divisions (
  name TEXT PRIMARY KEY
);

-- Role Permissions Table
CREATE TABLE IF NOT EXISTS role_permissions (
  role TEXT PRIMARY KEY,
  view_finance BOOLEAN DEFAULT FALSE,
  edit_stock BOOLEAN DEFAULT FALSE,
  manage_users BOOLEAN DEFAULT FALSE
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattle_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattle_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies for all tables (Simplified for prototype)
-- In production, you MUST restrict these based on roles!
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('CREATE POLICY "Allow public read %I" ON %I FOR SELECT USING (true)', t, t);
        EXECUTE format('CREATE POLICY "Allow public insert %I" ON %I FOR INSERT WITH CHECK (true)', t, t);
        EXECUTE format('CREATE POLICY "Allow public update %I" ON %I FOR UPDATE USING (true)', t, t);
        EXECUTE format('CREATE POLICY "Allow public delete %I" ON %I FOR DELETE USING (true)', t, t);
    END LOOP;
END $$;
