import { createClient } from "@/lib/supabase/server";
import { UsageForm } from "@/components/usage/UsageForm";

export const dynamic = "force-dynamic";

export default async function NewUsagePage() {
  const supabase = await createClient();

  const [{ data: products }, { data: workers }] = await Promise.all([
    supabase
      .from("products")
      .select("id, description, unit, current_qty, min_stock_level")
      .order("description"),
    supabase
      .from("workers")
      .select("id, name, employee_id, team:teams(id, name)")
      .order("name"),
  ]);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
        Record Usage
      </h1>
      <UsageForm products={products ?? []} workers={workers ?? []} />
    </div>
  );
}
