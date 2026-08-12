import { cn } from "@/lib/utils";

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" className="fill-forest-950" />
      <rect x="9" y="9" width="9.5" height="9.5" rx="2.5" className="fill-lime-400" />
      <rect x="21.5" y="9" width="9.5" height="9.5" rx="2.5" className="fill-cream-50" fillOpacity="0.9" />
      <rect x="9" y="21.5" width="9.5" height="9.5" rx="2.5" className="fill-cream-50" fillOpacity="0.9" />
      <rect x="21.5" y="21.5" width="9.5" height="9.5" rx="2.5" className="fill-lime-400" />
    </svg>
  );
}

/**
 * Full HRInsights lockup: mark + wordmark.
 * `tone="light"` renders the wordmark in cream for dark surfaces (sidebar, auth split-panel).
 */
function Logo({
  className,
  tone = "dark",
  markClassName = "h-8 w-8",
}: {
  className?: string;
  tone?: "dark" | "light";
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span
        className={cn(
          "text-[1.05rem] font-semibold tracking-tight leading-none",
          tone === "light" ? "text-cream-50" : "text-ink-900"
        )}
      >
        HR<span className="font-normal opacity-80">Insights</span>
      </span>
    </span>
  );
}

export { Logo, LogoMark };
