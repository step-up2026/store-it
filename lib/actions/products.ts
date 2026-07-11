"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import { requireRole } from "@/lib/auth";

export type ProductInput = {
  description: string;
  unit: string;
  min_stock_level: number;
  current_qty: number;
  supplier_id: string | null;
};

function validate(input: ProductInput): string | null {
  if (!input.description.trim()) return "Description is required";
  if (!input.unit.trim()) return "Unit is required";
  if (input.min_stock_level < 0) return "Min stock level cannot be negative";
  if (input.current_qty < 0) return "Quantity cannot be negative";
  return null;
}

export async function createProduct(input: ProductInput) {
  const err = validate(input);
  if (err) return { error: err };

  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data, error } = await supabase
    .from("products")
    .insert({
      description: input.description.trim(),
      unit: input.unit.trim(),
      min_stock_level: input.min_stock_level,
      current_qty: input.current_qty,
      supplier_id: input.supplier_id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "product_created",
    entityType: "products",
    entityId: data.id,
    userId: auth.profile.id,
    payload: { after: data },
  });

  revalidatePath("/products");
  return { data };
}

export async function updateProduct(id: string, input: ProductInput) {
  const err = validate(input);
  if (err) return { error: err };

  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data: before } = await supabase
    .from("products")
    .select()
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("products")
    .update({
      description: input.description.trim(),
      unit: input.unit.trim(),
      min_stock_level: input.min_stock_level,
      current_qty: input.current_qty,
      supplier_id: input.supplier_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "product_updated",
    entityType: "products",
    entityId: id,
    userId: auth.profile.id,
    payload: { before, after: data },
  });

  revalidatePath("/products");
  return { data };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data: before } = await supabase
    .from("products")
    .select()
    .eq("id", id)
    .single();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        error:
          "Cannot delete: this product has usage or reorder history. Remove that history first.",
      };
    }
    return { error: error.message };
  }

  await writeAuditLog(supabase, {
    action: "product_deleted",
    entityType: "products",
    entityId: id,
    userId: auth.profile.id,
    payload: { before },
  });

  revalidatePath("/products");
  return { data: true };
}
