import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Store-It — Inventory Management",
  description: "Track consumable usage, stock levels, and reorders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
