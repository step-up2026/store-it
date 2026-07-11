import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Store-It — Inventory Management",
  description: "Track consumable usage, stock levels, and reorders",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const profile = await getSessionProfile(supabase);

  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 min-h-screen">
        <Navbar profile={profile} />
        {children}
      </body>
    </html>
  );
}
