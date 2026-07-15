"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/actions/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    const res = await updatePassword(password);

    if ("error" in res && res.error) {
      setSaving(false);
      setError(res.error);
      return;
    }

    router.push("/products");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white border border-neutral-200 rounded-lg p-6"
    >
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 text-red-800 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          New password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          minLength={8}
          required
          autoFocus
        />
        <p className="text-xs text-neutral-400 mt-1">At least 8 characters</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Confirm new password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          minLength={8}
          required
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-ink disabled:opacity-50"
      >
        {saving ? "Saving…" : "Set New Password"}
      </button>
    </form>
  );
}
