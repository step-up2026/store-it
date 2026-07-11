"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { computeStockStatus } from "@/lib/stock";
import { StockBadge } from "@/components/StockBadge";
import { Modal } from "@/components/Modal";
import { ProductForm } from "@/components/products/ProductForm";
import { deleteProduct } from "@/lib/actions/products";
import { generateReorderList } from "@/lib/actions/reorder";

type SupplierOption = { id: string; name: string };

export function ProductsClient({
  initialProducts,
  suppliers,
  loadError,
  canManage,
}: {
  initialProducts: Product[];
  suppliers: SupplierOption[];
  loadError: string | null;
  canManage: boolean;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(loadError);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasLowStock = initialProducts.some(
    (p) => computeStockStatus(p.current_qty, p.min_stock_level) === "critical",
  );

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setModalOpen(true);
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.description}"? This cannot be undone.`)) return;
    setBusyId(p.id);
    setError(null);
    const res = await deleteProduct(p.id);
    setBusyId(null);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  function handleGenerateReorder() {
    if (!hasLowStock) return;
    if (
      !confirm(
        "Generate a reorder list for all products at or below their minimum stock level?",
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const res = await generateReorderList();
      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.push(`/reorder-lists/${res.data.id}`);
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Products</h1>
        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={handleGenerateReorder}
              disabled={!hasLowStock || isPending}
              title={
                hasLowStock
                  ? "Create a draft reorder list from low-stock products"
                  : "All stock levels are healthy"
              }
              className="px-4 py-2 rounded-md text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "Generating…" : "Generate Reorder List"}
            </button>
            <Link
              href="/products/import"
              className="px-4 py-2 rounded-md text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Import
            </Link>
            <button
              onClick={openAdd}
              className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Add Product
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm flex justify-between items-start">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-red-500">
            &times;
          </button>
        </div>
      )}

      {initialProducts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-300 rounded-lg">
          <p className="text-neutral-500 mb-4">
            No consumable products yet — add one or import from Excel
          </p>
          {canManage && (
            <button
              onClick={openAdd}
              className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Unit</th>
                <th className="text-right px-4 py-3 font-medium">Qty</th>
                <th className="text-right px-4 py-3 font-medium">Min Stock</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Supplier</th>
                {canManage && (
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {initialProducts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {p.description}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{p.unit}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {p.current_qty}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-500">
                    {p.min_stock_level}
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge
                      currentQty={p.current_qty}
                      minStockLevel={p.min_stock_level}
                    />
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {p.supplier?.name ?? "—"}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-neutral-600 hover:text-neutral-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={busyId === p.id}
                        className="text-red-600 hover:text-red-800 font-medium disabled:opacity-40"
                      >
                        {busyId === p.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && canManage && (
        <Modal
          title={editing ? "Edit Product" : "Add Product"}
          onClose={() => setModalOpen(false)}
        >
          <ProductForm
            product={editing}
            suppliers={suppliers}
            onDone={() => {
              setModalOpen(false);
              router.refresh();
            }}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
