import {
  LayoutDashboard,
  UserPlus,
  Clock,
  Users,
  BarChart3,
  MessagesSquare,
  PenSquare,
  BookOpen,
  Settings,
} from "lucide-react";

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/recruiting", label: "Recruiting", icon: UserPlus },
  { href: "/dashboard/employees", label: "People", icon: Users },
  { href: "/dashboard/attendance", label: "Attendance", icon: Clock },
  { href: "/dashboard/insights", label: "Workforce Intelligence", icon: BarChart3 },
  { href: "/dashboard/assistant", label: "HR Assistant", icon: MessagesSquare },
  { href: "/dashboard/writing-assistant", label: "Documents", icon: PenSquare },
  { href: "/dashboard/knowledge", label: "Company Knowledge", icon: BookOpen },
] as const;

export const SETTINGS_NAV = [{ href: "/dashboard/settings", label: "Settings", icon: Settings }];

export const DEFAULT_DEPARTMENTS = [
  "Sales",
  "Operations",
  "Customer Support",
  "Design",
  "Engineering",
  "HR",
  "Finance",
] as const;

export const INDUSTRIES = [
  "Technology",
  "Retail & E-commerce",
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Education",
  "Hospitality",
  "Professional Services",
  "Other",
] as const;

export const ORG_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

export const CURRENCIES = ["USD", "NGN", "GBP", "EUR", "KES", "ZAR", "GHS"] as const;

export const PLANS = {
  free: {
    id: "free" as const,
    name: "Free",
    price: 0,
    priceLabel: "$0",
    tagline: "Try HRInsights with a small team.",
    features: [
      "Up to 10 employees",
      "Attendance check-in",
      "Basic dashboard overview",
      "1 department",
    ],
    limits: { maxEmployees: 10, csvImport: false, aiWritingAssistant: false, reportsExport: false },
  },
  starter: {
    id: "starter" as const,
    name: "Starter",
    price: 47,
    priceLabel: "$47",
    tagline: "For growing teams that need real workforce visibility.",
    features: [
      "Up to 100 employees",
      "CSV workforce import",
      "Attendance trends & insights",
      "Unlimited departments",
      "Exportable reports",
    ],
    limits: { maxEmployees: 100, csvImport: true, aiWritingAssistant: false, reportsExport: true },
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    price: 97,
    priceLabel: "$97",
    tagline: "Full workforce intelligence for scaling organizations.",
    features: [
      "Unlimited employees",
      "Everything in Starter",
      "AI writing assistant for HR letters",
      "AI-grounded insights (coming soon)",
      "Priority support",
    ],
    limits: { maxEmployees: Infinity, csvImport: true, aiWritingAssistant: true, reportsExport: true },
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const LETTER_DOCUMENT_TYPES = [
  { value: "query", label: "Query letter" },
  { value: "warning", label: "Warning letter" },
  { value: "confirmation", label: "Confirmation letter" },
  { value: "reference", label: "Reference letter" },
  { value: "offer", label: "Offer letter" },
  { value: "termination", label: "Termination letter" },
] as const;

export const LETTER_TONES = [
  { value: "firm", label: "Firm" },
  { value: "neutral", label: "Neutral" },
  { value: "friendly", label: "Friendly" },
] as const;
