import type { SupabaseClient } from "@supabase/supabase-js";
import { getSessionProfile, type SessionProfile } from "@/lib/auth";

export type Resource = "products" | "suppliers" | "teams";
export type PermAction = "view" | "add" | "edit" | "delete";

export type ResourcePerms = {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
};

export type PermissionMap = Record<Resource, ResourcePerms>;

const NONE: ResourcePerms = { view: false, add: false, edit: false, delete: false };
const ALL: ResourcePerms = { view: true, add: true, edit: true, delete: true };

export const RESOURCES: Resource[] = ["products", "suppliers", "teams"];

export function emptyPermissionMap(): PermissionMap {
  return { products: { ...NONE }, suppliers: { ...NONE }, teams: { ...NONE } };
}

type PermissionRow = {
  subject_type: "user" | "department";
  subject_id: string;
  resource: Resource;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

// Effective permission = OR of the user's own row and their department's row.
export async function getPermissions(
  supabase: SupabaseClient,
  profile: SessionProfile | null,
): Promise<PermissionMap> {
  if (!profile) return emptyPermissionMap();
  if (profile.role === "admin") {
    return { products: { ...ALL }, suppliers: { ...ALL }, teams: { ...ALL } };
  }

  let query = supabase
    .from("permissions")
    .select("subject_type, subject_id, resource, can_view, can_add, can_edit, can_delete");

  if (profile.department_id) {
    query = query.or(
      `and(subject_type.eq.user,subject_id.eq.${profile.id}),and(subject_type.eq.department,subject_id.eq.${profile.department_id})`,
    );
  } else {
    query = query.eq("subject_type", "user").eq("subject_id", profile.id);
  }

  const { data } = await query;
  const map = emptyPermissionMap();

  for (const row of (data ?? []) as PermissionRow[]) {
    const perms = map[row.resource];
    if (!perms) continue;
    perms.view = perms.view || row.can_view;
    perms.add = perms.add || row.can_add;
    perms.edit = perms.edit || row.can_edit;
    perms.delete = perms.delete || row.can_delete;
  }

  return map;
}

export async function requirePermission(
  supabase: SupabaseClient,
  resource: Resource,
  action: PermAction,
): Promise<{ profile: SessionProfile } | { error: string }> {
  const profile = await getSessionProfile(supabase);
  if (!profile) return { error: "Not authenticated" };

  const perms = await getPermissions(supabase, profile);
  if (!perms[resource][action]) {
    return {
      error: `Forbidden — you don't have ${action} permission on ${resource}`,
    };
  }
  return { profile };
}

export async function requireAdmin(
  supabase: SupabaseClient,
): Promise<{ profile: SessionProfile } | { error: string }> {
  const profile = await getSessionProfile(supabase);
  if (!profile) return { error: "Not authenticated" };
  if (profile.role !== "admin") {
    return { error: "Forbidden — administrator access required" };
  }
  return { profile };
}
