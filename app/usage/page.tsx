import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { UsageHistoryClient } from "@/components/usage/UsageHistoryClient";

export const dynamic = "force-dynamic";

export default async function UsageHistoryPage() {
  const supabase = await createClient();
  const profile = await getSessionProfile(supabase);

  const [{ data: logs, error }, { data: products }, { data: workers }] =
    await Promise.all([
      supabase
        .from("usage_logs")
        .select("*, product:products(id, description, unit), worker:workers(id, name)")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, description").order("description"),
      supabase.from("workers").select("id, name").order("name"),
    ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Usage Log</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/usage/report"
            className="px-4 py-2 rounded-md text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            Report
          </Link>
          {profile?.role === "storekeeper" && (
            <Link
              href="/usage/new"
              className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Record Usage
            </Link>
          )}
        </div>
      </div>
      <UsageHistoryClient
        initialLogs={logs ?? []}
        products={products ?? []}
        workers={workers ?? []}
        loadError={error?.message ?? null}
      />
    </div>
  );
}
