import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { TeamsClient } from "@/components/teams/TeamsClient";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const supabase = await createClient();
  const profile = await getSessionProfile(supabase);

  const [{ data: teams, error: teamsError }, { data: workers }] =
    await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("workers").select("*").order("name"),
    ]);

  return (
    <TeamsClient
      initialTeams={teams ?? []}
      initialWorkers={workers ?? []}
      loadError={teamsError?.message ?? null}
      canManage={profile?.role === "storekeeper"}
    />
  );
}
