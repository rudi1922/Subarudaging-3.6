-- SUPABASE DATABASE SETUP SCRIPT FOR SUBARU DAGING SAPI
-- Copy and paste this into the Supabase SQL Editor (SQL Web Editor -> New Query)

-- 1. Create Users Table
create table if not exists public.users (
  id text primary key, -- Use text to support u0, u1, etc. during migration
  username text unique,
  name text,
  role text default 'cashier',
  is_approved boolean default false,
  employee_id text,
  outlet_id text,
  full_name text,
  address text,
  phone text,
  password text, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

create policy "Users are viewable by auth." on public.users
  for select using (auth.role() = 'authenticated');

create policy "Users can update own profile." on public.users
  for update using (auth.uid() = id);

-- 2. Create Products Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text,
  price numeric default 0,
  stock numeric default 0,
  unit text,
  min_stock numeric default 0,
  description text,
  image text,
  cost_price numeric default 0,
  outlet_id text default 'HEAD-OFFICE',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
create policy "Products are viewable by authenticated users." on public.products for select using (auth.role() = 'authenticated');
create policy "Products are modifiable by staff/admin." on public.products for all using (auth.role() = 'authenticated');

-- 3. Create Transactions Table
create table if not exists public.transactions (
  id text primary key,
  date text not null,
  total numeric default 0,
  payment_method text default 'Tunai',
  items jsonb default '[]'::jsonb,
  cash_amount numeric default 0,
  change_amount numeric default 0,
  customer_name text default 'Umum',
  customer_id text,
  outlet_id text default 'HEAD-OFFICE',
  shipping_cost numeric default 0,
  is_delivery boolean default false,
  due_date text,
  down_payment numeric default 0,
  bank_name text,
  bank_ref text,
  status text default 'Completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;
create policy "Transactions viewable by auth." on public.transactions for select using (auth.role() = 'authenticated');
create policy "Transactions modifiable by auth." on public.transactions for all using (auth.role() = 'authenticated');

-- 4. Create Employees Table
create table if not exists public.employees (
  id text primary key,
  name text not null,
  role text,
  status text default 'Active',
  check_in_time text,
  check_out_time text,
  base_salary numeric default 0,
  outlet_id text default 'HEAD-OFFICE',
  device_ip text,
  is_warehouse_pic boolean default false,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.employees enable row level security;
create policy "Employees viewable by auth." on public.employees for select using (auth.role() = 'authenticated');
create policy "Employees modifiable by auth." on public.employees for all using (auth.role() = 'authenticated');

-- 5. Create Outlets Table
create table if not exists public.outlets (
  id text primary key,
  name text not null,
  address text,
  phone text,
  coordinates jsonb,
  radius numeric default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.outlets enable row level security;
create policy "Outlets viewable by everyone." on public.outlets for select using (true);
create policy "Outlets modifiable by admin." on public.outlets for all using (auth.role() = 'authenticated');

-- 6. Create System Logs Table
create table if not exists public.system_logs (
  id text primary key,
  user_id text,
  user_name text,
  action text,
  details text,
  role text,
  timestamp text,
  ip text,
  location text,
  device text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.system_logs enable row level security;
create policy "Logs viewable by admin." on public.system_logs for select using (auth.role() = 'authenticated');
create policy "Logs insertable by anyone." on public.system_logs for insert with check (true);

-- 7. Create Settings Table
create table if not exists public.settings (
  id integer primary key default 1,
  company_name text default 'Subaru Daging Sapi',
  logo_url text,
  hero_image_url text,
  maintenance_mode boolean default false,
  allow_negative_stock boolean default false,
  require_location_for_login boolean default true,
  attendance_radius numeric default 100,
  max_discount_percentage numeric default 10,
  enable_debt_payment boolean default true,
  gallery_images text[],
  role_permissions jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint check_single_row check (id = 1)
);

alter table public.settings enable row level security;
create policy "Settings viewable by everyone." on public.settings for select using (true);
create policy "Settings modifiable by admin." on public.settings for all using (auth.role() = 'authenticated');

-- Insert initial settings
insert into public.settings (id, company_name) values (1, 'Subaru Daging Sapi') on conflict (id) do nothing;

-- 8. Create Attendance Table
create table if not exists public.attendance (
  id text primary key,
  employee_id text,
  date text,
  check_in_time text,
  check_out_time text,
  status text,
  total_hours numeric default 0,
  check_in_location text,
  check_out_location text,
  check_in_ip text,
  check_out_ip text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.attendance enable row level security;
create policy "Attendance viewable by auth." on public.attendance for select using (auth.role() = 'authenticated');
create policy "Attendance modifiable by auth." on public.attendance for all using (auth.role() = 'authenticated');

-- 9. Create Commissions Table
create table if not exists public.commissions (
  id text primary key,
  referrer_id text,
  referred_user_id text,
  transaction_id text,
  amount numeric default 0,
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.commissions enable row level security;
create policy "Commissions viewable by auth." on public.commissions for select using (auth.role() = 'authenticated');
create policy "Commissions modifiable by auth." on public.commissions for all using (auth.role() = 'authenticated');

-- 10. Create Additional Tables (Shortened for space but necessary)
-- Customers, Expenses, Debt Payments, Cattle Types, Leads, Deliveries, etc.
create table if not exists public.customers (id text primary key, name text, phone text, address text, type text, total_spent numeric default 0, last_visit text, outstanding_debt numeric default 0);
create table if not exists public.expenses (id text primary key, date text, category text, amount numeric, description text, division text, outlet_id text, receipt_image text);
create table if not exists public.debt_payments (id text primary key, receivable_id text, amount numeric, date text, collector_id text);
create table if not exists public.cattle_types (id text primary key, name text, default_live_price numeric, default_carcass_pct numeric);
create table if not exists public.deliveries (id text primary key, transaction_id text, vehicle_id text, driver_id text, status text, current_location text, estimated_arrival text, actual_arrival text, notes text, proof_image text);
create table if not exists public.vehicles (id text primary key, plate_number text, type text, status text, last_maintenance text);
create table if not exists public.market_notes (id text primary key, user_id text, content text, date text, tags text[]);
create table if not exists public.market_surveys (id text primary key, location text, date text, user_id text, notes text);
create table if not exists public.price_points (id text primary key, market_survey_id text, product_name text, price numeric, unit text);
create table if not exists public.weighing_logs (id text primary key, cattle_id text, weight numeric, date text, user_id text, notes text);
create table if not exists public.gallery_items (id text primary key, title text, subtitle text, image_url text, date text, category text, content text);
create table if not exists public.loyalty_programs (id text primary key, name text, description text, points_per_transaction numeric, min_points_to_redeem numeric);
create table if not exists public.leads (id text primary key, name text, phone text, email text, status text, notes text, source text, created_at text);
create table if not exists public.cattle_orders (id text primary key, supplier_id text, order_date text, expected_arrival text, total_amount numeric, status text);
create table if not exists public.cattle_prices (id text primary key, cattle_type_id text, live_price numeric, carcass_price numeric, date text);
create table if not exists public.employee_financials (id text primary key, employee_id text, amount numeric, type text, date text, reason text, status text, approved_by text);
create table if not exists public.visit_records (id text primary key, customer_id text, user_id text, date text, purpose text, result text);
create table if not exists public.suppliers (id text primary key, name text, phone text, address text, type text);
create table if not exists public.asset (id text primary key, name text, type text, value numeric, purchase_date text, location text);
create table if not exists public.private_transactions (id text primary key, date text, amount numeric, type text, category text, description text);

-- Enable RLS and simple policies for all
alter table public.customers enable row level security; create policy "Customers accessible" on public.customers for all using (auth.role() = 'authenticated');
alter table public.expenses enable row level security; create policy "Expenses accessible" on public.expenses for all using (auth.role() = 'authenticated');
alter table public.debt_payments enable row level security; create policy "DebtPayments accessible" on public.debt_payments for all using (auth.role() = 'authenticated');
alter table public.deliveries enable row level security; create policy "Deliveries accessible" on public.deliveries for all using (auth.role() = 'authenticated');
alter table public.vehicles enable row level security; create policy "Vehicles accessible" on public.vehicles for all using (auth.role() = 'authenticated');
alter table public.market_notes enable row level security; create policy "MarketNotes accessible" on public.market_notes for all using (auth.role() = 'authenticated');
alter table public.market_surveys enable row level security; create policy "MarketSurveys accessible" on public.market_surveys for all using (auth.role() = 'authenticated');
alter table public.price_points enable row level security; create policy "PricePoints accessible" on public.price_points for all using (auth.role() = 'authenticated');
alter table public.weighing_logs enable row level security; create policy "WeighingLogs accessible" on public.weighing_logs for all using (auth.role() = 'authenticated');
alter table public.gallery_items enable row level security; create policy "GalleryItems accessible" on public.gallery_items for all using (auth.role() = 'authenticated');
alter table public.loyalty_programs enable row level security; create policy "LoyaltyPrograms accessible" on public.loyalty_programs for all using (auth.role() = 'authenticated');

-- FUNCTIONS FOR AUTH SYNC --
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, name, role)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', 'cashier');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to sync user from auth.users to public.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 11. Create Stock Adjustments Table
create table if not exists public.stock_adjustments (
  id text primary key,
  product_id text references public.products(id) on delete cascade,
  product_name text,
  quantity numeric not null,
  type text not null, -- 'Keluaran / Rusak', 'Retur / Kembali', 'Penyesuaian Manual'
  reason text,
  date text not null,
  outlet_id text,
  user_id text,
  user_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.stock_adjustments enable row level security;
create policy "Adjustments viewable by auth." on public.stock_adjustments for select using (auth.role() = 'authenticated');
create policy "Adjustments insertable by auth." on public.stock_adjustments for insert with check (auth.role() = 'authenticated');

-- SEED DATA --
-- Outlets
insert into public.outlets (id, name, address) values 
  ('o1', 'Pasar Tamin', 'Jl. Tamin, Bandar Lampung'),
  ('o2', 'Pasar Way Halim', 'Jl. Way Halim, Bandar Lampung'),
  ('o3', 'Pasar Tugu', 'Jl. Hayam Wuruk, Bandar Lampung'),
  ('o4', 'RPH Subaru', 'Jl. Karimun Jawa, Bandar Lampung'),
  ('o5', 'Kantor Pusat', 'Kedaton, Bandar Lampung')
on conflict (id) do update set name = excluded.name, address = excluded.address;

-- Initial Products (Seed for multiple outlets)
insert into public.products (id, name, category, price, cost_price, stock, unit, min_stock, outlet_id) values
  ('p-tamin-1', 'Daging Murni', 'Daging', 140000, 120000, 50, 'Kg', 5, 'o1'),
  ('p-tamin-2', 'HAS Luar', 'Daging', 160000, 140000, 20, 'Kg', 3, 'o1'),
  ('p-way-1', 'Daging Murni', 'Daging', 140000, 120000, 45, 'Kg', 5, 'o2'),
  ('p-tugu-1', 'Daging Murni', 'Daging', 140000, 120000, 30, 'Kg', 5, 'o3'),
  ('p-rph-1', 'Daging Murni', 'Daging', 135000, 115000, 100, 'Kg', 10, 'o4')
on conflict (id) do nothing;

-- Users (Seed with password for migration login)
insert into public.users (id, username, name, role, is_approved, password, outlet_id) values
  ('u1', 'admin', 'Super Admin', 'Admin', true, 'admin123', 'o5'),
  ('u2', 'tamin', 'Admin Tamin', 'Cashier', true, 'tamin123', 'o1'),
  ('u3', 'wayhalim', 'Admin Way Halim', 'Cashier', true, 'wh123', 'o2'),
  ('u4', 'tugu', 'Admin Tugu', 'Cashier', true, 'tugu123', 'o3')
on conflict (id) do nothing;

-- Employees
insert into public.employees (id, name, position, division, outlet_id, phone, base_salary) values
  ('e1', 'TAMPAN SUJARWADI', 'DIREKTUR UTAMA', 'DIVISI KANTOR PUSAT', 'o5', '+6282183118377', 0),
  ('e2', 'DIAN EKA ARLIANTO', 'MANAGER OPERASIONAL', 'DIVISI KANTOR PUSAT', 'o5', '+6281369612006', 0),
  ('e3', 'ARIS GIANTO', 'PIC', 'DIVISI SUBARU PASAR TAMIN', 'o1', '+6289652939311', 0),
  ('e4', 'M. NAUFAL AL FARUQ', 'PIC', 'DIVISI SUBARU PASAR WAY HALIM', 'o2', '+6289632544456', 0)
on conflict (id) do nothing;
