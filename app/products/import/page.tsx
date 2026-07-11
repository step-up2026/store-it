import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { getPermissions } from "@/lib/permissions";
import { ImportClient } from "@/components/products/ImportClient";

export const dynamic = "force-dynamic";

export default async function ImportProductsPage() {
  const supabase = await createClient();
  const profile = await getSessionProfile(supabase);
  const perms = await getPermissions(supabase, profile);

  if (!perms.products.add) {
    redirect("/products");
  }

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name")
    .order("name");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
        Import Products
      </h1>
      <ImportClient suppliers={suppliers ?? []} />
    </div>
  );
}
