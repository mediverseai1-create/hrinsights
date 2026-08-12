import Link from "next/link";
import { AlertTriangle, UserX, TrendingDown, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface AttentionItem {
  id: string;
  icon: "warning" | "absent" | "trend" | "positive";
  message: string;
  href?: string;
  actionLabel?: string;
}

const ICONS = {
  warning: AlertTriangle,
  absent: UserX,
  trend: TrendingDown,
  positive: CheckCircle2,
};

const TONE = {
  warning: "text-warning-600",
  absent: "text-danger-600",
  trend: "text-warning-600",
  positive: "text-success-600",
};

export function NeedsAttention({ items }: { items: AttentionItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs attention</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-ink-500">Nothing needs your attention right now.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <li key={item.id} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${TONE[item.icon]}`} />
                    <p className="text-sm text-ink-900">{item.message}</p>
                  </div>
                  {item.href && (
                    <Link
                      href={item.href}
                      className="shrink-0 text-xs font-semibold text-forest-800 hover:underline"
                    >
                      {item.actionLabel ?? "View"}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
