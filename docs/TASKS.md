# Tasks — Store-It

## Sprint 1 — Database & Core CRUD (Demo-Ready)
**Goal:** All tables exist, seed data loads, product/supplier/team/worker CRUD works without login.

- [ ] Apply migration SQL to Supabase (tables, RLS v1 policies, seed data)
- [ ] `/products` page: table with qty badge, add/edit/delete modal, empty state ("No products yet — add one")
- [ ] `/suppliers` page: list with add/edit/delete
- [ ] `/teams` page: team list with workers nested, add/edit/delete
- [ ] Loading skeleton, empty state, and error toast on every list page
- [ ] Navbar with links: Products | Suppliers | Teams | Usage Log | Reorder Lists
- [ ] Homepage (`/`) redirects to `/products` — shows seed data, no login wall

**Definition of Done:** Open `/products` in incognito → 6 seeded products visible with badges → can add a new product → product persists after page refresh.

---

## Sprint 2 — Core Engine: Usage Recording ✅ v1 functional milestone
**Goal:** Recording a usage decrements stock and logs the event end-to-end.

- [ ] `/usage/new` form: select worker (autocomplete by team), select product, enter qty, optional notes, submit
- [ ] Server action: validate qty_taken ≤ current_qty; atomic update `products.current_qty` + insert `usage_logs`; write audit log
- [ ] Error state: "Insufficient stock" if qty_taken > current_qty
- [ ] `/usage` history page: sortable table (date, worker, product, qty); filter by product and worker
- [ ] Stock badge auto-updates after usage (green/amber/red)
- [ ] Empty usage log state: "No usage recorded yet"

**Definition of Done:** Record usage of 7× Cutting Disc (stock 8) → qty becomes 1 → badge turns red → usage history shows entry → page refresh confirms persisted values.

---

## Sprint 3 — Reorder List Engine
**Goal:** Full Draft→Ordered→Delivered cycle works and updates stock.

- [ ] **Generate Reorder List** button on `/products`: queries `current_qty ≤ min_stock_level`, creates `reorder_lists` row + `reorder_list_items` rows with snapshots; disabled if no products are low
- [ ] `/reorder-lists` index: list of all reorder lists with status badge and date
- [ ] `/reorder-lists/[id]` detail: table of items, editable `qty_to_order`, supplier shown
- [ ] **Mark as Ordered** button (purchasing officer): sets `reorder_lists.status = 'ordered'`, sets `ordered_at`, writes audit log
- [ ] **Mark as Delivered** button (storekeeper): sets status = 'delivered', increments `products.current_qty` per item, writes audit log
- [ ] Empty state: "No reorder lists yet — generate one from the Products page"
- [ ] Guard: cannot mark Delivered before Ordered

**Definition of Done:** Full cycle — Generate → Draft list appears → Mark Ordered → Mark Delivered → Cutting Disc qty increments correctly → audit log has 3 entries.

---

## Sprint 4 — Lock It Down (Auth & Roles)
**Goal:** Only authorised personnel can access the app; roles restrict actions.

- [ ] Enable Supabase Auth; add `role` column to auth metadata (`storekeeper` / `purchasing_officer`)
- [ ] `/login` page with email/password form; redirect to `/products` on success
- [ ] Middleware: unauthenticated requests redirect to `/login`
- [ ] Replace v1 permissive RLS policies with `auth.uid() = user_id` policies
- [ ] Seed rows get `user_id = null`; add migration to re-assign or drop seed rows
- [ ] UI gates: hide Mark Ordered from storekeeper; hide Mark Delivered from purchasing officer
- [ ] Server-side role check on every state-changing API route
- [ ] Logout button in navbar

**Definition of Done:** Unauthenticated visit → redirected to `/login`. Storekeeper login → cannot see Mark Ordered button. Purchasing officer login → cannot see Record Usage button.

---

## Sprint 5 — Excel Import & Reporting
**Goal:** Bulk product import and usage reporting for purchasing officer.

- [ ] `/products/import` page: upload `.xlsx` or `.csv`, parse client-side, preview table, confirm to bulk-insert
- [ ] Validation: reject rows missing description or unit; show row-level errors
- [ ] Usage report page: date-range filter, per-product and per-worker consumption totals
- [ ] Purchasing officer delivery confirmation summary view
- [ ] Print/PDF export for reorder list detail page

**Definition of Done:** Upload a 10-row CSV → 10 products appear in catalogue after confirmation → usage report shows correct totals for selected date range.

---

## Gantt (Sprint → Feature)
```
Sprint 1  |--- DB schema + seed + Product/Supplier/Team CRUD ---|
Sprint 2  |--- Usage recording + qty decrement (v1 functional) ---|
Sprint 3  |--- Reorder list engine (Draft→Ordered→Delivered) ---|
Sprint 4  |--- Auth + roles + RLS lock-down ---|
Sprint 5  |--- Excel import + reporting ---|
```
