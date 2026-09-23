import { ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { ProductPreview } from "@/components/marketing/product-preview";
import { PricingTable } from "@/components/marketing/pricing-table";
import { EyebrowBadge, SectionEyebrow } from "@/components/marketing/eyebrow-badge";
import { Button, ButtonLink } from "@/components/ui/button";

const WORKFLOW = [
  "Need to hire",
  "Find & review candidates",
  "Screen",
  "Interview",
  "Hire",
  "Onboard",
  "Manage",
  "Understand your workforce",
];

const CAPABILITIES = [
  {
    title: "Recruiting Agent",
    description:
      "Describe who you need to hire, in plain language. HRInsights drafts the posting, then reads and ranks every applicant against your requirements.",
  },
  {
    title: "Screening & interviews",
    description:
      "Auto-generated screening questions and interview briefs, plus a structured, evidence-based summary after every conversation.",
  },
  {
    title: "Attendance & people",
    description:
      "Staff check in from a shared link, no account required. Every employee gets one workspace — attendance, documents, timeline, notes.",
  },
  {
    title: "Workforce intelligence",
    description:
      "Attendance patterns, department trends, and staffing changes explained in plain language, backed by the real numbers behind them.",
  },
  {
    title: "HR documents",
    description:
      "Say what happened. HRInsights pulls the relevant records and drafts the query, warning, or reference letter for you to review.",
  },
  {
    title: "Company knowledge & assistant",
    description:
      "Upload your policies once. Ask HRInsights anything — every answer is grounded in your own documents and data, never a guess.",
  },
];

const MODULES = [
  {
    n: "01",
    tag: "RECRUIT",
    title: "Recruiting Agent",
    description: "One hiring request in — a live posting, a pipeline, and ranked candidates out.",
  },
  {
    n: "02",
    tag: "EVALUATE",
    title: "Screening & Interviews",
    description: "Questions, briefs, and evidence-based summaries prepared before you ask.",
  },
  {
    n: "03",
    tag: "TRACK",
    title: "Attendance & People",
    description: "Check-ins, timelines, and documents for every employee, in one workspace.",
  },
  {
    n: "04",
    tag: "UNDERSTAND",
    title: "Workforce Intelligence",
    description: "The trends, anomalies, and risks in your workforce data — explained, not just charted.",
  },
  {
    n: "05",
    tag: "RESOLVE",
    title: "Documents & Knowledge",
    description: "Letters drafted from real records. Policy questions answered from your own handbook.",
  },
];

const FAQS = [
  {
    q: "Is HRInsights a replacement for HR software we already use?",
    a: "No — HRInsights is an AI decision-support layer for recruiting, attendance, and workforce data. It's built to sit alongside your existing processes and human judgment, not replace them.",
  },
  {
    q: "Where does the data in my dashboard come from?",
    a: "Entirely from what your organization enters or uploads: employees, attendance check-ins, job postings, and applications. We don't fabricate metrics — if there's no data yet, you'll see an empty state instead.",
  },
  {
    q: "Does HRInsights make hiring or disciplinary decisions on its own?",
    a: "No. HRInsights analyzes evidence, summarizes it, and drafts what it can — but consequential decisions (hiring, discipline, termination) always require human review before anything is finalized.",
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
        <section className="hero-mesh relative overflow-hidden">
          <div className="mx-auto max-w-5xl px-6 pb-20 pt-16 text-center sm:pt-20">
            <EyebrowBadge label="Platform" className="mx-auto">
              One AI HR operating system, not six disconnected tools
            </EyebrowBadge>

            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-ink-400">The AI </span>
              <span className="text-ink-900">Human Resource Manager</span>
              <span className="text-ink-400"> for businesses that can&apos;t run HR on </span>
              <span className="text-ink-900">spreadsheets and guesswork</span>
              <span className="text-ink-400">.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg font-semibold text-ink-700">
              Your company&apos;s HR, powered by AI.
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-base text-ink-500">
              HRInsights recruits, screens, and interviews candidates, tracks attendance and people,
              explains your workforce data, and drafts the documents you need — from one connected
              workspace, not a stack of forms.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/signup" size="lg" className="rounded-full">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="rounded-full">
                  See How It Works
                </Button>
              </a>
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-sm text-ink-500">
              {WORKFLOW.map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-full border border-ink-900/10 bg-white px-3 py-1.5 text-ink-700 shadow-sm">
                    {step}
                  </span>
                  {i < WORKFLOW.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-ink-400" />}
                </span>
              ))}
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
            <SectionEyebrow>What HRInsights handles</SectionEyebrow>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              <span className="text-ink-900">Hiring is already happening in your inbox.</span>{" "}
              <span className="text-ink-400">Most teams never turn it into a pipeline.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-ink-500">
              HRInsights reads the hiring request you type, the applications that arrive, and the
              records you already have — and turns them into a working pipeline, a screened shortlist,
              and the documents you need to act.
            </p>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-ink-900/8 bg-ink-900/8 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((c) => (
                <div key={c.title} className="bg-white p-6">
                  <span className="block h-0.5 w-8 bg-forest-700" />
                  <h3 className="mt-4 text-sm font-semibold text-ink-900">{c.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section id="modules" className="mx-auto max-w-6xl px-6 py-20">
          <SectionEyebrow>Five modules, one workspace</SectionEyebrow>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            <span className="text-ink-900">Not eight disconnected tools.</span>{" "}
            <span className="text-ink-400">One system built to run your HR operation.</span>
          </h2>

          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {MODULES.map((m) => (
              <div key={m.n} className="border-t border-ink-900/10 pt-5">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-forest-700">
                  <span>{m.n}</span>
                  <span className="text-ink-900/20">·</span>
                  <span>{m.tag}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-ink-900">{m.title}</h3>
                <p className="mt-1.5 max-w-md text-sm text-ink-500">{m.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-ink-900/8 bg-cream-50 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Minimum input. Maximum output.
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                { step: "1", title: "Create your workspace", description: "Sign up and tell us a little about your organization." },
                { step: "2", title: "Bring your team and your hiring", description: "Add employees, or describe a role you need to fill — HRInsights takes it from there." },
                { step: "3", title: "Review, don't re-type", description: "Candidates get screened, interviews get prepared, and letters get drafted. You review and approve." },
              ].map((s) => (
                <div key={s.step}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-950 text-sm font-semibold text-cream-50">
                    {s.step}
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-ink-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Governance / trust */}
        <section className="border-y border-ink-900/8 bg-forest-950 py-20">
          <div className="mx-auto max-w-6xl px-6 text-cream-50">
            <SectionEyebrow tone="light">Built for businesses, not hobby projects</SectionEyebrow>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              <span className="text-cream-50">AI that shows its work</span>{" "}
              <span className="text-cream-50/40">— and knows where to stop.</span>
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-cream-50">Evidence, not vibes</h3>
                <p className="mt-1.5 text-sm text-cream-50/60">
                  Every AI match, summary, and recommendation is traceable to the record it came from.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cream-50">Human review, always</h3>
                <p className="mt-1.5 text-sm text-cream-50/60">
                  Hiring, discipline, and termination decisions stay with your team — HRInsights prepares,
                  it doesn&apos;t decide.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cream-50">Isolated by design</h3>
                <p className="mt-1.5 text-sm text-cream-50/60">
                  Every organization&apos;s data is isolated at the database level. Your team never sees
                  another company&apos;s records.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 text-center">
            <SectionEyebrow>Pricing</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-2 text-ink-500">Start free. Upgrade when your team outgrows it.</p>
          </div>
          <PricingTable starterLink={process.env.STARTER_PAYMENT_LINK || null} proLink={process.env.PRO_PAYMENT_LINK || null} />
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-ink-900/8 bg-cream-50 py-20">
          <div className="mx-auto max-w-3xl px-6">
            <SectionEyebrow>FAQ</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Frequently asked questions
            </h2>
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
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Your company&apos;s HR, powered by AI — starting today.
          </h2>
          <div className="mt-6">
            <ButtonLink href="/signup" size="lg" className="rounded-full">
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
