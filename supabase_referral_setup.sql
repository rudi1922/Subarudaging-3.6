-- ################################################################################
-- # REFERRAL SYSTEM SETUP FOR SUPABASE
-- ################################################################################

-- 1. Update Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12, 2) DEFAULT 0;

-- 2. Create Commissions Table
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

-- 3. Function to generate a random referral code
CREATE OR REPLACE FUNCTION generate_referral_code(name TEXT) RETURNS TEXT AS $$
DECLARE
    code TEXT;
    base_name TEXT;
BEGIN
    -- Remove non-alphanumeric characters and take first 4 letters
    base_name := UPPER(LEFT(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'), 4));
    -- Append 4 random digits
    code := base_name || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to automatically generate referral code on user creation
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

-- 5. Enable Real-time for Key Tables
-- Check if publication exists first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE commissions;

-- 6. RLS Policies for Commissions
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own commissions"
ON commissions FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all commissions"
ON commissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('Admin', 'Manager', 'Director')
  )
);
