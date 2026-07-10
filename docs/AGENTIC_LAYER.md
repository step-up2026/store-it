# Agentic Layer — Store-It

## Risk Classification & Actions

### Low Risk — Auto-execute, log result
| Action | Trigger | Tool |
|---|---|---|
| Apply stock-level badge (green/amber/red) | On any qty change | `compute_stock_status` |
| Snapshot product fields into reorder list item | On reorder list generation | `snapshot_product_to_item` |
| Write audit log entry | After every state-changing operation | `write_audit_log` |

### Medium Risk — Draft shown to user; one-click approval
| Action | Who approves | Tool |
|---|---|---|
| Generate reorder list (auto-select low-stock products) | Storekeeper clicks Confirm | `generate_reorder_list` |
| Suggest qty_to_order value | Purchasing officer edits/approves | `suggest_reorder_qty` |

### High Risk — Explicit approval required, action logged
| Action | Who approves | Tool |
|---|---|---|
| Mark reorder list as Ordered (commits purchase intent) | Purchasing officer confirms | `mark_reorder_ordered` |
| Mark reorder list as Delivered + increment stock | Storekeeper confirms | `mark_reorder_delivered` |

### Critical — Human only, no agent
| Action | Reason |
|---|---|
| Delete a product with usage history | Data-loss risk; must be a conscious human decision |
| Bulk-clear all usage logs | Irreversible; legal/audit implications |
| Modify audit_logs table | Audit integrity — never writable post-insert |

## Audit Log Fields (every action)
`action`, `entity_type`, `entity_id`, `user_id`, `payload (before/after)`, `created_at`

## v1 vs Later
- **v1:** Only low-risk auto-actions (badges, snapshots, audit writes)
- **Next:** Medium-risk reorder suggestion with approval UI
- **Later:** Notification agent drafts supplier email for purchasing officer approval (high risk)
