import { createClient } from "@/lib/supabase/server";
import { ProductsClient } from "@/components/products/ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();

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
    />
  );
}
