create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now()
);
alter table suppliers enable row level security;
drop policy if exists "suppliers_v1_read" on suppliers;
create policy "suppliers_v1_read" on suppliers for select using (true);
drop policy if exists "suppliers_v1_write" on suppliers;
create policy "suppliers_v1_write" on suppliers for all using (true) with check (true);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  description text not null,
  unit text not null,
  min_stock_level numeric not null default 0,
  current_qty numeric not null default 0,
  supplier_id uuid references suppliers(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table products enable row level security;
drop policy if exists "products_v1_read" on products;
create policy "products_v1_read" on products for select using (true);
drop policy if exists "products_v1_write" on products;
create policy "products_v1_write" on products for all using (true) with check (true);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  leader_name text,
  created_at timestamptz not null default now()
);
alter table teams enable row level security;
drop policy if exists "teams_v1_read" on teams;
create policy "teams_v1_read" on teams for select using (true);
drop policy if exists "teams_v1_write" on teams;
create policy "teams_v1_write" on teams for all using (true) with check (true);

create table if not exists workers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  employee_id text,
  team_id uuid references teams(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table workers enable row level security;
drop policy if exists "workers_v1_read" on workers;
create policy "workers_v1_read" on workers for select using (true);
drop policy if exists "workers_v1_write" on workers;
create policy "workers_v1_write" on workers for all using (true) with check (true);

create table if not exists usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  product_id uuid references products(id) on delete restrict,
  worker_id uuid references workers(id) on delete set null,
  qty_taken numeric not null,
  recorded_by text,
  notes text,
  created_at timestamptz not null default now()
);
alter table usage_logs enable row level security;
drop policy if exists "usage_logs_v1_read" on usage_logs;
create policy "usage_logs_v1_read" on usage_logs for select using (true);
drop policy if exists "usage_logs_v1_write" on usage_logs;
create policy "usage_logs_v1_write" on usage_logs for all using (true) with check (true);

create table if not exists reorder_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  status text not null default 'draft',
  generated_by text,
  ordered_by text,
  ordered_at timestamptz,
  delivered_by text,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
alter table reorder_lists enable row level security;
drop policy if exists "reorder_lists_v1_read" on reorder_lists;
create policy "reorder_lists_v1_read" on reorder_lists for select using (true);
drop policy if exists "reorder_lists_v1_write" on reorder_lists;
create policy "reorder_lists_v1_write" on reorder_lists for all using (true) with check (true);

create table if not exists reorder_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  reorder_list_id uuid references reorder_lists(id) on delete cascade,
  product_id uuid references products(id) on delete restrict,
  qty_at_generation numeric not null,
  min_stock_level_at_generation numeric not null,
  qty_to_order numeric not null,
  supplier_id uuid references suppliers(id) on delete set null,
  item_status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table reorder_list_items enable row level security;
drop policy if exists "reorder_list_items_v1_read" on reorder_list_items;
create policy "reorder_list_items_v1_read" on reorder_list_items for select using (true);
drop policy if exists "reorder_list_items_v1_write" on reorder_list_items;
create policy "reorder_list_items_v1_write" on reorder_list_items for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into suppliers (id, name, contact_name, contact_email, contact_phone) values
  ('a1000000-0000-0000-0000-000000000001', 'FastFix Industrial Supplies', 'Ahmad Razak', 'ahmad@fastfix.com', '+60-12-3456789'),
  ('a1000000-0000-0000-0000-000000000002', 'ProTech Hardware Sdn Bhd', 'Lim Wei Kang', 'weikang@protech.com.my', '+60-11-9876543'),
  ('a1000000-0000-0000-0000-000000000003', 'SafeGuard Safety Equipment', 'Nora Hashim', 'nora@safeguard.com.my', '+60-3-8888-0000');

insert into teams (id, name, leader_name) values
  ('b1000000-0000-0000-0000-000000000001', 'Assembly Line A', 'Zulkifli Bin Osman'),
  ('b1000000-0000-0000-0000-000000000002', 'Welding & Fabrication', 'Rajan Krishnan'),
  ('b1000000-0000-0000-0000-000000000003', 'Packaging & Dispatch', 'Siti Aminah Binte Yusof');

insert into workers (id, name, employee_id, team_id) values
  ('c1000000-0000-0000-0000-000000000001', 'Hairul Anuar', 'EMP-001', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'Tan Chee Keong', 'EMP-002', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000003', 'Mohamad Faiz', 'EMP-003', 'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000004', 'Selvam Pillai', 'EMP-004', 'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000005', 'Nurul Ain', 'EMP-005', 'b1000000-0000-0000-0000-000000000003');

insert into products (id, description, unit, min_stock_level, current_qty, supplier_id) values
  ('d1000000-0000-0000-0000-000000000001', 'Cutting Disc 4" (Metal)', 'pcs', 20, 8, 'a1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000002', 'Safety Gloves (Medium)', 'pairs', 30, 12, 'a1000000-0000-0000-0000-000000000003'),
  ('d1000000-0000-0000-0000-000000000003', 'Masking Tape 2"', 'rolls', 15, 22, 'a1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000004', 'Welding Rod E6013 (2.5mm)', 'kg', 10, 4, 'a1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000005', 'Cable Tie 300mm', 'packs', 10, 10, 'a1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000006', 'Safety Helmet (White)', 'pcs', 5, 3, 'a1000000-0000-0000-0000-000000000003');

insert into usage_logs (product_id, worker_id, qty_taken, recorded_by, notes) values
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 5, 'Storekeeper (Demo)', 'Cutting job on Lot A'),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 2, 'Storekeeper (Demo)', 'Replacement for worn pairs'),
  ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 3, 'Storekeeper (Demo)', 'Welding frame structure');

insert into reorder_lists (id, status, generated_by, notes) values
  ('e1000000-0000-0000-0000-000000000001', 'draft', 'Storekeeper (Demo)', 'Auto-generated: items at or below minimum stock');

insert into reorder_list_items (reorder_list_id, product_id, qty_at_generation, min_stock_level_at_generation, qty_to_order, supplier_id, item_status) values
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 8, 20, 30, 'a1000000-0000-0000-0000-000000000001', 'pending'),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 12, 30, 50, 'a1000000-0000-0000-0000-000000000003', 'pending'),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 4, 10, 20, 'a1000000-0000-0000-0000-000000000002', 'pending'),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000006', 3, 5, 10, 'a1000000-0000-0000-0000-000000000003', 'pending');