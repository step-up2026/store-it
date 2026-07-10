# Intelligence Layer — Store-It

## v1 — Rule-Based (No AI Required)
All logic is deterministic and runs without any ML model.

| Signal | Rule | Output |
|---|---|---|
| `current_qty ≤ min_stock_level` | Hard threshold | Red badge; eligible for reorder list |
| `current_qty ≤ min_stock_level × 1.5` | Soft threshold | Amber badge |
| `current_qty > min_stock_level × 1.5` | OK | Green badge |

**Reorder quantity default:** `qty_to_order = min_stock_level × 2 - current_qty` (editable by purchasing officer before ordering).

## Events Tracked
- Product added / edited / deleted
- Usage recorded (product_id, worker_id, qty_taken, timestamp)
- Reorder list generated (snapshot of all low-stock items)
- Reorder list status changed (ordered, delivered)
- Stock incremented on delivery

## Later — AI Fields (when usage history is rich enough)
For any AI-generated field (e.g. suggested_reorder_qty), store:
```json
{
  "value": 50,
  "source": "usage_trend_model_v1",
  "confidence": 0.82,
  "review_status": "unreviewed"
}
```
Purchasing officer reviews and approves/overrides before the order is placed.

## What Gets Ranked (Later)
- Products by days-until-stockout (rolling 30-day usage rate ÷ current_qty)
- Workers by highest consumable usage volume
- Suppliers by average delivery lead time
