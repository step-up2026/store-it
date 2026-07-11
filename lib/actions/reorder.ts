"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import { actorName, requireRole } from "@/lib/auth";
import { suggestedReorderQty } from "@/lib/stock";

export async function generateReorderList() {
  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data: products, error: productsErr } = await supabase
    .from("products")
    .select()
    .order("description");

  if (productsErr) return { error: productsErr.message };

  const lowStock = (products ?? []).filter(
    (p) => p.current_qty <= p.min_stock_level,
  );

  if (lowStock.length === 0) {
    return { error: "All stock levels are healthy" };
  }

  const { data: list, error: listErr } = await supabase
    .from("reorder_lists")
    .insert({
      status: "draft",
      generated_by: actorName(auth.profile),
    })
    .select()
    .single();

  if (listErr) return { error: listErr.message };

  const items = lowStock.map((p) => ({
    reorder_list_id: list.id,
    product_id: p.id,
    qty_at_generation: p.current_qty,
    min_stock_level_at_generation: p.min_stock_level,
    qty_to_order: suggestedReorderQty(p.min_stock_level, p.current_qty),
    supplier_id: p.supplier_id,
    item_status: "pending",
  }));

  const { error: itemsErr } = await supabase
    .from("reorder_list_items")
    .insert(items);

  if (itemsErr) {
    await supabase.from("reorder_lists").delete().eq("id", list.id);
    return { error: "Could not save. Please try again." };
  }

  await writeAuditLog(supabase, {
    action: "reorder_generated",
    entityType: "reorder_lists",
    entityId: list.id,
    userId: auth.profile.id,
    payload: { list, items },
  });

  revalidatePath("/reorder-lists");
  revalidatePath("/products");
  return { data: list };
}

export async function updateReorderItemQty(itemId: string, qty: number) {
  if (qty < 0) return { error: "Quantity cannot be negative" };

  const supabase = await createClient();
  const auth = await requireRole(supabase, ["purchasing_officer"]);
  if ("error" in auth) return auth;

  const { data: item, error } = await supabase
    .from("reorder_list_items")
    .select("*, reorder_lists!inner(status)")
    .eq("id", itemId)
    .single();

  if (error || !item) return { error: "Item not found" };
  if (item.reorder_lists.status !== "draft") {
    return { error: "Cannot edit quantity after the list has been ordered" };
  }

  const { error: updateErr } = await supabase
    .from("reorder_list_items")
    .update({ qty_to_order: qty })
    .eq("id", itemId);

  if (updateErr) return { error: updateErr.message };

  revalidatePath(`/reorder-lists/${item.reorder_list_id}`);
  return { data: true };
}

export async function markReorderOrdered(listId: string) {
  const supabase = await createClient();
  const auth = await requireRole(supabase, ["purchasing_officer"]);
  if ("error" in auth) return auth;

  const { data: list, error: listErr } = await supabase
    .from("reorder_lists")
    .select()
    .eq("id", listId)
    .single();

  if (listErr || !list) return { error: "Reorder list not found" };
  if (list.status !== "draft") {
    return { error: "Only draft lists can be marked as ordered" };
  }

  const orderedAt = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("reorder_lists")
    .update({
      status: "ordered",
      ordered_by: actorName(auth.profile),
      ordered_at: orderedAt,
    })
    .eq("id", listId)
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase
    .from("reorder_list_items")
    .update({ item_status: "ordered" })
    .eq("reorder_list_id", listId);

  await writeAuditLog(supabase, {
    action: "reorder_ordered",
    entityType: "reorder_lists",
    entityId: listId,
    userId: auth.profile.id,
    payload: { before: list, after: updated },
  });

  revalidatePath("/reorder-lists");
  revalidatePath(`/reorder-lists/${listId}`);
  return { data: updated };
}

export async function markReorderDelivered(listId: string) {
  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data: list, error: listErr } = await supabase
    .from("reorder_lists")
    .select()
    .eq("id", listId)
    .single();

  if (listErr || !list) return { error: "Reorder list not found" };
  if (list.status !== "ordered") {
    return { error: "Cannot mark Delivered before the list is Ordered" };
  }

  const { data: items, error: itemsErr } = await supabase
    .from("reorder_list_items")
    .select()
    .eq("reorder_list_id", listId);

  if (itemsErr || !items) return { error: "Could not load list items" };

  const stockUpdates: { product_id: string; before: number; after: number }[] =
    [];

  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("id, current_qty")
      .eq("id", item.product_id)
      .single();
    if (!product) continue;

    const newQty = product.current_qty + item.qty_to_order;
    await supabase
      .from("products")
      .update({ current_qty: newQty })
      .eq("id", item.product_id);

    stockUpdates.push({
      product_id: item.product_id,
      before: product.current_qty,
      after: newQty,
    });
  }

  const deliveredAt = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("reorder_lists")
    .update({
      status: "delivered",
      delivered_by: actorName(auth.profile),
      delivered_at: deliveredAt,
    })
    .eq("id", listId)
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase
    .from("reorder_list_items")
    .update({ item_status: "delivered" })
    .eq("reorder_list_id", listId);

  await writeAuditLog(supabase, {
    action: "reorder_delivered",
    entityType: "reorder_lists",
    entityId: listId,
    userId: auth.profile.id,
    payload: { before: list, after: updated, stockUpdates },
  });

  revalidatePath("/reorder-lists");
  revalidatePath(`/reorder-lists/${listId}`);
  revalidatePath("/products");
  return { data: updated };
}
