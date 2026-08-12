import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-ink-900/8 bg-cream-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
            <Link href="/#product" className="hover:text-ink-900">
              Product
            </Link>
            <Link href="/pricing" className="hover:text-ink-900">
              Pricing
            </Link>
            <Link href="/#faq" className="hover:text-ink-900">
              FAQ
            </Link>
            <Link href="/login" className="hover:text-ink-900">
              Log in
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-ink-400">
          &copy; {new Date().getFullYear()} HRInsights. A business-intelligence and decision-support tool —
          not a substitute for professional HR judgment.
        </p>
      </div>
    </footer>
  );
}
