"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AttendanceTrendChart } from "@/components/charts/attendance-trend-chart";
import { DepartmentDistributionChart } from "@/components/charts/department-distribution-chart";

const TABS = ["Overview", "Attendance", "Insights"] as const;

const DEMO_ROWS = [
  { name: "Amaka O.", dept: "Sales", checkIn: "07:41", status: "On time" as const },
  { name: "Tunde A.", dept: "Operations", checkIn: "07:56", status: "On time" as const },
  { name: "David E.", dept: "Customer Support", checkIn: "08:27", status: "Late" as const },
  { name: "Ngozi B.", dept: "Customer Support", checkIn: "08:12", status: "Late" as const },
];

const DEMO_TREND = [
  { date: "2026-08-03", rate: 78 },
  { date: "2026-08-04", rate: 82 },
  { date: "2026-08-05", rate: 84 },
  { date: "2026-08-06", rate: 80 },
  { date: "2026-08-07", rate: 88 },
];

const DEMO_DEPTS = [
  { name: "Customer Support", count: 14 },
  { name: "Sales", count: 11 },
  { name: "Operations", count: 9 },
  { name: "Design", count: 5 },
];

const TONE = { "On time": "success", Late: "warning" } as const;

export function ProductPreview() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-900/8 bg-forest-950 px-3 py-3 sm:px-4">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                tab === t ? "bg-lime-400 text-forest-950" : "text-cream-50/70 hover:text-cream-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-cream-50/10 px-2.5 py-1 text-xs text-cream-50/70">
          <Info className="h-3 w-3" />
          Demo data
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {tab === "Overview" && (
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Total employees" value={50} />
              <StatCard label="Present" value={42} />
              <StatCard label="Late" value={5} tone="warning" />
              <StatCard label="Absent" value={3} tone="danger" />
            </div>
          </div>
        )}

        {tab === "Attendance" && (
          <Table>
            <Thead>
              <Tr>
                <Th>Employee</Th>
                <Th>Department</Th>
                <Th>Check-in</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {DEMO_ROWS.map((r) => (
                <Tr key={r.name}>
                  <Td>{r.name}</Td>
                  <Td className="text-ink-500">{r.dept}</Td>
                  <Td>{r.checkIn}</Td>
                  <Td>
                    <Badge tone={TONE[r.status]}>{r.status}</Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {tab === "Insights" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs">Attendance this week</CardTitle>
              </CardHeader>
              <CardContent>
                <AttendanceTrendChart data={DEMO_TREND} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xs">Employees by department</CardTitle>
              </CardHeader>
              <CardContent>
                <DepartmentDistributionChart data={DEMO_DEPTS} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
}
