"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/auth";
import { RESOURCES, type Resource } from "@/lib/permissions";
import { Modal } from "@/components/Modal";
import {
  createDepartment,
  deleteDepartment,
  setPermission,
  updateUserAccount,
  updateUserProfile,
  type PermissionFlags,
} from "@/lib/actions/admin";

type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  department_id: string | null;
};

type Department = { id: string; name: string };

type PermissionRow = {
  subject_type: "user" | "department";
  subject_id: string;
  resource: Resource;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "storekeeper", label: "Storekeeper" },
  { value: "purchasing_officer", label: "Purchasing Officer" },
];

const RESOURCE_LABEL: Record<Resource, string> = {
  products: "Products",
  suppliers: "Suppliers",
  teams: "Teams & Workers",
};

const ACTIONS = ["can_view", "can_add", "can_edit", "can_delete"] as const;
const ACTION_LABEL: Record<(typeof ACTIONS)[number], string> = {
  can_view: "View",
  can_add: "Add",
  can_edit: "Edit",
  can_delete: "Delete",
};

const EMPTY_FLAGS: PermissionFlags = {
  can_view: false,
  can_add: false,
  can_edit: false,
  can_delete: false,
};

export function AdminClient({
  users,
  departments,
  permissions,
  selfId,
}: {
  users: UserRow[];
  departments: Department[];
  permissions: PermissionRow[];
  selfId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Departments
  const [newDeptName, setNewDeptName] = useState("");

  // Edit user (name + email) modal
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  function openEditUser(u: UserRow) {
    setEditingUser(u);
    setEditName(u.full_name ?? "");
    setEditEmail(u.email ?? "");
  }

  // Permissions editor
  const [subjectType, setSubjectType] = useState<"user" | "department">("user");
  const [subjectId, setSubjectId] = useState<string>("");
  const [draft, setDraft] = useState<Record<Resource, PermissionFlags>>({
    products: { ...EMPTY_FLAGS },
    suppliers: { ...EMPTY_FLAGS },
    teams: { ...EMPTY_FLAGS },
  });

  const subjectOptions = subjectType === "user" ? users : departments;

  const deptName = useMemo(
    () => new Map(departments.map((d) => [d.id, d.name])),
    [departments],
  );

  function loadDraftFor(type: "user" | "department", id: string) {
    const next: Record<Resource, PermissionFlags> = {
      products: { ...EMPTY_FLAGS },
      suppliers: { ...EMPTY_FLAGS },
      teams: { ...EMPTY_FLAGS },
    };
    for (const row of permissions) {
      if (row.subject_type === type && row.subject_id === id) {
        next[row.resource] = {
          can_view: row.can_view,
          can_add: row.can_add,
          can_edit: row.can_edit,
          can_delete: row.can_delete,
        };
      }
    }
    setDraft(next);
  }

  function selectSubjectType(type: "user" | "department") {
    setSubjectType(type);
    setSubjectId("");
    setDraft({
      products: { ...EMPTY_FLAGS },
      suppliers: { ...EMPTY_FLAGS },
      teams: { ...EMPTY_FLAGS },
    });
  }

  function selectSubject(id: string) {
    setSubjectId(id);
    if (id) loadDraftFor(subjectType, id);
  }

  function toggleFlag(resource: Resource, action: (typeof ACTIONS)[number]) {
    setDraft((prev) => ({
      ...prev,
      [resource]: { ...prev[resource], [action]: !prev[resource][action] },
    }));
  }

  async function run(fn: () => Promise<{ error?: string } | { data: unknown }>, okMsg: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    const res = await fn();
    setBusy(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return false;
    }
    setNotice(okMsg);
    router.refresh();
    return true;
  }

  async function handleSavePermissions() {
    if (!subjectId) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    for (const resource of RESOURCES) {
      const res = await setPermission(subjectType, subjectId, resource, draft[resource]);
      if ("error" in res && res.error) {
        setBusy(false);
        setError(res.error);
        return;
      }
    }
    setBusy(false);
    setNotice("Permissions saved.");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm flex justify-between items-start">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-red-500">
            &times;
          </button>
        </div>
      )}
      {notice && (
        <div className="rounded-md border border-green-300 bg-green-50 text-green-800 px-4 py-3 text-sm flex justify-between items-start">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="ml-4 text-green-600">
            &times;
          </button>
        </div>
      )}

      {/* Users */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
          Users
        </h2>
        <div className="border border-neutral-200 rounded-lg overflow-x-auto bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-neutral-900">
                      {u.full_name || "—"}
                    </span>
                    <span className="text-neutral-500 block text-xs">
                      {u.email}
                      {u.id === selfId && " (you)"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={busy}
                      onChange={(e) =>
                        run(
                          () =>
                            updateUserProfile(u.id, {
                              role: e.target.value as Role,
                              department_id: u.department_id,
                            }),
                          "User updated.",
                        )
                      }
                      className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.department_id ?? ""}
                      disabled={busy}
                      onChange={(e) =>
                        run(
                          () =>
                            updateUserProfile(u.id, {
                              role: u.role,
                              department_id: e.target.value || null,
                            }),
                          "User updated.",
                        )
                      }
                      className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                    >
                      <option value="">— None —</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={busy}
                      onClick={() => openEditUser(u)}
                      className="px-3 py-1.5 rounded-md text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editingUser && (
        <Modal title="Edit user" onClose={() => setEditingUser(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(
                () =>
                  updateUserAccount(editingUser.id, {
                    full_name: editName,
                    email: editEmail,
                  }),
                "User updated.",
              ).then((ok) => ok && setEditingUser(null));
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                required
              />
              <p className="text-xs text-neutral-400 mt-1">
                Changing the email updates what this user signs in with, effective
                immediately.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-md text-sm font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-ink disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Departments */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
          Departments
        </h2>
        <div className="border border-neutral-200 rounded-lg bg-white p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => {
              const memberCount = users.filter((u) => u.department_id === d.id).length;
              return (
                <span
                  key={d.id}
                  className="inline-flex items-center gap-2 border border-neutral-300 rounded-full pl-3 pr-1 py-1 text-sm text-neutral-700"
                >
                  {d.name}
                  <span className="text-xs text-neutral-400">({memberCount})</span>
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (
                        !confirm(
                          `Delete department "${d.name}"? Its members will be unassigned and its permissions removed.`,
                        )
                      )
                        return;
                      run(() => deleteDepartment(d.id), "Department deleted.");
                    }}
                    className="w-5 h-5 rounded-full text-neutral-400 hover:bg-red-100 hover:text-red-600"
                    aria-label={`Delete ${d.name}`}
                  >
                    &times;
                  </button>
                </span>
              );
            })}
            {departments.length === 0 && (
              <span className="text-sm text-neutral-400">No departments yet</span>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newDeptName.trim()) return;
              run(() => createDepartment(newDeptName), "Department created.").then(
                (ok) => ok && setNewDeptName(""),
              );
            }}
            className="flex gap-2"
          >
            <input
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="New department name"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm flex-1 max-w-xs"
            />
            <button
              type="submit"
              disabled={busy || !newDeptName.trim()}
              className="px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-ink disabled:opacity-50"
            >
              Add
            </button>
          </form>
        </div>
      </section>

      {/* Permissions */}
      <section>
        <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
          Permissions
        </h2>
        <div className="border border-neutral-200 rounded-lg bg-white p-4 space-y-4">
          <p className="text-sm text-neutral-500">
            Grant view / add / edit / delete rights per record type to an
            individual user or a whole department. A user&apos;s effective rights
            are the combination of both. Administrators always have full access.
          </p>
          <div className="flex flex-wrap gap-2">
            <select
              value={subjectType}
              onChange={(e) => selectSubjectType(e.target.value as "user" | "department")}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="user">Individual user</option>
              <option value="department">Department</option>
            </select>
            <select
              value={subjectId}
              onChange={(e) => selectSubject(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm min-w-48"
            >
              <option value="">
                — Select {subjectType === "user" ? "user" : "department"} —
              </option>
              {subjectType === "user"
                ? users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email}
                      {u.department_id && deptName.get(u.department_id)
                        ? ` (${deptName.get(u.department_id)})`
                        : ""}
                    </option>
                  ))
                : (subjectOptions as Department[]).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
            </select>
          </div>

          {subjectId && (
            <>
              <div className="border border-neutral-200 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Record Type</th>
                      {ACTIONS.map((a) => (
                        <th key={a} className="text-center px-4 py-3 font-medium">
                          {ACTION_LABEL[a]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {RESOURCES.map((resource) => (
                      <tr key={resource}>
                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {RESOURCE_LABEL[resource]}
                        </td>
                        {ACTIONS.map((action) => (
                          <td key={action} className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={draft[resource][action]}
                              onChange={() => toggleFlag(resource, action)}
                              className="w-4 h-4 accent-amber-500"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSavePermissions}
                  disabled={busy}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-ink disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Save Permissions"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
