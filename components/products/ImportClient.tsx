"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { csvToObjects } from "@/lib/csv";
import { bulkImportProducts, type ImportProductInput } from "@/lib/actions/products";

type ParsedRow = ImportProductInput & { rowNumber: number; error: string | null };

function toNumber(value: string): number {
  const n = Number(value.trim());
  return Number.isFinite(n) ? n : 0;
}

function parseRows(text: string): ParsedRow[] {
  const objects = csvToObjects(text);
  return objects.map((obj, i) => {
    const description = obj["description"] ?? "";
    const unit = obj["unit"] ?? "";
    const row: ParsedRow = {
      rowNumber: i + 2, // +1 for header row, +1 for 1-indexing
      description,
      unit,
      min_stock_level: toNumber(obj["min_stock_level"] ?? "0"),
      current_qty: toNumber(obj["current_qty"] ?? "0"),
      supplier_name: obj["supplier"] ?? "",
      error: null,
    };
    if (!description.trim()) row.error = "Missing description";
    else if (!unit.trim()) row.error = "Missing unit";
    return row;
  });
}

export function ImportClient({
  suppliers,
}: {
  suppliers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const supplierNames = new Set(
    suppliers.map((s) => s.name.trim().toLowerCase()),
  );
  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSuccess(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = parseRows(text);
      if (parsed.length === 0) {
        setError("No rows found in this file");
        setRows([]);
        return;
      }
      setRows(parsed);
    };
    reader.onerror = () => setError("Could not read this file");
    reader.readAsText(file);
  }

  async function handleConfirm() {
    if (validRows.length === 0) return;
    setImporting(true);
    setError(null);

    const res = await bulkImportProducts(
      validRows.map(({ description, unit, min_stock_level, current_qty, supplier_name }) => ({
        description,
        unit,
        min_stock_level,
        current_qty,
        supplier_name,
      })),
    );

    setImporting(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }

    setSuccess(`Imported ${res.data.length} product(s).`);
    setRows([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <p className="text-sm text-neutral-600 mb-4">
          Upload a CSV with columns: <code className="bg-neutral-100 px-1 rounded">description</code>,{" "}
          <code className="bg-neutral-100 px-1 rounded">unit</code>,{" "}
          <code className="bg-neutral-100 px-1 rounded">min_stock_level</code>,{" "}
          <code className="bg-neutral-100 px-1 rounded">current_qty</code>,{" "}
          <code className="bg-neutral-100 px-1 rounded">supplier</code> (optional, matched by name).
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="text-sm"
        />
        {fileName && (
          <p className="text-sm text-neutral-500 mt-2">Selected: {fileName}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-300 bg-green-50 text-green-800 px-4 py-3 text-sm flex justify-between items-center">
          <span>{success}</span>
          <Link href="/products" className="font-medium underline">
            View products →
          </Link>
        </div>
      )}

      {rows.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-neutral-600">
              {validRows.length} valid row(s), {invalidRows.length} with errors
            </p>
            <button
              onClick={handleConfirm}
              disabled={validRows.length === 0 || importing}
              className="px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-ink disabled:opacity-50"
            >
              {importing ? "Importing…" : `Confirm Import (${validRows.length})`}
            </button>
          </div>
          <div className="border border-neutral-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Row</th>
                  <th className="text-left px-3 py-2 font-medium">Description</th>
                  <th className="text-left px-3 py-2 font-medium">Unit</th>
                  <th className="text-right px-3 py-2 font-medium">Min Stock</th>
                  <th className="text-right px-3 py-2 font-medium">Qty</th>
                  <th className="text-left px-3 py-2 font-medium">Supplier</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((row) => {
                  const supplierMatched =
                    !row.supplier_name.trim() ||
                    supplierNames.has(row.supplier_name.trim().toLowerCase());
                  return (
                    <tr
                      key={row.rowNumber}
                      className={row.error ? "bg-red-50" : ""}
                    >
                      <td className="px-3 py-2 text-neutral-500">{row.rowNumber}</td>
                      <td className="px-3 py-2">{row.description || "—"}</td>
                      <td className="px-3 py-2">{row.unit || "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {row.min_stock_level}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {row.current_qty}
                      </td>
                      <td className="px-3 py-2">
                        {row.supplier_name || "—"}
                        {row.supplier_name && !supplierMatched && (
                          <span className="text-amber-600 text-xs ml-1">
                            (not found, will be left unset)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.error ? (
                          <span className="text-red-700 font-medium">{row.error}</span>
                        ) : (
                          <span className="text-green-700">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
