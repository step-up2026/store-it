import { createClient } from "@/lib/supabase/server";
import { UsageReportClient } from "@/components/usage/UsageReportClient";

export const dynamic = "force-dynamic";

type Row = {
  product_id: string;
  worker_id: string | null;
  qty_taken: number;
  created_at: string;
  product: { description: string; unit: string } | { description: string; unit: string }[] | null;
  worker: { name: string } | { name: string }[] | null;
};

function one<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default async function UsageReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("usage_logs")
    .select("product_id, worker_id, qty_taken, created_at, product:products(description, unit), worker:workers(name)")
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", `${from}T00:00:00`);
  if (to) query = query.lte("created_at", `${to}T23:59:59`);

  const { data, error } = await query;
  const rows = (data ?? []) as Row[];

  const byProduct = new Map<string, { description: string; unit: string; total: number }>();
  const byWorker = new Map<string, { name: string; total: number }>();

  for (const row of rows) {
    const product = one(row.product);
    const worker = one(row.worker);

    if (product) {
      const key = row.product_id;
      const existing = byProduct.get(key);
      if (existing) {
        existing.total += row.qty_taken;
      } else {
        byProduct.set(key, {
          description: product.description,
          unit: product.unit,
          total: row.qty_taken,
        });
      }
    }

    if (worker && row.worker_id) {
      const key = row.worker_id;
      const existing = byWorker.get(key);
      if (existing) {
        existing.total += row.qty_taken;
      } else {
        byWorker.set(key, { name: worker.name, total: row.qty_taken });
      }
    }
  }

  const productTotals = Array.from(byProduct.values()).sort(
    (a, b) => b.total - a.total,
  );
  const workerTotals = Array.from(byWorker.values()).sort(
    (a, b) => b.total - a.total,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
        Usage Report
      </h1>
      <UsageReportClient
        from={from ?? ""}
        to={to ?? ""}
        productTotals={productTotals}
        workerTotals={workerTotals}
        entryCount={rows.length}
        loadError={error?.message ?? null}
      />
    </div>
  );
}
