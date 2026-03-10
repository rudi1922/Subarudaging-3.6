-- 1. Add 'radius' column to outlets table
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS radius INTEGER DEFAULT 100;

-- 2. Add 'role_permissions' column to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS role_permissions JSONB DEFAULT '[
    {"role": "DIRECTOR", "viewFinance": true, "editStock": true, "manageUsers": true},
    {"role": "MANAGER", "viewFinance": true, "editStock": true, "manageUsers": false},
    {"role": "ADMIN", "viewFinance": false, "editStock": true, "manageUsers": false},
    {"role": "CASHIER", "viewFinance": false, "editStock": false, "manageUsers": false}
]'::jsonb;

-- 3. Ensure RLS policies are correct for deletions
-- Allow authenticated users to delete from users table
DROP POLICY IF EXISTS "Allow delete for authenticated" ON users;
CREATE POLICY "Allow delete for authenticated" ON users FOR DELETE USING (auth.role() = 'authenticated');

-- Allow authenticated users to update settings (for RBAC)
DROP POLICY IF EXISTS "Allow update for authenticated" ON settings;
CREATE POLICY "Allow update for authenticated" ON settings FOR UPDATE USING (auth.role() = 'authenticated');
