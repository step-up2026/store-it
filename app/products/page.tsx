import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { getPermissions } from "@/lib/permissions";
import { NoAccess } from "@/components/NoAccess";
import { ProductsClient } from "@/components/products/ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();
  const profile = await getSessionProfile(supabase);
  const perms = await getPermissions(supabase, profile);

  if (!perms.products.view) {
    return <NoAccess resource="products" />;
  }

  const [{ data: products, error: productsError }, { data: suppliers }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*, supplier:suppliers(id, name)")
        .order("description"),
      supabase.from("suppliers").select("id, name").order("name"),
    ]);

  return (
    <ProductsClient
      initialProducts={products ?? []}
      suppliers={suppliers ?? []}
      loadError={productsError?.message ?? null}
      perms={perms.products}
      canGenerate={profile?.role === "storekeeper" || profile?.role === "admin"}
    />
  );
}
