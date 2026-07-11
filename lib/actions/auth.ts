"use server";

import { createClient } from "@/lib/supabase/server";

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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { data: true };
}
