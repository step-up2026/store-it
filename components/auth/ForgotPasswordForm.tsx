"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await requestPasswordReset(email);
    setSaving(false);

    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 bg-white border border-neutral-200 rounded-lg p-6 text-center">
        <div className="rounded-md border border-green-300 bg-green-50 text-green-800 px-3 py-3 text-sm">
          If an account exists for{" "}
          <span className="font-medium">{email.trim()}</span>, a password reset
          link is on its way. Check your inbox (and spam folder).
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
      <button
        type="submit"
        disabled={saving}
        className="w-full px-4 py-2 rounded-md text-sm font-medium bg-graphite text-white hover:bg-ink disabled:opacity-50"
      >
        {saving ? "Sending…" : "Send Reset Link"}
      </button>
      <p className="text-sm text-neutral-500 text-center">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-neutral-700 underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
