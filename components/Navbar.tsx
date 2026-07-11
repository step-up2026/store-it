"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionProfile } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";

const LINKS = [
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
];

const ROLE_LABEL: Record<SessionProfile["role"], string> = {
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

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active =
          pathname === link.href || pathname?.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              active
                ? "bg-amber-500 text-slate-900"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <NavIcon>{link.icon}</NavIcon>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

function UserPanel({
  profile,
  onLogout,
}: {
  profile: SessionProfile;
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-slate-800 pt-4 mt-4">
      <p className="text-sm text-white font-medium truncate">
        {profile.full_name || profile.email}
      </p>
      <p className="text-xs text-slate-400 mb-3">{ROLE_LABEL[profile.role]}</p>
      <button
        onClick={onLogout}
        className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        Logout
      </button>
    </div>
  );
}

export function Navbar({ profile }: { profile: SessionProfile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setMobileOpen(false);
    await signOut();
    router.push("/login");
    router.refresh();
  }

  if (!profile) {
    return (
      <div className="md:hidden sticky top-0 z-20 bg-slate-900 h-14 flex items-center px-4">
        <span className="font-semibold tracking-tight text-white">
          Store-It
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-20 bg-slate-900 h-14 flex items-center gap-3 px-4">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="text-white p-1 -ml-1"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-6 h-6"
          >
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold tracking-tight text-white">
          Store-It
        </span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-slate-900 flex flex-col p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold tracking-tight text-white">
                Store-It
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-slate-400 hover:text-white p-1"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <NavLinks
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
            <div className="flex-1" />
            <UserPanel profile={profile} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 bg-slate-900 px-4 py-5">
        <span className="font-semibold tracking-tight text-white text-lg px-3 mb-6">
          Store-It
        </span>
        <NavLinks pathname={pathname} />
        <div className="flex-1" />
        <UserPanel profile={profile} onLogout={handleLogout} />
      </aside>
    </>
  );
}
