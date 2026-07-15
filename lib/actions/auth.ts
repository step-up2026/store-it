"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Base URL for links in auth emails (confirm signup, reset password).
// Prefer the configured app URL so emails always point at production,
// falling back to the request origin for local dev.
async function siteUrl(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${h.get("host")}`;
}

export async function signIn(email: string, password: string) {
  if (!email.trim() || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) return { error: error.message };
  return { data: true };
}

export async function signUp(
  fullName: string,
  email: string,
  password: string,
) {
  if (!fullName.trim()) return { error: "Full name is required" };
  if (!email.trim()) return { error: "Email is required" };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=/products`,
      // handle_new_user trigger reads full_name from this metadata;
      // role defaults to storekeeper until an admin promotes them.
      data: { full_name: fullName.trim() },
    },
  });

  if (error) return { error: error.message };

  // With email confirmation on, Supabase returns a user with no identities
  // for an already-registered email instead of an error.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      error: "An account with this email already exists. Try signing in instead.",
    };
  }

  return { data: { needsConfirmation: !data.session } };
}

export async function requestPasswordReset(email: string) {
  if (!email.trim()) return { error: "Email is required" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${await siteUrl()}/auth/callback?next=/reset-password`,
  });

  // Rate limiting is worth surfacing; anything else stays generic so the
  // form can't be used to probe which emails have accounts.
  if (error && error.status === 429) {
    return { error: "Too many reset requests — please wait a minute and try again." };
  }
  return { data: true };
}

export async function updatePassword(password: string) {
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "Your reset link has expired or was already used. Request a new one from the login page.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { data: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { data: true };
}
