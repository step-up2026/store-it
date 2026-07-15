import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Lands every auth email link (signup confirmation, password recovery).
// Supabase redirects here with either a PKCE ?code= or a ?token_hash=&type=
// depending on the email template; support both, establish the session,
// then continue to ?next= (e.g. /reset-password for recovery links).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const rawNext = url.searchParams.get("next") ?? "/products";
  // Only allow same-site relative redirects
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/products";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }

  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
