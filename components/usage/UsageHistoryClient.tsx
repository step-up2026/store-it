"use client";

import { useMemo, useState } from "react";

type LogRow = {
  id: string;
  qty_taken: number;
  recorded_by: string | null;
  notes: string | null;
  created_at: string;
  product: { id: string; description: string; unit: string } | null;
  worker: { id: string; name: string } | null;
};

type SortKey = "created_at" | "worker" | "product" | "qty_taken";

export function UsageHistoryClient({
  initialLogs,
  products,
  workers,
  loadError,
}: {
  initialLogs: LogRow[];
  products: { id: string; description: string }[];
  workers: { id: string; name: string }[];
  loadError: string | null;
}) {
  const [productFilter, setProductFilter] = useState("");
  const [workerFilter, setWorkerFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let rows = initialLogs;
    if (productFilter) {
      rows = rows.filter((r) => r.product?.id === productFilter);
    }
    if (workerFilter) {
      rows = rows.filter((r) => r.worker?.id === workerFilter);
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "created_at") {
        cmp = a.created_at.localeCompare(b.created_at);
      } else if (sortKey === "worker") {
        cmp = (a.worker?.name ?? "").localeCompare(b.worker?.name ?? "");
      } else if (sortKey === "product") {
        cmp = (a.product?.description ?? "").localeCompare(
          b.product?.description ?? "",
        );
      } else if (sortKey === "qty_taken") {
        cmp = a.qty_taken - b.qty_taken;
      }
      return sortAsc ? cmp : -cmp;
    });
    return sorted;
  }, [initialLogs, productFilter, workerFilter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm">
        {loadError}
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.description}
            </option>
          ))}
        </select>
        <select
          value={workerFilter}
          onChange={(e) => setWorkerFilter(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">All workers</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {initialLogs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-300 rounded-lg">
          <p className="text-neutral-500">No usage recorded yet</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-300 rounded-lg">
          <p className="text-neutral-500">No usage matches these filters</p>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th
                  className="text-left px-4 py-3 font-medium cursor-pointer select-none"
                  onClick={() => toggleSort("created_at")}
                >
                  Date {sortKey === "created_at" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  className="text-left px-4 py-3 font-medium cursor-pointer select-none"
                  onClick={() => toggleSort("worker")}
                >
                  Worker {sortKey === "worker" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  className="text-left px-4 py-3 font-medium cursor-pointer select-none"
                  onClick={() => toggleSort("product")}
                >
                  Product {sortKey === "product" && (sortAsc ? "▲" : "▼")}
                </th>
                <th
                  className="text-right px-4 py-3 font-medium cursor-pointer select-none"
                  onClick={() => toggleSort("qty_taken")}
                >
                  Qty {sortKey === "qty_taken" && (sortAsc ? "▲" : "▼")}
                </th>
                <th className="text-left px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-neutral-800">
                    {log.worker?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-800">
                    {log.product?.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {log.qty_taken} {log.product?.unit}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {log.notes ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
