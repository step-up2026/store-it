import { createClient } from "@/lib/supabase/server";
import { SuppliersClient } from "@/components/suppliers/SuppliersClient";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data: suppliers, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name");

  return (
    <SuppliersClient
      initialSuppliers={suppliers ?? []}
      loadError={error?.message ?? null}
    />
  );
}
