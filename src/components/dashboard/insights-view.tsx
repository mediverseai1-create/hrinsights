"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { AttendanceTrendChart, type TrendPoint } from "@/components/charts/attendance-trend-chart";
import {
  DepartmentDistributionChart,
  type DeptDatum,
} from "@/components/charts/department-distribution-chart";
import { NeedsAttention, type AttentionItem } from "@/components/dashboard/needs-attention";
import { downloadCsv } from "@/lib/export-csv";

export function InsightsView({
  range,
  attendanceRate,
  lateArrivals,
  absences,
  overtimeHours,
  trend,
  departments,
  attentionItems,
  present,
  daysLabel,
}: {
  range: 7 | 30;
  attendanceRate: number;
  lateArrivals: number;
  absences: number;
  overtimeHours: number;
  trend: TrendPoint[];
  departments: DeptDatum[];
  attentionItems: AttentionItem[];
  present: number;
  daysLabel: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleRangeChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("range", value);
    router.push(`/dashboard/insights?${params.toString()}`);
  }

  function handleExport() {
    downloadCsv(
      `hrinsights-summary-${daysLabel.toLowerCase().replace(/\s+/g, "-")}.csv`,
      ["Metric", "Value"],
      [
        ["Period", daysLabel],
        ["Attendance rate", `${attendanceRate}%`],
        ["Present (days)", present],
        ["Late arrivals", lateArrivals],
        ["Absences", absences],
        ["Overtime hours", overtimeHours],
        ...departments.map((d) => [`Department — ${d.name}`, d.count]),
      ]
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Workforce Intelligence</h1>
          <p className="mt-1 text-sm text-ink-500">A simple summary of attendance patterns.</p>
        </div>
        <div className="flex gap-2">
          <Select value={String(range)} onChange={(e) => handleRangeChange(e.target.value)} className="w-40">
            <option value="7">This week</option>
            <option value="30">Last 30 days</option>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Attendance rate" value={`${attendanceRate}%`} tone="brand" />
        <StatCard label="Late arrivals" value={lateArrivals} tone="warning" />
        <StatCard label="Absences" value={absences} tone="danger" />
        <StatCard label="Overtime (hrs)" value={overtimeHours} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance — {daysLabel.toLowerCase()}</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceTrendChart data={trend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employees by department</CardTitle>
            </CardHeader>
            <CardContent>
              <DepartmentDistributionChart data={departments} />
            </CardContent>
          </Card>

          <Card className="overflow-hidden p-0">
            <CardHeader className="p-5">
              <CardTitle>Weekly summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Period</Th>
                    <Th>Present (days)</Th>
                    <Th>Late</Th>
                    <Th>Absent</Th>
                    <Th>Overtime (hrs)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>{daysLabel}</Td>
                    <Td>{present}</Td>
                    <Td>{lateArrivals}</Td>
                    <Td>{absences}</Td>
                    <Td>{overtimeHours}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <NeedsAttention items={attentionItems} />
      </div>
    </div>
  );
}
