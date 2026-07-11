"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await signIn(email, password);

    if (res.error) {
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
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          required
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {saving ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
