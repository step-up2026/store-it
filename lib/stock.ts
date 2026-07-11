import type { StockStatus } from "@/lib/types";

export function computeStockStatus(
  currentQty: number,
  minStockLevel: number,
): StockStatus {
  if (currentQty <= minStockLevel) return "critical";
  if (currentQty <= minStockLevel * 1.5) return "low";
  return "ok";
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  ok: "OK",
  low: "Low",
  critical: "Critical",
};

export const STOCK_STATUS_CLASS: Record<StockStatus, string> = {
  ok: "bg-green-100 text-green-800 border-green-300",
  low: "bg-amber-100 text-amber-800 border-amber-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

export function suggestedReorderQty(
  minStockLevel: number,
  currentQty: number,
): number {
  const suggested = minStockLevel * 2 - currentQty;
  return Math.max(suggested, minStockLevel);
}
