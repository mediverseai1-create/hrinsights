import { Check, Lock } from "lucide-react";
import { PLANS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingTable({
  starterLink,
  proLink,
  currentPlan,
}: {
  starterLink: string | null;
  proLink: string | null;
  currentPlan?: string;
}) {
  const plans = [
    { ...PLANS.free, link: null, highlight: false },
    { ...PLANS.starter, link: starterLink, highlight: true },
    { ...PLANS.pro, link: proLink, highlight: false },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = currentPlan === plan.id;
        return (
          <Card
            key={plan.id}
            className={cn(
              "flex flex-col p-6",
              plan.highlight && "border-forest-950 ring-1 ring-forest-950"
            )}
          >
            {plan.highlight && (
              <span className="mb-3 w-fit rounded-full bg-lime-400 px-2.5 py-1 text-xs font-semibold text-forest-950">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-ink-900">{plan.name}</h3>
            <p className="mt-1 text-sm text-ink-500">{plan.tagline}</p>
            <p className="mt-4">
              <span className="text-3xl font-semibold text-ink-900">{plan.priceLabel}</span>
              {plan.price > 0 && <span className="text-sm text-ink-400">/month</span>}
            </p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {isCurrent ? (
                <Button variant="outline" className="w-full" disabled>
                  Current plan
                </Button>
              ) : plan.id === "free" ? (
                <ButtonLink href="/signup" variant="outline" className="w-full">
                  Get started free
                </ButtonLink>
              ) : plan.link ? (
                <a href={plan.link} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full">Upgrade to {plan.name}</Button>
                </a>
              ) : (
                <Button className="w-full" variant="outline" disabled title="Payment link not configured yet">
                  <Lock className="h-3.5 w-3.5" />
                  Coming soon
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
