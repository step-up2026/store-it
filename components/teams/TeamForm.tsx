"use client";

import { useState } from "react";
import type { Team } from "@/lib/types";
import { createTeam, updateTeam } from "@/lib/actions/teams";

export function TeamForm({
  team,
  onDone,
  onCancel,
}: {
  team: Team | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(team?.name ?? "");
  const [leaderName, setLeaderName] = useState(team?.leader_name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const input = { name, leader_name: leaderName };
    const res = team ? await updateTeam(team.id, input) : await createTeam(input);

    setSaving(false);
    if ("error" in res) {
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
          Team Name
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
          Leader Name
        </label>
        <input
          value={leaderName}
          onChange={(e) => setLeaderName(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
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
          className="px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-ink disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
