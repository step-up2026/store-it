# Test Plan — Store-It

## Success Scenario (manual, end-to-end)

1. Open `/products` in incognito — 6 products visible, qty badges correct (Cutting Disc = amber/red at qty 8 vs min 20).
2. Click **Add Product** → fill description "Test Tape", unit "rolls", min stock 5, qty 10, supplier "FastFix" → Save → row appears in table.
3. Refresh page → "Test Tape" still present (confirms DB write, not local state).
4. Navigate to `/usage/new` → select worker "Hairul Anuar", product "Cutting Disc 4\"", qty 7 → Submit.
5. Confirm: Cutting Disc qty = 1, badge = red (below min 20). Usage history row appears.
6. Attempt to record qty 5 for Cutting Disc (stock = 1) → error: "Insufficient stock — only 1 available".
7. Return to `/products` → click **Generate Reorder List** → confirm dialog → new Draft list created.
8. Open `/reorder-lists` → Draft list appears with 4 items (Cutting Disc, Safety Gloves, Welding Rod, Safety Helmet).
9. Open list detail → edit `qty_to_order` for Cutting Disc from default to 50 → click **Mark as Ordered** → status = Ordered, ordered_at timestamp shown.
10. Click **Mark as Delivered** → status = Delivered, Cutting Disc qty increments by 50 → new qty = 51.
11. Open `/usage` history → 3 seed entries + 1 new entry for Hairul Anuar visible.
12. Check audit_logs (Supabase table editor) — entries for: usage_recorded, reorder_generated, reorder_ordered, reorder_delivered.

## Empty State Tests
- Delete all products → `/products` shows "No consumable products yet — add one or import from Excel".
- No low-stock items → **Generate Reorder List** button disabled with tooltip "All stock levels are healthy".
- No usage logs → `/usage` shows "No usage recorded yet".
- No reorder lists → `/reorder-lists` shows "No reorder lists yet — generate one from the Products page".

## Error State Tests
- Submit usage form with qty = 0 → inline validation: "Quantity must be at least 1".
- Submit usage form without selecting a worker → "Please select a worker".
- Supabase offline simulation → error toast: "Could not save. Please try again." — no partial state written.
- Attempt Mark Delivered before Ordered → button disabled; direct API call returns 400.

## Permission Tests (Sprint 4)
- Unauthenticated GET `/products` → 302 redirect to `/login`.
- Storekeeper token → POST to mark-ordered endpoint → 403 Forbidden.
- Purchasing officer token → POST to record-usage endpoint → 403 Forbidden.
