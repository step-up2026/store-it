import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ItemRow = {
  qty_to_order: number;
  product: { description: string; unit: string } | { description: string; unit: string }[] | null;
  reorder_list: { id: string; delivered_at: string | null; delivered_by: string | null } | { id: string; delivered_at: string | null; delivered_by: string | null }[] | null;
};

function one<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default async function DeliveriesSummaryPage() {
  const supabase = await createClient();

  const { data: lists, error: listsError } = await supabase
    .from("reorder_lists")
    .select("id, delivered_at, delivered_by, ordered_by")
    .eq("status", "delivered")
    .order("delivered_at", { ascending: false });

  const { data: items, error: itemsError } = await supabase
    .from("reorder_list_items")
    .select(
      "qty_to_order, product:products(description, unit), reorder_list:reorder_lists!inner(id, delivered_at, delivered_by, status)",
    )
    .eq("reorder_list.status", "delivered");

  const rows = (items ?? []) as unknown as ItemRow[];

  const totalsByProduct = new Map<string, { unit: string; total: number }>();
  for (const row of rows) {
    const product = one(row.product);
    if (!product) continue;
    const existing = totalsByProduct.get(product.description);
    if (existing) existing.total += row.qty_to_order;
    else totalsByProduct.set(product.description, { unit: product.unit, total: row.qty_to_order });
  }
  const productTotals = Array.from(totalsByProduct.entries())
    .map(([description, v]) => ({ description, ...v }))
    .sort((a, b) => b.total - a.total);

  const itemCountByList = new Map<string, number>();
  for (const row of rows) {
    const list = one(row.reorder_list);
    if (!list) continue;
    itemCountByList.set(list.id, (itemCountByList.get(list.id) ?? 0) + 1);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/reorder-lists"
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← All reorder lists
      </Link>
      <h1 className="text-2xl font-semibold text-neutral-900 mt-2 mb-6">
        Delivery Confirmation Summary
      </h1>

      {(listsError || itemsError) && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {listsError?.message ?? itemsError?.message}
        </div>
      )}

      {!lists || lists.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-300 rounded-lg">
          <p className="text-neutral-500">No deliveries confirmed yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-neutral-700 mb-2">
              Confirmed Deliveries
            </h2>
            <div className="border border-neutral-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Delivered</th>
                    <th className="text-left px-3 py-2 font-medium">Delivered By</th>
                    <th className="text-left px-3 py-2 font-medium">Ordered By</th>
                    <th className="text-right px-3 py-2 font-medium">Items</th>
                    <th className="text-right px-3 py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {lists.map((list) => (
                    <tr key={list.id}>
                      <td className="px-3 py-2 text-neutral-600 whitespace-nowrap">
                        {list.delivered_at
                          ? new Date(list.delivered_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-neutral-800">
                        {list.delivered_by ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-neutral-800">
                        {list.ordered_by ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {itemCountByList.get(list.id) ?? 0}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/reorder-lists/${list.id}`}
                          className="text-neutral-600 hover:text-neutral-900 font-medium"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-neutral-700 mb-2">
              Total Delivered by Product
            </h2>
            <div className="border border-neutral-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Product</th>
                    <th className="text-right px-3 py-2 font-medium">Total Delivered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {productTotals.map((p) => (
                    <tr key={p.description}>
                      <td className="px-3 py-2 text-neutral-800">{p.description}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {p.total} {p.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
