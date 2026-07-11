"use client";

import { useState } from "react";
import type { Supplier } from "@/lib/types";
import { createSupplier, updateSupplier } from "@/lib/actions/suppliers";

export function SupplierForm({
  supplier,
  onDone,
  onCancel,
}: {
  supplier: Supplier | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(supplier?.name ?? "");
  const [contactName, setContactName] = useState(supplier?.contact_name ?? "");
  const [contactEmail, setContactEmail] = useState(
    supplier?.contact_email ?? "",
  );
  const [contactPhone, setContactPhone] = useState(
    supplier?.contact_phone ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const input = {
      name,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
    };

    const res = supplier
      ? await updateSupplier(supplier.id, input)
      : await createSupplier(input);

    setSaving(false);
    if (res.error) {
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
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Contact Name
        </label>
        <input
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Phone
          </label>
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
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
          className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
