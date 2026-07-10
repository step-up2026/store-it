# Security — Store-It

## Secrets
- Supabase URL and `anon` key in `NEXT_PUBLIC_SUPABASE_*` env vars only — never hardcoded
- `service_role` key used only in server-side API routes (never sent to browser)
- `.env.local` in `.gitignore`; no secrets in client bundles

## Permission Model
| Phase | Model |
|---|---|
| v1 demo | Permissive RLS: all tables readable and writable by anyone (seed data visible) |
| Lock-down sprint | `auth.uid() = user_id` RLS; role column (`storekeeper` / `purchasing_officer`) gates UI routes and API actions |

## Role Boundaries (lock-down sprint)
- **Storekeeper:** record usage, generate reorder list, mark Delivered, manage products/suppliers/teams/workers
- **Purchasing Officer:** view stock & usage history, mark Ordered, confirm delivery receipt — cannot edit products or record usage
- Neither role can delete records with history; deletion is admin-only

## Approved Tools Rule
- Agent actions call named server functions only (`generate_reorder_list`, `mark_reorder_delivered`, etc.)
- No `run_any_sql` or `eval` patterns permitted
- Every agent action is wrapped in a server-side route that checks session role before executing

## Audit Principle
- Every state-changing action writes to `audit_logs` server-side (cannot be skipped from the client)
- `audit_logs` rows are insert-only; no update or delete policy exists even in v1
- Audit entries carry full before/after payload in jsonb for traceability
