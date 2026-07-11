"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Supplier } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { deleteSupplier } from "@/lib/actions/suppliers";

export function SuppliersClient({
  initialSuppliers,
  loadError,
  canManage,
}: {
  initialSuppliers: Supplier[];
  loadError: string | null;
  canManage: boolean;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [error, setError] = useState<string | null>(loadError);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(s: Supplier) {
    setEditing(s);
    setModalOpen(true);
  }

  async function handleDelete(s: Supplier) {
    if (!confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
    setBusyId(s.id);
    setError(null);
    const res = await deleteSupplier(s.id);
    setBusyId(null);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Suppliers</h1>
        {canManage && (
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Add Supplier
          </button>
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

      {initialSuppliers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-300 rounded-lg">
          <p className="text-neutral-500 mb-4">No suppliers yet — add one</p>
          {canManage && (
            <button
              onClick={openAdd}
              className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Add Supplier
            </button>
          )}
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                {canManage && (
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {initialSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {s.name}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {s.contact_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {s.contact_email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {s.contact_phone ?? "—"}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-neutral-600 hover:text-neutral-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        disabled={busyId === s.id}
                        className="text-red-600 hover:text-red-800 font-medium disabled:opacity-40"
                      >
                        {busyId === s.id ? "Deleting…" : "Delete"}
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
          title={editing ? "Edit Supplier" : "Add Supplier"}
          onClose={() => setModalOpen(false)}
        >
          <SupplierForm
            supplier={editing}
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
