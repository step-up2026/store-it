import { computeStockStatus, STOCK_STATUS_CLASS, STOCK_STATUS_LABEL } from "@/lib/stock";

export function StockBadge({
  currentQty,
  minStockLevel,
}: {
  currentQty: number;
  minStockLevel: number;
}) {
  const status = computeStockStatus(currentQty, minStockLevel);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STOCK_STATUS_CLASS[status]}`}
    >
      {STOCK_STATUS_LABEL[status]}
    </span>
  );
}
