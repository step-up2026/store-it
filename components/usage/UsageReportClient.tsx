"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProductTotal = { description: string; unit: string; total: number };
type WorkerTotal = { name: string; total: number };

export function UsageReportClient({
  from,
  to,
  productTotals,
  workerTotals,
  entryCount,
  loadError,
}: {
  from: string;
  to: string;
  productTotals: ProductTotal[];
  workerTotals: WorkerTotal[];
  entryCount: number;
  loadError: string | null;
}) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(to);

  function applyFilter() {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    router.push(`/usage/report?${params.toString()}`);
  }

  function clearFilter() {
    setFromDate("");
    setToDate("");
    router.push("/usage/report");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={applyFilter}
          className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800"
        >
          Apply
        </button>
        {(from || to) && (
          <button
            onClick={clearFilter}
            className="px-4 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Clear
          </button>
        )}
        <span className="text-sm text-neutral-400 ml-auto">
          {entryCount} usage entr{entryCount === 1 ? "y" : "ies"} in range
        </span>
      </div>

      {loadError && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {loadError}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">
            By Product
          </h2>
          {productTotals.length === 0 ? (
            <p className="text-sm text-neutral-400">No usage in this range</p>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Product</th>
                    <th className="text-right px-3 py-2 font-medium">Total Taken</th>
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
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">
            By Worker
          </h2>
          {workerTotals.length === 0 ? (
            <p className="text-sm text-neutral-400">No usage in this range</p>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Worker</th>
                    <th className="text-right px-3 py-2 font-medium">Units Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {workerTotals.map((w) => (
                    <tr key={w.name}>
                      <td className="px-3 py-2 text-neutral-800">{w.name}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{w.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
