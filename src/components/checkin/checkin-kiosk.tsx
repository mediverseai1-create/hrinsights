"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface RosterEntry {
  employee_id: string;
  full_name: string;
}

type Result = { kind: "check-in"; status: string } | { kind: "check-out" } | null;

export function CheckInKiosk({ orgSlug, orgName }: { orgSlug: string; orgName: string }) {
  const [now, setNow] = useState(new Date());
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; data: Result } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .rpc("get_checkin_roster", { org_slug: orgSlug })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRoster(data ?? []);
        setLoading(false);
      });
  }, [orgSlug]);

  const filtered = roster.filter((r) => r.full_name.toLowerCase().includes(query.toLowerCase()));

  async function checkIn(entry: RosterEntry) {
    setBusyId(entry.employee_id);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .rpc("record_check_in", { org_slug: orgSlug, p_employee_id: entry.employee_id })
      .single();
    setBusyId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setResult({ name: entry.full_name, data: { kind: "check-in", status: data?.status ?? "present" } });
  }

  async function checkOut(entry: RosterEntry) {
    setBusyId(entry.employee_id);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("record_check_out", {
      org_slug: orgSlug,
      p_employee_id: entry.employee_id,
    });
    setBusyId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setResult({ name: entry.full_name, data: { kind: "check-out" } });
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest-950 px-4">
        <Card className="w-full max-w-sm p-8 text-center">
          <p className="text-sm text-ink-500">
            {result.data?.kind === "check-in" ? "Checked in" : "Checked out"}
          </p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">{result.name}</p>
          {result.data?.kind === "check-in" && (
            <p className="mt-1 text-sm capitalize text-ink-500">Status: {result.data.status}</p>
          )}
          <p className="mt-1 text-xs text-ink-400">
            {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <Button className="mt-6 w-full" onClick={() => setResult(null)}>
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest-950 px-4 py-10">
      <div className="mx-auto w-full max-w-md text-center">
        <LogoMark className="mx-auto h-10 w-10" />
        <p className="mt-4 text-sm text-cream-50/60">{orgName}</p>
        <p className="mt-1 text-4xl font-semibold tabular-nums text-cream-50">
          {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
        </p>

        <Card className="mt-6 p-4 text-left">
          <Input
            placeholder="Search your name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
            {loading && <p className="py-6 text-center text-sm text-ink-400">Loading roster…</p>}
            {!loading && filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-400">
                {roster.length === 0 ? "No active employees found for this organization." : "No matches."}
              </p>
            )}
            {filtered.map((entry) => (
              <div
                key={entry.employee_id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-cream-50"
              >
                <span className="text-sm font-medium text-ink-900">{entry.full_name}</span>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === entry.employee_id}
                    onClick={() => checkOut(entry)}
                  >
                    Check out
                  </Button>
                  <Button
                    size="sm"
                    disabled={busyId === entry.employee_id}
                    onClick={() => checkIn(entry)}
                  >
                    Check in
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="mt-2 text-xs text-danger-600">{error}</p>}
        </Card>
      </div>
    </div>
  );
}
