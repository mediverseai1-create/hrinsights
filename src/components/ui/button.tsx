import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-lime-400 text-forest-950 hover:bg-lime-500 focus-visible:outline-lime-500 font-semibold",
  secondary:
    "bg-forest-950 text-cream-50 hover:bg-forest-900 focus-visible:outline-forest-950",
  outline:
    "bg-transparent text-ink-900 border border-ink-900/15 hover:bg-cream-200 focus-visible:outline-ink-500",
  ghost: "bg-transparent text-ink-700 hover:bg-cream-200 focus-visible:outline-ink-500",
  danger: "bg-danger-600 text-white hover:bg-danger-600/90 focus-visible:outline-danger-600",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
};

const base =
  "inline-flex items-center justify-center whitespace-nowrap transition-colors disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:outline-2 focus-visible:outline-offset-2";

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
}

export type ButtonProps = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

type ButtonLinkProps = ButtonBaseProps &
  React.ComponentProps<typeof Link>;

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
