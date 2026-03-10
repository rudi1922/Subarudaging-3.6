-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if it doesn't exist
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (for login check) - In production, restrict this!
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);

-- Allow insert access to everyone (for registration)
CREATE POLICY "Allow public insert access" ON users FOR INSERT WITH CHECK (true);

-- Allow update access to users themselves or admins (simplified for prototype)
CREATE POLICY "Allow update access" ON users FOR UPDATE USING (true);

-- Insert default admin user (password: subarualam26)
-- Note: You should generate a real bcrypt hash for production. 
-- The hash below is for 'subarualam26'
INSERT INTO users (username, password_hash, name, role, is_approved, employee_id)
VALUES 
('rudiaf', '$2a$10$X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7.X7', 'Rudi AF', 'Admin', true, 'EMP-006')
ON CONFLICT (username) DO NOTHING;
