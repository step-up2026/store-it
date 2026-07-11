import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReorderDetailClient } from "@/components/reorder/ReorderDetailClient";

export const dynamic = "force-dynamic";

export default async function ReorderListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: list, error: listError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase.from("reorder_lists").select("*").eq("id", id).single(),
      supabase
        .from("reorder_list_items")
        .select("*, product:products(id, description, unit), supplier:suppliers(id, name)")
        .eq("reorder_list_id", id)
        .order("created_at"),
    ]);

  if (listError || !list) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ReorderDetailClient
        list={list}
        initialItems={items ?? []}
        loadError={itemsError?.message ?? null}
      />
    </div>
  );
}
