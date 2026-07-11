-- Admin role, departments, and granular per-user / per-department permissions.
--
-- Model: a permission row grants view/add/edit/delete on ONE resource
-- (products, suppliers, teams) to ONE subject — either a specific user or a
-- whole department. A user's effective permission on a resource is the OR of
-- their own user-level row and their department's row. Admins bypass all
-- checks. Enforcement happens in the server actions (lib/permissions.ts),
-- consistent with the existing Approved Tools pattern; RLS gates writes on
-- these two new tables to admins only.

-- 1. Departments
create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- 2. Profiles: admin role, department assignment, email (for the admin console)
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('admin', 'storekeeper', 'purchasing_officer'));

alter table profiles add column if not exists department_id uuid references departments(id) on delete set null;
alter table profiles add column if not exists email text;

update profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'storekeeper'),
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 3. Permissions
create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('user', 'department')),
  subject_id uuid not null,
  resource text not null check (resource in ('products', 'suppliers', 'teams')),
  can_view boolean not null default false,
  can_add boolean not null default false,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  created_at timestamptz not null default now(),
  unique (subject_type, subject_id, resource)
);

-- security definer so RLS policies can call it without recursing into profiles' own policies
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer set search_path = public;

alter table departments enable row level security;
drop policy if exists "departments_read" on departments;
create policy "departments_read" on departments for select using (auth.uid() is not null);
drop policy if exists "departments_admin_write" on departments;
create policy "departments_admin_write" on departments for all using (is_admin()) with check (is_admin());

alter table permissions enable row level security;
drop policy if exists "permissions_read" on permissions;
create policy "permissions_read" on permissions for select using (auth.uid() is not null);
drop policy if exists "permissions_admin_write" on permissions;
create policy "permissions_admin_write" on permissions for all using (is_admin()) with check (is_admin());

-- Admins may update any profile (assign role / department)
drop policy if exists "profiles_admin_update" on profiles;
create policy "profiles_admin_update" on profiles for update using (is_admin()) with check (is_admin());

-- 4. Seed permissions matching pre-permission behaviour so existing accounts
-- keep working: storekeepers had full manage rights, purchasing officers were
-- view-only. Admins can reallocate from the console afterwards.
insert into permissions (subject_type, subject_id, resource, can_view, can_add, can_edit, can_delete)
select 'user', p.id, r.resource, true, true, true, true
from profiles p
cross join (values ('products'), ('suppliers'), ('teams')) as r(resource)
where p.role = 'storekeeper'
on conflict (subject_type, subject_id, resource) do nothing;

insert into permissions (subject_type, subject_id, resource, can_view, can_add, can_edit, can_delete)
select 'user', p.id, r.resource, true, false, false, false
from profiles p
cross join (values ('products'), ('suppliers'), ('teams')) as r(resource)
where p.role = 'purchasing_officer'
on conflict (subject_type, subject_id, resource) do nothing;

-- 5. Starter departments
insert into departments (name) values ('Store'), ('Purchasing'), ('Production')
on conflict (name) do nothing;
