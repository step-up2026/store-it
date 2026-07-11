"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Team, Worker } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { TeamForm } from "@/components/teams/TeamForm";
import { WorkerForm } from "@/components/teams/WorkerForm";
import { deleteTeam, deleteWorker } from "@/lib/actions/teams";

export function TeamsClient({
  initialTeams,
  initialWorkers,
  loadError,
  canManage,
}: {
  initialTeams: Team[];
  initialWorkers: Worker[];
  loadError: string | null;
  canManage: boolean;
}) {
  const router = useRouter();
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [workerModal, setWorkerModal] = useState<{
    teamId: string;
    worker: Worker | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(loadError);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDeleteTeam(t: Team) {
    if (
      !confirm(
        `Delete team "${t.name}"? Workers in this team will be unassigned.`,
      )
    )
      return;
    setBusyId(t.id);
    setError(null);
    const res = await deleteTeam(t.id);
    setBusyId(null);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  async function handleDeleteWorker(w: Worker) {
    if (!confirm(`Delete worker "${w.name}"? This cannot be undone.`)) return;
    setBusyId(w.id);
    setError(null);
    const res = await deleteWorker(w.id);
    setBusyId(null);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Teams</h1>
        {canManage && (
          <button
            onClick={() => {
              setEditingTeam(null);
              setTeamModalOpen(true);
            }}
            className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Add Team
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm flex justify-between items-start">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-red-500">
            &times;
          </button>
        </div>
      )}

      {initialTeams.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-300 rounded-lg">
          <p className="text-neutral-500 mb-4">No teams yet — add one</p>
          {canManage && (
            <button
              onClick={() => {
                setEditingTeam(null);
                setTeamModalOpen(true);
              }}
              className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Add Team
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {initialTeams.map((team) => {
            const workers = initialWorkers.filter(
              (w) => w.team_id === team.id,
            );
            return (
              <div
                key={team.id}
                className="border border-neutral-200 rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-neutral-50">
                  <div>
                    <span className="font-semibold text-neutral-900">
                      {team.name}
                    </span>
                    {team.leader_name && (
                      <span className="text-neutral-500 text-sm ml-2">
                        Leader: {team.leader_name}
                      </span>
                    )}
                  </div>
                  {canManage && (
                    <div className="space-x-3 text-sm">
                      <button
                        onClick={() =>
                          setWorkerModal({ teamId: team.id, worker: null })
                        }
                        className="text-neutral-600 hover:text-neutral-900 font-medium"
                      >
                        Add Worker
                      </button>
                      <button
                        onClick={() => {
                          setEditingTeam(team);
                          setTeamModalOpen(true);
                        }}
                        className="text-neutral-600 hover:text-neutral-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team)}
                        disabled={busyId === team.id}
                        className="text-red-600 hover:text-red-800 font-medium disabled:opacity-40"
                      >
                        {busyId === team.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
                {workers.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-neutral-400">
                    No workers in this team yet
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-neutral-100">
                      {workers.map((w) => (
                        <tr key={w.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-2 font-medium text-neutral-800">
                            {w.name}
                          </td>
                          <td className="px-4 py-2 text-neutral-500">
                            {w.employee_id ?? "—"}
                          </td>
                          {canManage && (
                            <td className="px-4 py-2 text-right space-x-2">
                              <button
                                onClick={() =>
                                  setWorkerModal({
                                    teamId: team.id,
                                    worker: w,
                                  })
                                }
                                className="text-neutral-600 hover:text-neutral-900 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteWorker(w)}
                                disabled={busyId === w.id}
                                className="text-red-600 hover:text-red-800 font-medium disabled:opacity-40"
                              >
                                {busyId === w.id ? "Deleting…" : "Delete"}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}

      {teamModalOpen && canManage && (
        <Modal
          title={editingTeam ? "Edit Team" : "Add Team"}
          onClose={() => setTeamModalOpen(false)}
        >
          <TeamForm
            team={editingTeam}
            onDone={() => {
              setTeamModalOpen(false);
              router.refresh();
            }}
            onCancel={() => setTeamModalOpen(false)}
          />
        </Modal>
      )}

      {workerModal && canManage && (
        <Modal
          title={workerModal.worker ? "Edit Worker" : "Add Worker"}
          onClose={() => setWorkerModal(null)}
        >
          <WorkerForm
            worker={workerModal.worker}
            teams={initialTeams}
            defaultTeamId={workerModal.teamId}
            onDone={() => {
              setWorkerModal(null);
              router.refresh();
            }}
            onCancel={() => setWorkerModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
