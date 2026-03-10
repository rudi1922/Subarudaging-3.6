-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS outlet_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;

-- Add missing columns to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS division TEXT;

-- Ensure other tables have outlet_id if needed (already checked, they seem fine)
-- transactions, employees, users have it.

-- Add indexes for performance if not exists (optional but good)
CREATE INDEX IF NOT EXISTS idx_products_outlet_id ON products(outlet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_outlet_id ON transactions(outlet_id);
