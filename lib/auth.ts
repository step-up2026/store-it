import type { SupabaseClient } from "@supabase/supabase-js";

export type Role = "admin" | "storekeeper" | "purchasing_officer";

export type SessionProfile = {
  id: string;
  email: string | null;
  role: Role;
  full_name: string | null;
  department_id: string | null;
};

export async function getSessionProfile(
  supabase: SupabaseClient,
): Promise<SessionProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, department_id")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role as Role,
    full_name: profile.full_name,
    department_id: profile.department_id,
  };
}

// Admins pass every role check.
export async function requireRole(
  supabase: SupabaseClient,
  allowed: Role[],
): Promise<{ profile: SessionProfile } | { error: string }> {
  const profile = await getSessionProfile(supabase);
  if (!profile) return { error: "Not authenticated" };
  if (profile.role !== "admin" && !allowed.includes(profile.role)) {
    return {
      error: `Forbidden — this action requires the ${allowed.join(" or ")} role`,
    };
  }
  return { profile };
}

export function actorName(profile: SessionProfile): string {
  return profile.full_name || profile.email || "Unknown";
}
