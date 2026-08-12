import {
  Clock,
  Users,
  BarChart3,
  PenSquare,
  Upload,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ProductPreview } from "@/components/marketing/product-preview";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CAPABILITIES = [
  {
    icon: Clock,
    title: "Attendance, tracked automatically",
    description:
      "Staff check in from a shared link — no login required. See who's in, who's late, and who hasn't shown up, in real time.",
  },
  {
    icon: Users,
    title: "One place for workforce data",
    description:
      "Add employees by hand or import a CSV. Departments, shifts, and roles stay organized and searchable.",
  },
  {
    icon: BarChart3,
    title: "Trends you can act on",
    description:
      "Attendance rate, department distribution, and lateness patterns — calculated from your real data, not guesses.",
  },
  {
    icon: PenSquare,
    title: "Writing assistant for HR letters",
    description:
      "Draft query, warning, and confirmation letters grounded in what actually happened. (Pro plan.)",
  },
  {
    icon: Upload,
    title: "Bring your own data",
    description:
      "Download a template, fill it in, and import your whole team in minutes — with validation before anything is saved.",
  },
  {
    icon: ShieldCheck,
    title: "Built for your organization only",
    description:
      "Every organization's data is isolated at the database level. Your team never sees another company's records.",
  },
];

const STEPS = [
  { step: "1", title: "Create your workspace", description: "Sign up and tell us a little about your organization." },
  { step: "2", title: "Add your team", description: "Add employees one at a time, or import a CSV in a few clicks." },
  { step: "3", title: "See what's happening", description: "Share the check-in link, then read attendance, trends, and insights from real data." },
];

const FAQS = [
  {
    q: "Is HRInsights a replacement for HR software we already use?",
    a: "No — HRInsights is a focused attendance and workforce-insight layer. It's built to sit alongside your existing processes, not replace professional HR judgment.",
  },
  {
    q: "Where does the data in my dashboard come from?",
    a: "Entirely from what your organization enters: employees you add or import, and attendance check-ins. We don't fabricate metrics — if there's no data yet, you'll see an empty state instead.",
  },
  {
    q: "Do my employees need an account to check in?",
    a: "No. You share one check-in link with your team; they pick their name and check in from any device, without creating an account.",
  },
  {
    q: "How do I upgrade my plan?",
    a: "From Settings or the Pricing page — upgrading takes you to a secure Selar checkout. Your plan updates once payment is confirmed.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <MarketingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-forest-950/5 px-3 py-1 text-xs font-medium text-forest-800">
              Workforce intelligence for growing teams
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
              Understand your workforce — don&apos;t just track it.
            </h1>
            <p className="mt-5 text-lg text-ink-500">
              HRInsights turns attendance and employee data into clear, honest dashboards — so you can
              see what&apos;s actually happening with your team and decide what to do about it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/signup" size="lg">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <a href="#how-it-works">
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Product preview */}
        <section id="product" className="mx-auto max-w-6xl px-6 pb-24">
          <ProductPreview />
        </section>

        {/* Capabilities */}
        <section className="border-y border-ink-900/8 bg-cream-50 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
              Everything you need to read your workforce clearly
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((c) => (
                <Card key={c.title} className="p-6">
                  <c.icon className="h-5 w-5 text-forest-700" />
                  <h3 className="mt-3 text-sm font-semibold text-ink-900">{c.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500">{c.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold text-ink-900 sm:text-3xl">How it works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-950 text-sm font-semibold text-cream-50">
                  {s.step}
                </span>
                <h3 className="mt-4 text-sm font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="border-y border-ink-900/8 bg-forest-950 py-20">
          <div className="mx-auto max-w-6xl px-6 text-cream-50">
            <h2 className="text-2xl font-semibold sm:text-3xl">Built for teams that are done guessing</h2>
            <p className="mt-3 max-w-2xl text-cream-50/70">
              HRInsights is for HR managers, operations leads, and founders who need a clear, current
              read on attendance and workforce composition — without spreadsheets that go stale.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-ink-900 sm:text-3xl">Simple, transparent pricing</h2>
            <p className="mt-2 text-ink-500">Start free. Upgrade when your team outgrows it.</p>
          </div>
          <PricingTable starterLink={process.env.STARTER_PAYMENT_LINK || null} proLink={process.env.PRO_PAYMENT_LINK || null} />
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-ink-900/8 bg-cream-50 py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-2xl font-semibold text-ink-900 sm:text-3xl">Frequently asked questions</h2>
            <div className="mt-8 divide-y divide-ink-900/8">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="cursor-pointer list-none text-sm font-medium text-ink-900">
                    {f.q}
                  </summary>
                  <p className="mt-2 text-sm text-ink-500">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            See your workforce clearly, starting today.
          </h2>
          <div className="mt-6">
            <ButtonLink href="/signup" size="lg">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
