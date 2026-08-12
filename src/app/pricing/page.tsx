import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { PricingTable } from "@/components/marketing/pricing-table";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentPlan: string | undefined;
  if (user) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organizations(plan)")
      .eq("user_id", user.id)
      .maybeSingle();
    currentPlan = (membership?.organizations as { plan?: string } | null)?.plan;
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <MarketingNav />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-semibold text-ink-900 sm:text-4xl">Simple, transparent pricing</h1>
            <p className="mt-3 text-ink-500">Start free. Upgrade when your team outgrows it.</p>
          </div>
          <PricingTable
            starterLink={process.env.STARTER_PAYMENT_LINK || null}
            proLink={process.env.PRO_PAYMENT_LINK || null}
            currentPlan={currentPlan}
          />
          <p className="mt-8 text-center text-xs text-ink-400">
            Upgrades are processed securely through Selar. Your plan updates once payment is confirmed —
            contact support if it doesn&apos;t update automatically after checkout.
          </p>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
