# Architecture — Store-It

## Stack
- **Frontend:** Next.js 14 (App Router) — TypeScript
- **Database + Auth:** Supabase (Postgres, RLS, Auth)
- **Hosting:** Vercel

## What's Built Now vs Later
| Now (v1) | Later |
|---|---|
| Product/supplier/team/worker CRUD | Excel import |
| Usage recording + qty decrement | Email alerts on low stock |
| On-demand reorder list generation | AI reorder qty suggestions |
| Draft→Ordered→Delivered status flow | Barcode scan |
| Demo mode — no login required | Auth + role-scoped RLS (lock-down sprint) |

## Key Action Flow — Record a Usage
1. **Capture** — Storekeeper fills form: pick worker, pick product, enter qty taken
2. **Validate** — Server checks qty_taken ≤ current_qty; rejects if not
3. **Store** — Supabase transaction: insert `usage_logs` row + decrement `products.current_qty`
4. **Show** — Product list re-fetches; qty badge updates; usage history table appends row
5. **Flag** — If new qty ≤ min_stock_level, product badge turns red (no auto-action yet)
6. **Generate** — Storekeeper clicks Generate Reorder List; server queries all red products and inserts `reorder_lists` + `reorder_list_items` rows
7. **Act** — Purchasing officer marks Ordered; storekeeper marks Delivered (qty increments); audit log written at each step

## Layer Order
1. **Data layer first** — tables, constraints, RLS policies, seed data
2. **App logic** — CRUD pages, usage form, reorder engine (all deterministic, no AI dependency)
3. **Smart features** — usage trend analysis, reorder qty suggestions (later sprints)

The core inventory and reorder engine runs fully without any AI component.
