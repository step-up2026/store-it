"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit";
import { requireAdmin, RESOURCES, type Resource } from "@/lib/permissions";
import type { Role } from "@/lib/auth";

export async function createDepartment(name: string) {
  if (!name.trim()) return { error: "Department name is required" };

  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if ("error" in auth) return auth;

  const { data, error } = await supabase
    .from("departments")
    .insert({ name: name.trim() })
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "department_created",
    entityType: "departments",
    entityId: data.id,
    userId: auth.profile.id,
    payload: { after: data },
  });

  revalidatePath("/admin");
  return { data };
}

export async function deleteDepartment(id: string) {
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if ("error" in auth) return auth;

  const { data: before } = await supabase
    .from("departments")
    .select()
    .eq("id", id)
    .single();

  // subject_id is polymorphic (user or department), so no FK cascade —
  // remove the department's permission rows explicitly.
  await supabase
    .from("permissions")
    .delete()
    .eq("subject_type", "department")
    .eq("subject_id", id);

  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "department_deleted",
    entityType: "departments",
    entityId: id,
    userId: auth.profile.id,
    payload: { before },
  });

  revalidatePath("/admin");
  return { data: true };
}

export async function updateUserProfile(
  userId: string,
  input: { role: Role; department_id: string | null },
) {
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if ("error" in auth) return auth;

  if (!["admin", "storekeeper", "purchasing_officer"].includes(input.role)) {
    return { error: "Invalid role" };
  }
  if (userId === auth.profile.id && input.role !== "admin") {
    return { error: "You cannot remove your own administrator role" };
  }

  const { data: before } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .single();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: input.role, department_id: input.department_id })
    .eq("id", userId)
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "user_profile_updated",
    entityType: "profiles",
    entityId: userId,
    userId: auth.profile.id,
    payload: { before, after: data },
  });

  revalidatePath("/admin");
  return { data };
}

// Admin edit of a user's identity (name + sign-in email). The email lives in
// auth.users, which only the service-role key may modify, so the change goes
// through the admin API and is then mirrored onto the profiles row the app reads.
export async function updateUserAccount(
  userId: string,
  input: { full_name: string; email: string },
) {
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if ("error" in auth) return auth;

  const fullName = input.full_name.trim();
  const email = input.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "A valid email address is required" };
  }

  const { data: before } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .single();
  if (!before) return { error: "User not found" };

  if (email !== (before.email ?? "").toLowerCase()) {
    const adminClient = createAdminClient();
    if (!adminClient) {
      return {
        error:
          "Changing a user's email requires SUPABASE_SERVICE_ROLE_KEY to be set in the server environment",
      };
    }
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      email,
      email_confirm: true,
    });
    if (error) return { error: error.message };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null, email })
    .eq("id", userId)
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "user_account_updated",
    entityType: "profiles",
    entityId: userId,
    userId: auth.profile.id,
    payload: { before, after: data },
  });

  revalidatePath("/admin");
  return { data };
}

export type PermissionFlags = {
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

export async function setPermission(
  subjectType: "user" | "department",
  subjectId: string,
  resource: Resource,
  flags: PermissionFlags,
) {
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if ("error" in auth) return auth;

  if (!RESOURCES.includes(resource)) return { error: "Invalid resource" };
  if (!["user", "department"].includes(subjectType)) {
    return { error: "Invalid subject type" };
  }

  const { data, error } = await supabase
    .from("permissions")
    .upsert(
      {
        subject_type: subjectType,
        subject_id: subjectId,
        resource,
        ...flags,
      },
      { onConflict: "subject_type,subject_id,resource" },
    )
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "permission_set",
    entityType: "permissions",
    entityId: data.id,
    userId: auth.profile.id,
    payload: { after: data },
  });

  revalidatePath("/admin");
  return { data };
}
