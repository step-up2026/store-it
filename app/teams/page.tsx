import { createClient } from "@/lib/supabase/server";
import { TeamsClient } from "@/components/teams/TeamsClient";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const supabase = await createClient();

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
    />
  );
}
