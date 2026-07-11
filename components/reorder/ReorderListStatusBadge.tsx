import type { ReorderListStatus } from "@/lib/types";

const CLASS: Record<ReorderListStatus, string> = {
  draft: "bg-neutral-100 text-neutral-700 border-neutral-300",
  ordered: "bg-blue-100 text-blue-800 border-blue-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
};

const LABEL: Record<ReorderListStatus, string> = {
  draft: "Draft",
  ordered: "Ordered",
  delivered: "Delivered",
};

export function ReorderListStatusBadge({
  status,
}: {
  status: ReorderListStatus;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CLASS[status]}`}
    >
      {LABEL[status]}
    </span>
  );
}
