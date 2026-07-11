"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export type SupplierInput = {
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
};

export async function createSupplier(input: SupplierInput) {
  if (!input.name.trim()) return { error: "Supplier name is required" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      name: input.name.trim(),
      contact_name: input.contact_name.trim() || null,
      contact_email: input.contact_email.trim() || null,
      contact_phone: input.contact_phone.trim() || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "supplier_created",
    entityType: "suppliers",
    entityId: data.id,
    payload: { after: data },
  });

  revalidatePath("/suppliers");
  revalidatePath("/products");
  return { data };
}

export async function updateSupplier(id: string, input: SupplierInput) {
  if (!input.name.trim()) return { error: "Supplier name is required" };

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("suppliers")
    .select()
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("suppliers")
    .update({
      name: input.name.trim(),
      contact_name: input.contact_name.trim() || null,
      contact_email: input.contact_email.trim() || null,
      contact_phone: input.contact_phone.trim() || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "supplier_updated",
    entityType: "suppliers",
    entityId: id,
    payload: { before, after: data },
  });

  revalidatePath("/suppliers");
  revalidatePath("/products");
  return { data };
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient();
  const { data: before } = await supabase
    .from("suppliers")
    .select()
    .eq("id", id)
    .single();

  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "supplier_deleted",
    entityType: "suppliers",
    entityId: id,
    payload: { before },
  });

  revalidatePath("/suppliers");
  revalidatePath("/products");
  return { data: true };
}
