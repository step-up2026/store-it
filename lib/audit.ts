import type { SupabaseClient } from "@supabase/supabase-js";

export async function writeAuditLog(
  supabase: SupabaseClient,
  entry: {
    action: string;
    entityType: string;
    entityId: string | null;
    payload?: Record<string, unknown>;
    userId?: string | null;
  },
) {
  await supabase.from("audit_logs").insert({
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    payload: entry.payload ?? null,
    user_id: entry.userId ?? null,
  });
}
