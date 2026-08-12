"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CheckInLinkCard({ orgSlug }: { orgSlug: string }) {
  const [now, setNow] = useState(new Date());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const checkInPath = `/check-in/${orgSlug}`;

  async function copyLink() {
    const url = `${window.location.origin}${checkInPath}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="p-5">
      <p className="text-xs font-medium text-ink-500">Staff check-in</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-ink-900 tabular-nums">
        {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
      </p>
      <p className="mt-1 text-xs text-ink-400">
        {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <Button variant="secondary" onClick={copyLink}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Link copied" : "Copy staff check-in link"}
        </Button>
        <Link href={checkInPath} target="_blank">
          <Button variant="outline" className="w-full">
            <ExternalLink className="h-4 w-4" />
            Open check-in kiosk
          </Button>
        </Link>
      </div>
      <p className="mt-3 text-xs text-ink-400">
        Share this link with staff so they can check in from their own device — no login required.
      </p>
    </Card>
  );
}
