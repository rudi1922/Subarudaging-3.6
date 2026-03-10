-- 1. Create OUTLETS table
CREATE TABLE IF NOT EXISTS outlets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    coordinates JSONB, -- Stores {lat: number, lng: number}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cattle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Allow all access for authenticated users for now)
-- We use "IF NOT EXISTS" logic by dropping first to avoid errors on re-run
DROP POLICY IF EXISTS "Allow all for authenticated" ON products;
CREATE POLICY "Allow all for authenticated" ON products FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON transactions;
CREATE POLICY "Allow all for authenticated" ON transactions FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON expenses;
CREATE POLICY "Allow all for authenticated" ON expenses FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON employees;
CREATE POLICY "Allow all for authenticated" ON employees FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON users;
CREATE POLICY "Allow all for authenticated" ON users FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON attendance;
CREATE POLICY "Allow all for authenticated" ON attendance FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON system_logs;
CREATE POLICY "Allow all for authenticated" ON system_logs FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON settings;
CREATE POLICY "Allow all for authenticated" ON settings FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON cattle_types;
CREATE POLICY "Allow all for authenticated" ON cattle_types FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON customers;
CREATE POLICY "Allow all for authenticated" ON customers FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON outlets;
CREATE POLICY "Allow all for authenticated" ON outlets FOR ALL USING (auth.role() = 'authenticated');

-- 4. Insert Default Outlets if empty
INSERT INTO outlets (id, name, address, phone, coordinates)
SELECT 'OUTLET-001', 'Subaru Daging - Pusat', 'Jl. Pagar Alam No. 1', '08123456789', '{"lat": -5.397140, "lng": 105.266792}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM outlets);
