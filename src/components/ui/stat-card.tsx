import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  tone = "default",
  hint,
  className,
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger" | "brand";
  hint?: string;
  className?: string;
}) {
  const valueTone =
    tone === "warning"
      ? "text-warning-600"
      : tone === "danger"
      ? "text-danger-600"
      : tone === "brand"
      ? "text-forest-950"
      : "text-ink-900";

  return (
    <Card className={cn("p-5", className)}>
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className={cn("mt-2 text-3xl font-semibold tracking-tight", valueTone)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </Card>
  );
}
