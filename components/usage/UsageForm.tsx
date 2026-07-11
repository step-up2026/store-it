"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { recordUsage } from "@/lib/actions/usage";

type ProductOption = {
  id: string;
  description: string;
  unit: string;
  current_qty: number;
  min_stock_level: number;
};

type WorkerOption = {
  id: string;
  name: string;
  employee_id: string | null;
  team: { id: string; name: string } | { id: string; name: string }[] | null;
};

function teamName(team: WorkerOption["team"]): string | null {
  if (!team) return null;
  return Array.isArray(team) ? team[0]?.name ?? null : team.name;
}

export function UsageForm({
  products,
  workers,
}: {
  products: ProductOption[];
  workers: WorkerOption[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!workerId) {
      setError("Please select a worker");
      return;
    }
    if (!productId) {
      setError("Please select a product");
      return;
    }
    const qtyNum = Number(qty);
    if (!qty || qtyNum < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    setSaving(true);
    const res = await recordUsage({
      product_id: productId,
      worker_id: workerId,
      qty_taken: qtyNum,
      notes,
    });
    setSaving(false);

    if ("error" in res) {
      setError(res.error);
      return;
    }

    setSuccess("Usage recorded.");
    setProductId("");
    setWorkerId("");
    setQty("");
    setNotes("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white border border-neutral-200 rounded-lg p-6"
    >
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-800 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-300 bg-green-50 text-green-800 px-3 py-2 text-sm">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Worker
        </label>
        <select
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          required
        >
          <option value="">— Select worker —</option>
          {workers.map((w) => {
            const tn = teamName(w.team);
            return (
              <option key={w.id} value={w.id}>
                {w.name}
                {tn ? ` (${tn})` : ""}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Product
        </label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          required
        >
          <option value="">— Select product —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.description} ({p.current_qty} {p.unit} available)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Quantity Taken{" "}
          {selectedProduct && (
            <span className="text-neutral-400 font-normal">
              ({selectedProduct.current_qty} {selectedProduct.unit} available)
            </span>
          )}
        </label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-ink disabled:opacity-50"
        >
          {saving ? "Recording…" : "Record Usage"}
        </button>
      </div>
    </form>
  );
}
