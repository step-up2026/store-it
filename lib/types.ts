export type Supplier = {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  description: string;
  unit: string;
  min_stock_level: number;
  current_qty: number;
  supplier_id: string | null;
  created_at: string;
  supplier?: Pick<Supplier, "id" | "name"> | null;
};

export type Team = {
  id: string;
  name: string;
  leader_name: string | null;
  created_at: string;
};

export type Worker = {
  id: string;
  name: string;
  employee_id: string | null;
  team_id: string | null;
  created_at: string;
  team?: Pick<Team, "id" | "name"> | null;
};

export type UsageLog = {
  id: string;
  product_id: string;
  worker_id: string | null;
  qty_taken: number;
  recorded_by: string | null;
  notes: string | null;
  created_at: string;
  product?: Pick<Product, "id" | "description" | "unit"> | null;
  worker?: Pick<Worker, "id" | "name"> | null;
};

export type ReorderListStatus = "draft" | "ordered" | "delivered";

export type ReorderList = {
  id: string;
  status: ReorderListStatus;
  generated_by: string | null;
  ordered_by: string | null;
  ordered_at: string | null;
  delivered_by: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
};

export type ReorderListItemStatus = "pending" | "ordered" | "delivered";

export type ReorderListItem = {
  id: string;
  reorder_list_id: string;
  product_id: string;
  qty_at_generation: number;
  min_stock_level_at_generation: number;
  qty_to_order: number;
  supplier_id: string | null;
  item_status: ReorderListItemStatus;
  created_at: string;
  product?: Pick<Product, "id" | "description" | "unit"> | null;
  supplier?: Pick<Supplier, "id" | "name"> | null;
};

export type AuditLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export type StockStatus = "ok" | "low" | "critical";
