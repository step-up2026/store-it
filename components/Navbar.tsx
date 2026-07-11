"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/teams", label: "Teams" },
  { href: "/usage", label: "Usage Log" },
  { href: "/reorder-lists", label: "Reorder Lists" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-neutral-200 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-14">
        <span className="font-semibold tracking-tight text-neutral-900">
          Store-It
        </span>
        <div className="flex gap-1">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
