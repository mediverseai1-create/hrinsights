"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

const LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/#modules", label: "Modules" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-3 z-30 px-4 sm:top-4 sm:px-6">
      <header className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-ink-900/8 bg-white/90 px-3 shadow-[0_2px_20px_rgba(12,31,21,0.08)] backdrop-blur-md sm:px-4">
        <Link href="/" onClick={() => setOpen(false)} className="pl-1">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-ink-700 hover:text-ink-900">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 sm:flex">
          <Link href="/login" className="text-sm font-medium text-ink-700 hover:text-ink-900">
            Log in
          </Link>
          <ButtonLink href="/signup" size="sm" className="rounded-full">
            Get Started
          </ButtonLink>
        </div>
        <button
          className="rounded-full p-2 text-ink-700 hover:bg-cream-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <nav className="mx-auto mt-2 max-w-5xl rounded-3xl border border-ink-900/8 bg-white p-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-200"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-200"
            >
              Log in
            </Link>
            <ButtonLink href="/signup" size="sm" className="mt-2 justify-center rounded-full">
              Get Started
            </ButtonLink>
          </div>
        </nav>
      )}
    </div>
  );
}
