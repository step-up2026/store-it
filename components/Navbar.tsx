"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionProfile } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";

type NavLink = { href: string; label: string; icon: React.ReactNode; adminOnly?: boolean };

const LINKS: NavLink[] = [
  {
    href: "/products",
    label: "Products",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7L12 3 4 7m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    ),
  },
  {
    href: "/suppliers",
    label: "Suppliers",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 11h.01M15 11h.01M9 7h.01M15 7h.01"
      />
    ),
  },
  {
    href: "/teams",
    label: "Teams",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-2.13a4 4 0 100-8 4 4 0 000 8zm6 4v-2a4 4 0 00-3-3.87"
      />
    ),
  },
  {
    href: "/usage",
    label: "Usage Log",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    ),
  },
  {
    href: "/reorder-lists",
    label: "Reorder Lists",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17V7m0 10l-4-4m4 4l4-4m2-6v10m0-10l-4 4m4-4l4 4"
      />
    ),
  },
  {
    href: "/admin",
    label: "User Management",
    adminOnly: true,
    icon: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
  },
];

const ROLE_LABEL: Record<SessionProfile["role"], string> = {
  admin: "Administrator",
  storekeeper: "Storekeeper",
  purchasing_officer: "Purchasing Officer",
};

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="w-5 h-5 shrink-0"
    >
      {children}
    </svg>
  );
}

export function Navbar({ profile }: { profile: SessionProfile | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  if (!profile) return null;

  const links = LINKS.filter((l) => !l.adminOnly || profile.role === "admin");

  return (
    <>
      {/* Mobile: narrow icon-only rail; pressing an icon shows its label above it */}
      <aside className="md:hidden fixed inset-y-0 left-0 z-20 w-14 bg-ink flex flex-col items-center py-4 gap-1">
        <span className="w-9 h-9 rounded-md bg-safety text-ink font-bold text-lg flex items-center justify-center mb-3">
          S
        </span>
        {links.map((link) => {
          const active =
            pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
                active
                  ? "bg-safety text-ink"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-800"
              }`}
            >
              <NavIcon>{link.icon}</NavIcon>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-ink text-white text-xs px-2 py-1 shadow-lg border border-slate-700 opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus-visible:opacity-100 transition-opacity z-50">
                {link.label}
              </span>
            </Link>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="group relative flex items-center justify-center w-10 h-10 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-800"
        >
          <NavIcon>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </NavIcon>
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-ink text-white text-xs px-2 py-1 shadow-lg border border-slate-700 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity z-50">
            Logout
          </span>
        </button>
      </aside>

      {/* Desktop: full labeled sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 bg-ink px-4 py-5">
        <span className="font-semibold tracking-tight text-white text-lg px-3 mb-6">
          Store-It
        </span>
        <div className="flex flex-col gap-1">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-safety text-ink"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <NavIcon>{link.icon}</NavIcon>
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="border-t border-slate-800 pt-4 mt-4">
          <p className="text-sm text-white font-medium truncate">
            {profile.full_name || profile.email}
          </p>
          <p className="text-xs text-slate-400 mb-3">
            {ROLE_LABEL[profile.role]}
          </p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
