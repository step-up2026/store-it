import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { getPermissions } from "@/lib/permissions";
import { NoAccess } from "@/components/NoAccess";
import { SuppliersClient } from "@/components/suppliers/SuppliersClient";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const supabase = await createClient();
  const profile = await getSessionProfile(supabase);
  const perms = await getPermissions(supabase, profile);

  if (!perms.suppliers.view) {
    return <NoAccess resource="suppliers" />;
  }

  const { data: suppliers, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name");

  return (
    <SuppliersClient
      initialSuppliers={suppliers ?? []}
      loadError={error?.message ?? null}
      perms={perms.suppliers}
    />
  );
}
