# Data Model — Store-It

## suppliers
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | nullable; owner ref (lock-down sprint) |
| name | text | required |
| contact_name | text | |
| contact_email | text | |
| contact_phone | text | |
| created_at | timestamptz | |

## products
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| description | text | required |
| unit | text | e.g. pcs, rolls, kg |
| min_stock_level | numeric | reorder trigger |
| current_qty | numeric | decremented on usage |
| supplier_id | uuid FK → suppliers | |
| created_at | timestamptz | |

## teams
| id | uuid PK | | name | text | | leader_name | text | | user_id | uuid | | created_at | timestamptz |

## workers
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| name | text | required |
| employee_id | text | |
| team_id | uuid FK → teams | |
| created_at | timestamptz | |

## usage_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| product_id | uuid FK → products | |
| worker_id | uuid FK → workers | |
| qty_taken | numeric | |
| recorded_by | text | name of storekeeper (pre-auth) |
| notes | text | |
| created_at | timestamptz | |

## reorder_lists
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| status | text | draft / ordered / delivered |
| generated_by | text | storekeeper name |
| ordered_by | text | purchasing officer name |
| ordered_at | timestamptz | |
| delivered_by | text | storekeeper name |
| delivered_at | timestamptz | |
| notes | text | |
| created_at | timestamptz | |

## reorder_list_items
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| reorder_list_id | uuid FK → reorder_lists CASCADE | |
| product_id | uuid FK → products | |
| qty_at_generation | numeric | snapshot at generation time |
| min_stock_level_at_generation | numeric | snapshot |
| qty_to_order | numeric | editable before ordering |
| supplier_id | uuid FK → suppliers | denormalised for quick view |
| item_status | text | pending / ordered / delivered |
| created_at | timestamptz | |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable pre-auth |
| action | text | e.g. usage_recorded, reorder_generated |
| entity_type | text | products / reorder_lists / etc. |
| entity_id | uuid | |
| payload | jsonb | full before/after snapshot |
| created_at | timestamptz | |

## RLS
- v1: permissive read + write on all tables (demo mode)
- Lock-down sprint: replace with `auth.uid() = user_id` policies per role
