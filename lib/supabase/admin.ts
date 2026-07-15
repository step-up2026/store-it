import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for privileged auth operations (e.g. an admin changing
// another user's email). Server-side only — never import from client code.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
