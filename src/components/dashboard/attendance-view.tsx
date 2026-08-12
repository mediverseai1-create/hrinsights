"use client";

import { useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckInLinkCard } from "@/components/dashboard/checkin-link-card";
import { StatCard } from "@/components/ui/stat-card";
import { manualCheckIn, manualCheckOut } from "@/app/dashboard/attendance/actions";
import { formatTime } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/types/database";

export interface AttendanceRowData {
  employeeId: string;
  name: string;
  department: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus | "not-checked-in";
  photoUrl: string | null;
}

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  present: "success",
  late: "warning",
  absent: "danger",
  "not-checked-in": "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  present: "On time",
  late: "Late",
  absent: "Absent",
  "not-checked-in": "Not checked in",
};

function hoursBetween(checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return "—";
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const hrs = Math.floor(ms / 3_600_000);
  const mins = Math.round((ms % 3_600_000) / 60_000);
  return `${hrs}h ${mins}m`;
}

export function AttendanceView({
  rows,
  departments,
  present,
  late,
  absent,
  orgSlug,
}: {
  rows: AttendanceRowData[];
  departments: string[];
  present: number;
  late: number;
  absent: number;
  orgSlug: string;
}) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => {
        if (department !== "all" && r.department !== department) return false;
        if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        // Live check-in feed: most recent arrivals first, not-yet-arrived at the bottom.
        if (!a.checkIn && !b.checkIn) return a.name.localeCompare(b.name);
        if (!a.checkIn) return 1;
        if (!b.checkIn) return -1;
        return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
      });
  }, [rows, query, department]);

  function handleCheckIn(id: string) {
    setBusyId(id);
    startTransition(async () => {
      await manualCheckIn(id);
      setBusyId(null);
    });
  }

  function handleCheckOut(id: string) {
    setBusyId(id);
    startTransition(async () => {
      await manualCheckOut(id);
      setBusyId(null);
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Attendance</h1>
          <p className="mt-1 text-sm text-ink-500">
            Live records for{" "}
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:max-w-lg">
        <StatCard label="Present" value={present} />
        <StatCard label="Late" value={late} tone="warning" />
        <StatCard label="Absent" value={absent} tone="danger" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-3 border-b border-ink-900/8 p-4 sm:flex-row sm:items-center">
            <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="sm:w-48">
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                placeholder="Search employee…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No attendance records"
              description="Once employees check in, their records will appear here."
              className="border-none"
            />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Employee</Th>
                  <Th>Department</Th>
                  <Th>Check-in</Th>
                  <Th>Check-out</Th>
                  <Th>Hours</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((r) => (
                  <Tr key={r.employeeId}>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        {r.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.photoUrl}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-950 text-xs font-semibold text-cream-50">
                            {r.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        {r.name}
                      </div>
                    </Td>
                    <Td className="text-ink-500">{r.department}</Td>
                    <Td>{formatTime(r.checkIn)}</Td>
                    <Td>{formatTime(r.checkOut)}</Td>
                    <Td className="text-ink-500">{hoursBetween(r.checkIn, r.checkOut)}</Td>
                    <Td>
                      <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    </Td>
                    <Td className="text-right">
                      {!r.checkIn ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending && busyId === r.employeeId}
                          onClick={() => handleCheckIn(r.employeeId)}
                        >
                          Check in
                        </Button>
                      ) : !r.checkOut ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending && busyId === r.employeeId}
                          onClick={() => handleCheckOut(r.employeeId)}
                        >
                          Check out
                        </Button>
                      ) : (
                        <span className="text-xs text-ink-400">Complete</span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>

        <CheckInLinkCard orgSlug={orgSlug} />
      </div>
    </div>
  );
}
