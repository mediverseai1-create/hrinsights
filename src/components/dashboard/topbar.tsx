"use client";

import { useState } from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { MobileSidebar } from "@/components/dashboard/sidebar";
import { Badge } from "@/components/ui/badge";

export function Topbar({
  organizationName,
  plan,
  fullName,
  email,
}: {
  organizationName: string;
  plan: string;
  fullName: string | null;
  email: string | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (fullName ?? email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-ink-900/8 bg-cream-50 px-4 lg:px-6">
      <button
        className="rounded-md p-1.5 text-ink-700 hover:bg-cream-200 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        {plan === "free" && (
          <a href="/pricing">
            <Badge tone="brand" className="cursor-pointer">
              Upgrade
            </Badge>
          </a>
        )}
        <span className="hidden items-center gap-1 text-sm font-medium text-ink-900 sm:flex">
          {organizationName}
          <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
        </span>
        <button
          className="rounded-full p-2 text-ink-500 hover:bg-cream-200"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400 text-xs font-semibold text-forest-950">
          {initials}
        </span>
      </div>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
