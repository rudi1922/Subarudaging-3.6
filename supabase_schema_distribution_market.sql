-- 1. Create VEHICLES table
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    plate_number TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create DELIVERIES table
CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY,
    transaction_id TEXT,
    vehicle_id TEXT REFERENCES vehicles(id),
    driver_id TEXT,
    status TEXT NOT NULL,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create MARKET_NOTES table
CREATE TABLE IF NOT EXISTS market_notes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create MARKET_SURVEYS table
CREATE TABLE IF NOT EXISTS market_surveys (
    id TEXT PRIMARY KEY,
    location TEXT,
    date TEXT NOT NULL,
    user_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create PRICE_POINTS table
CREATE TABLE IF NOT EXISTS price_points (
    id TEXT PRIMARY KEY,
    market_survey_id TEXT REFERENCES market_surveys(id),
    product_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    unit TEXT,
    date TEXT, -- Added for direct price tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_points ENABLE ROW LEVEL SECURITY;

-- 7. Create Policies (Allow all for authenticated users)
DROP POLICY IF EXISTS "Allow all for authenticated" ON vehicles;
CREATE POLICY "Allow all for authenticated" ON vehicles FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON deliveries;
CREATE POLICY "Allow all for authenticated" ON deliveries FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON market_notes;
CREATE POLICY "Allow all for authenticated" ON market_notes FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON market_surveys;
CREATE POLICY "Allow all for authenticated" ON market_surveys FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated" ON price_points;
CREATE POLICY "Allow all for authenticated" ON price_points FOR ALL USING (auth.role() = 'authenticated');
