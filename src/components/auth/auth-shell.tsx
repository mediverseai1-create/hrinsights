import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function AuthShell({
  headline,
  subhead,
  children,
}: {
  headline: string;
  subhead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-forest-950 p-10 lg:flex">
        <Link href="/">
          <Logo tone="light" />
        </Link>
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime-400/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-forest-600/40 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-sm">
          <h1 className="text-3xl font-semibold leading-tight text-cream-50">{headline}</h1>
          <p className="mt-3 text-sm text-cream-50/70">{subhead}</p>
        </div>
        <p className="relative text-xs text-cream-50/40">
          &copy; {new Date().getFullYear()} HRInsights. Workforce intelligence for growing teams.
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
