-- ==============================================================================
-- SUPER MASTER SCRIPT: SUBARU DAGING SAPI (ERP & POS FULL INTEGRATION)
-- ==============================================================================

-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. CORE TABLES (Level 1)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  employee_id TEXT,
  outlet_id TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE,
  referrer_id UUID REFERENCES users(id),
  total_earnings DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outlets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    coordinates JSONB,
    radius INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_permissions JSONB DEFAULT '[
        {"role": "DIRECTOR", "viewFinance": true, "editStock": true, "manageUsers": true},
        {"role": "MANAGER", "viewFinance": true, "editStock": true, "manageUsers": false},
        {"role": "ADMIN", "viewFinance": false, "editStock": true, "manageUsers": false},
        {"role": "CASHIER", "viewFinance": false, "editStock": false, "manageUsers": false}
    ]'::jsonb
);

-- ==========================================
-- 3. BUSINESS ENTITY TABLES (Level 2)
-- ==========================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outlet_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    name TEXT,
    outlet_id TEXT, 
    cost_price NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    division TEXT
);

CREATE TABLE IF NOT EXISTS employees (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS attendance (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS system_logs (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS cattle_types (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
CREATE TABLE IF NOT EXISTS customers (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());

-- ==========================================
-- 4. DISTRIBUTION & MARKET TABLES (Level 3)
-- ==========================================
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    plate_number TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    vehicle_id TEXT REFERENCES vehicles(id),
    driver_id TEXT,
    status TEXT NOT NULL,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_surveys (
    id TEXT PRIMARY KEY,
    location TEXT,
    date TEXT NOT NULL,
    user_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_notes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_points (
    id TEXT PRIMARY KEY,
    market_survey_id TEXT REFERENCES market_surveys(id),
    product_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    unit TEXT,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. REFERRAL & COMMISSIONS TABLES (Level 4)
-- ==========================================
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) NOT NULL,
    referred_user_id UUID REFERENCES users(id) NOT NULL,
    transaction_id UUID REFERENCES transactions(id),
    amount DECIMAL(12, 2) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_outlet_id ON products(outlet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_outlet_id ON transactions(outlet_id);

-- ==========================================
-- 7. FUNCTIONS & TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION generate_referral_code(name TEXT) RETURNS TEXT AS $$
DECLARE
    code TEXT;
    base_name TEXT;
BEGIN
    base_name := UPPER(LEFT(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'), 4));
    code := base_name || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_generate_referral_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_referral_code ON users;
CREATE TRIGGER tr_generate_referral_code
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_referral_code();

-- ==========================================
-- 8. INITIAL DATA SEEDING
-- ==========================================
INSERT INTO users (username, password_hash, name, role, is_approved, employee_id)
VALUES ('rudiaf', '$2a$10$X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7', 'Rudi Yanto', 'Admin', true, 'EMP-006')
ON CONFLICT (username) DO NOTHING;

INSERT INTO outlets (id, name, address, phone, coordinates)
SELECT 'OUTLET-001', 'Subaru Daging - Pusat', 'Jl. Pagar Alam No. 1, Bandar Lampung', '08123456789', '{"lat": -5.397140, "lng": 105.266792}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM outlets WHERE id = 'OUTLET-001');

-- ==========================================
-- 9. REAL-TIME PUBLICATION
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Pastikan tabel yang butuh realtime masuk ke publikasi
-- Tangkap error jika tabel sudah masuk publikasi
DO $$
BEGIN
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE products; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE transactions; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE users; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE commissions; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ==========================================
-- 10. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================
-- Aktifkan RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Reset Policy lama untuk mencegah error ganda
DROP POLICY IF EXISTS "Allow public read access" ON users;
DROP POLICY IF EXISTS "Allow public insert access" ON users;
DROP POLICY IF EXISTS "Allow update access" ON users;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON users;
DROP POLICY IF EXISTS "Allow all for authenticated" ON users;

DROP POLICY IF EXISTS "Allow update for authenticated" ON settings;
DROP POLICY IF EXISTS "Allow all for authenticated" ON settings;

DROP POLICY IF EXISTS "Allow all for authenticated" ON outlets;
DROP POLICY IF EXISTS "Allow all for authenticated" ON products;
DROP POLICY IF EXISTS "Allow all for authenticated" ON transactions;
DROP POLICY IF EXISTS "Allow all for authenticated" ON expenses;
DROP POLICY IF EXISTS "Allow all for authenticated" ON employees;
DROP POLICY IF EXISTS "Allow all for authenticated" ON attendance;
DROP POLICY IF EXISTS "Allow all for authenticated" ON system_logs;
DROP POLICY IF EXISTS "Allow all for authenticated" ON cattle_types;
DROP POLICY IF EXISTS "Allow all for authenticated" ON customers;
DROP POLICY IF EXISTS "Allow all for authenticated" ON vehicles;
DROP POLICY IF EXISTS "Allow all for authenticated" ON deliveries;
DROP POLICY IF EXISTS "Allow all for authenticated" ON market_notes;
DROP POLICY IF EXISTS "Allow all for authenticated" ON market_surveys;
DROP POLICY IF EXISTS "Allow all for authenticated" ON price_points;

DROP POLICY IF EXISTS "Users can view their own commissions" ON commissions;
DROP POLICY IF EXISTS "Admins can view all commissions" ON commissions;

-- Buat Policy Baru
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow delete for authenticated" ON users FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated" ON settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON settings FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON outlets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON employees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON attendance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON system_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON cattle_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON customers FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated" ON vehicles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON deliveries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON market_notes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON market_surveys FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated" ON price_points FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own commissions" ON commissions FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Admins can view all commissions" ON commissions FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('Admin', 'Manager', 'Director')));