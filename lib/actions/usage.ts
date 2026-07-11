"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import { actorName, requireRole } from "@/lib/auth";

export type UsageInput = {
  product_id: string;
  worker_id: string;
  qty_taken: number;
  notes: string;
};

export async function recordUsage(input: UsageInput) {
  if (!input.product_id) return { error: "Please select a product" };
  if (!input.worker_id) return { error: "Please select a worker" };
  if (!input.qty_taken || input.qty_taken < 1) {
    return { error: "Quantity must be at least 1" };
  }

  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data: product, error: productErr } = await supabase
    .from("products")
    .select()
    .eq("id", input.product_id)
    .single();

  if (productErr || !product) return { error: "Product not found" };

  if (input.qty_taken > product.current_qty) {
    return {
      error: `Insufficient stock — only ${product.current_qty} available`,
    };
  }

  const newQty = product.current_qty - input.qty_taken;

  const { error: updateErr } = await supabase
    .from("products")
    .update({ current_qty: newQty })
    .eq("id", input.product_id);

  if (updateErr) return { error: "Could not save. Please try again." };

  const { data: usageLog, error: usageErr } = await supabase
    .from("usage_logs")
    .insert({
      product_id: input.product_id,
      worker_id: input.worker_id,
      qty_taken: input.qty_taken,
      recorded_by: actorName(auth.profile),
      notes: input.notes.trim() || null,
    })
    .select()
    .single();

  if (usageErr) {
    // Roll back the qty decrement since the usage log failed to persist.
    await supabase
      .from("products")
      .update({ current_qty: product.current_qty })
      .eq("id", input.product_id);
    return { error: "Could not save. Please try again." };
  }

  await writeAuditLog(supabase, {
    action: "usage_recorded",
    entityType: "usage_logs",
    entityId: usageLog.id,
    userId: auth.profile.id,
    payload: {
      before: { current_qty: product.current_qty },
      after: { current_qty: newQty },
      usage: usageLog,
    },
  });

  revalidatePath("/products");
  revalidatePath("/usage");
  return { data: usageLog };
}
