"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";
import { requireRole } from "@/lib/auth";

export type TeamInput = { name: string; leader_name: string };
export type WorkerInput = {
  name: string;
  employee_id: string;
  team_id: string | null;
};

export async function createTeam(input: TeamInput) {
  if (!input.name.trim()) return { error: "Team name is required" };

  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data, error } = await supabase
    .from("teams")
    .insert({
      name: input.name.trim(),
      leader_name: input.leader_name.trim() || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "team_created",
    entityType: "teams",
    entityId: data.id,
    userId: auth.profile.id,
    payload: { after: data },
  });

  revalidatePath("/teams");
  return { data };
}

export async function updateTeam(id: string, input: TeamInput) {
  if (!input.name.trim()) return { error: "Team name is required" };

  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data: before } = await supabase
    .from("teams")
    .select()
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("teams")
    .update({
      name: input.name.trim(),
      leader_name: input.leader_name.trim() || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "team_updated",
    entityType: "teams",
    entityId: id,
    userId: auth.profile.id,
    payload: { before, after: data },
  });

  revalidatePath("/teams");
  return { data };
}

export async function deleteTeam(id: string) {
  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data: before } = await supabase
    .from("teams")
    .select()
    .eq("id", id)
    .single();

  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "team_deleted",
    entityType: "teams",
    entityId: id,
    userId: auth.profile.id,
    payload: { before },
  });

  revalidatePath("/teams");
  return { data: true };
}

export async function createWorker(input: WorkerInput) {
  if (!input.name.trim()) return { error: "Worker name is required" };

  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data, error } = await supabase
    .from("workers")
    .insert({
      name: input.name.trim(),
      employee_id: input.employee_id.trim() || null,
      team_id: input.team_id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "worker_created",
    entityType: "workers",
    entityId: data.id,
    userId: auth.profile.id,
    payload: { after: data },
  });

  revalidatePath("/teams");
  return { data };
}

export async function updateWorker(id: string, input: WorkerInput) {
  if (!input.name.trim()) return { error: "Worker name is required" };

  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data: before } = await supabase
    .from("workers")
    .select()
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("workers")
    .update({
      name: input.name.trim(),
      employee_id: input.employee_id.trim() || null,
      team_id: input.team_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "worker_updated",
    entityType: "workers",
    entityId: id,
    userId: auth.profile.id,
    payload: { before, after: data },
  });

  revalidatePath("/teams");
  return { data };
}

export async function deleteWorker(id: string) {
  const supabase = await createClient();
  const auth = await requireRole(supabase, ["storekeeper"]);
  if ("error" in auth) return auth;

  const { data: before } = await supabase
    .from("workers")
    .select()
    .eq("id", id)
    .single();

  const { error } = await supabase.from("workers").delete().eq("id", id);
  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "worker_deleted",
    entityType: "workers",
    entityId: id,
    userId: auth.profile.id,
    payload: { before },
  });

  revalidatePath("/teams");
  return { data: true };
}
