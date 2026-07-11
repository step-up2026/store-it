"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { createProduct, updateProduct } from "@/lib/actions/products";

export function ProductForm({
  product,
  suppliers,
  onDone,
  onCancel,
}: {
  product: Product | null;
  suppliers: { id: string; name: string }[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [description, setDescription] = useState(product?.description ?? "");
  const [unit, setUnit] = useState(product?.unit ?? "");
  const [minStockLevel, setMinStockLevel] = useState(
    String(product?.min_stock_level ?? 0),
  );
  const [currentQty, setCurrentQty] = useState(
    String(product?.current_qty ?? 0),
  );
  const [supplierId, setSupplierId] = useState(product?.supplier_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const input = {
      description,
      unit,
      min_stock_level: Number(minStockLevel),
      current_qty: Number(currentQty),
      supplier_id: supplierId || null,
    };

    const res = product
      ? await updateProduct(product.id, input)
      : await createProduct(input);

    setSaving(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-800 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Description
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          placeholder="e.g. Cutting Disc 4&quot; (Metal)"
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Unit
          </label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="pcs, rolls, kg…"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Supplier
          </label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">— None —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Current Qty
          </label>
          <input
            type="number"
            min={0}
            value={currentQty}
            onChange={(e) => setCurrentQty(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Min Stock Level
          </label>
          <input
            type="number"
            min={0}
            value={minStockLevel}
            onChange={(e) => setMinStockLevel(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-ink disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
