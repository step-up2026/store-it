# PRD — Store-It

## Problem
The production storeroom has no system to track consumable product usage. Stock levels are unknown until a physical count. Purchasing officers cannot see what's low, who took what, or whether a reorder was received. Everything is manual and error-prone.

## Target Users
- **Storekeeper** — records usage, generates reorder lists, marks deliveries received
- **Purchasing Officer** — monitors stock levels, tracks usage per worker, marks items ordered, confirms deliveries

## Core Objects
| Object | Purpose |
|---|---|
| Product | Consumable item with qty, unit, min stock, supplier |
| Supplier | Supplier directory |
| Team | Production team with a named leader |
| Worker | Individual worker belonging to a team |
| Usage Log | Record of one worker taking a qty of one product |
| Reorder List | On-demand list of products at/below min stock |
| Reorder List Item | One product line within a reorder list |
| Audit Log | Immutable record of every meaningful action |

## MVP Must-Haves (v1)
- [ ] Product catalogue: add/edit/delete consumables (description, unit, min stock level, current qty, supplier)
- [ ] Supplier directory: add/edit/delete
- [ ] Team & worker directory: add/edit/delete
- [ ] Usage recording: storekeeper selects worker + product + qty → current qty decrements instantly
- [ ] On-demand reorder list: button generates list of all products where `current_qty ≤ min_stock_level`
- [ ] Reorder list status flow: Draft → Ordered → Delivered; Delivered increments stock
- [ ] Stock level indicators on product list (OK / Low / Critical)
- [ ] App viewable without login (demo mode with seed data)

## Non-Goals (v1)
- Excel/CSV import
- Email or push notifications
- Mobile barcode scanning
- Multi-tenant / SaaS features
- AI-generated reorder quantities

## Success Criteria
Storekeeper opens the app → sees 6 seeded products with live qty badges → records that Worker "Hairul Anuar" took 7× Cutting Disc → qty drops from 8 to 1 (below min 20) → clicks **Generate Reorder List** → product appears in new Draft list → Purchasing Officer opens list, marks it Ordered → Storekeeper marks it Delivered → stock qty increments → audit log records every step.
