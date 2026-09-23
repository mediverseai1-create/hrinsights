import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function EyebrowBadge({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-ink-900/8 bg-white px-4 py-1.5 text-xs text-ink-500 shadow-sm sm:text-sm",
        className
      )}
    >
      <span className="font-semibold text-ink-900">{label}</span>
      <span className="hidden h-3 w-px bg-ink-900/15 sm:block" />
      <span className="hidden sm:inline">{children}</span>
      <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
    </span>
  );
}

export function SectionEyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.14em]",
        tone === "light" ? "text-cream-50/50" : "text-ink-400"
      )}
    >
      {children}
    </p>
  );
}
