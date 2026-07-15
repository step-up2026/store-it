"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    const res = await signUp(fullName, email, password);

    if ("error" in res && res.error) {
      setSaving(false);
      setError(res.error);
      return;
    }

    if ("data" in res && res.data && !res.data.needsConfirmation) {
      // Email confirmation is off — already signed in
      router.push("/products");
      router.refresh();
      return;
    }

    setSaving(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 bg-white border border-neutral-200 rounded-lg p-6 text-center">
        <div className="rounded-md border border-green-300 bg-green-50 text-green-800 px-3 py-3 text-sm">
          Almost there — we sent a confirmation link to{" "}
          <span className="font-medium">{email.trim()}</span>. Click it to
          activate your account, then sign in.
        </div>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-neutral-700 underline"
        >
          Back to sign in
        </Link>
      </div>
    );
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
          Full name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          required
          autoFocus
        />
      </div>
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
          minLength={8}
          required
        />
        <p className="text-xs text-neutral-400 mt-1">At least 8 characters</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Confirm password
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
        {saving ? "Creating account…" : "Create Account"}
      </button>
      <p className="text-sm text-neutral-500 text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-neutral-700 underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
