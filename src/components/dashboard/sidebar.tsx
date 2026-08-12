"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { DASHBOARD_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar({
  fullName,
  email,
}: {
  fullName: string | null;
  email: string | null;
}) {
  const pathname = usePathname();
  const initials = (fullName ?? email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <aside className="hidden w-60 shrink-0 flex-col justify-between bg-forest-950 px-4 py-6 lg:flex">
      <div>
        <Link href="/dashboard" className="block px-2">
          <Logo tone="light" markClassName="h-7 w-7" />
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {DASHBOARD_NAV.map((item) => {
            const active =
              item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-lime-400 text-forest-950 font-semibold"
                    : "text-cream-50/70 hover:bg-forest-900 hover:text-cream-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname.startsWith("/dashboard/settings")
              ? "bg-lime-400 text-forest-950 font-semibold"
              : "text-cream-50/70 hover:bg-forest-900 hover:text-cream-50"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="mt-4 flex items-center gap-2.5 rounded-lg px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400 text-xs font-semibold text-forest-950">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-cream-50">{fullName ?? "Your account"}</p>
            <p className="truncate text-xs text-cream-50/50">{email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-forest-950/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute left-0 top-0 h-full w-64 bg-forest-950 px-4 py-6">
        <Logo tone="light" markClassName="h-7 w-7" />
        <nav className="mt-8 flex flex-col gap-1">
          {[...DASHBOARD_NAV, { href: "/dashboard/settings", label: "Settings", icon: Settings }].map(
            (item) => {
              const active =
                item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-lime-400 text-forest-950 font-semibold"
                      : "text-cream-50/70 hover:bg-forest-900 hover:text-cream-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            }
          )}
        </nav>
      </div>
    </div>
  );
}

export { LogoMark };
