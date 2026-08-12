import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HRInsights — Workforce intelligence for growing teams",
    template: "%s · HRInsights",
  },
  description:
    "HRInsights helps organizations understand attendance, trends and workforce patterns through clear, data-driven dashboards.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream-100 text-ink-900">
        {children}
      </body>
    </html>
  );
}
