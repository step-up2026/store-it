-- Sprint 4: Lock It Down (Auth & Roles)
-- Store-It is a single-organisation storeroom system, not multi-tenant SaaS: every
-- authenticated user shares the same inventory data. Row visibility is therefore
-- gated on "is authenticated", not on user_id ownership; the user_id columns from
-- v1 are left in place unused for now. Which ACTIONS a user may take is gated by
-- their profiles.role, enforced server-side in lib/actions/*.ts and lib/auth.ts.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('storekeeper', 'purchasing_officer')),
  full_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
drop policy if exists "profiles_read" on profiles;
create policy "profiles_read" on profiles for select using (auth.uid() is not null);
drop policy if exists "profiles_self_update" on profiles;
create policy "profiles_self_update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up. Role and full name come
-- from the metadata passed at signup (supabase.auth.admin.createUser / signUp).
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'storekeeper'),
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Replace v1 permissive "anyone can read/write" policies with "must be signed in".
-- Fine-grained role rules (e.g. only purchasing officers can mark Ordered) are
-- enforced in the server actions, not in RLS, per docs/SECURITY.md's Approved
-- Tools Rule: every state-changing action goes through a named server function
-- that checks the session role before executing.

drop policy if exists "suppliers_v1_read" on suppliers;
drop policy if exists "suppliers_v1_write" on suppliers;
create policy "suppliers_auth_read" on suppliers for select using (auth.uid() is not null);
create policy "suppliers_auth_write" on suppliers for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "products_v1_read" on products;
drop policy if exists "products_v1_write" on products;
create policy "products_auth_read" on products for select using (auth.uid() is not null);
create policy "products_auth_write" on products for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "teams_v1_read" on teams;
drop policy if exists "teams_v1_write" on teams;
create policy "teams_auth_read" on teams for select using (auth.uid() is not null);
create policy "teams_auth_write" on teams for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "workers_v1_read" on workers;
drop policy if exists "workers_v1_write" on workers;
create policy "workers_auth_read" on workers for select using (auth.uid() is not null);
create policy "workers_auth_write" on workers for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "usage_logs_v1_read" on usage_logs;
drop policy if exists "usage_logs_v1_write" on usage_logs;
create policy "usage_logs_auth_read" on usage_logs for select using (auth.uid() is not null);
create policy "usage_logs_auth_write" on usage_logs for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "reorder_lists_v1_read" on reorder_lists;
drop policy if exists "reorder_lists_v1_write" on reorder_lists;
create policy "reorder_lists_auth_read" on reorder_lists for select using (auth.uid() is not null);
create policy "reorder_lists_auth_write" on reorder_lists for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "reorder_list_items_v1_read" on reorder_list_items;
drop policy if exists "reorder_list_items_v1_write" on reorder_list_items;
create policy "reorder_list_items_auth_read" on reorder_list_items for select using (auth.uid() is not null);
create policy "reorder_list_items_auth_write" on reorder_list_items for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- audit_logs stays insert-only (no update/delete policy exists, even for authenticated
-- users) so entries can never be altered once written.
drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_auth_read" on audit_logs for select using (auth.uid() is not null);
create policy "audit_logs_auth_insert" on audit_logs for insert with check (auth.uid() is not null);
