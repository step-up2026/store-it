"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionProfile } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/teams", label: "Teams" },
  { href: "/usage", label: "Usage Log" },
  { href: "/reorder-lists", label: "Reorder Lists" },
];

const ROLE_LABEL: Record<SessionProfile["role"], string> = {
  storekeeper: "Storekeeper",
  purchasing_officer: "Purchasing Officer",
};

export function Navbar({ profile }: { profile: SessionProfile | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-neutral-200 bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-14">
        <span className="font-semibold tracking-tight text-neutral-900">
          Store-It
        </span>
        {profile && (
          <>
            <div className="flex gap-1 flex-1">
              {LINKS.map((link) => {
                const active =
                  pathname === link.href ||
                  pathname?.startsWith(link.href + "/");
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
            <div className="flex items-center gap-3 text-sm">
              <span className="text-neutral-500">
                {profile.full_name || profile.email}{" "}
                <span className="text-neutral-400">
                  ({ROLE_LABEL[profile.role]})
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="text-neutral-600 hover:text-neutral-900 font-medium"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
