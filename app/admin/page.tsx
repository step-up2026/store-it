import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { AdminClient } from "@/components/admin/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const profile = await getSessionProfile(supabase);

  if (profile?.role !== "admin") {
    redirect("/products");
  }

  const [{ data: users }, { data: departments }, { data: permissions }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, role, department_id")
        .order("email"),
      supabase.from("departments").select("*").order("name"),
      supabase
        .from("permissions")
        .select("subject_type, subject_id, resource, can_view, can_add, can_edit, can_delete"),
    ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
        User Management
      </h1>
      <AdminClient
        users={users ?? []}
        departments={departments ?? []}
        permissions={permissions ?? []}
        selfId={profile.id}
      />
    </div>
  );
}
