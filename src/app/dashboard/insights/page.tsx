import type { Metadata } from "next";
import { requireCurrentOrg } from "@/lib/data/org";
import { listEmployees } from "@/lib/data/employees";
import { listAttendanceRange } from "@/lib/data/attendance";
import {
  computeDailyTrend,
  computeDepartmentDistribution,
  computeLateOffenders,
  computeOvertimeHours,
  pctChange,
  type AttendanceRow,
} from "@/lib/metrics";
import { InsightsView } from "@/components/dashboard/insights-view";
import type { AttentionItem } from "@/components/dashboard/needs-attention";

export const metadata: Metadata = { title: "Insights & Reports" };

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = rangeParam === "30" ? 30 : 7;
  const daysLabel = range === 30 ? "Last 30 days" : "This week";

  const { organization } = await requireCurrentOrg();

  const [employees, currentRecords, previousRecords] = await Promise.all([
    listEmployees(organization.id),
    listAttendanceRange(organization.id, range),
    listAttendanceRange(organization.id, range * 2),
  ]);

  const activeEmployees = employees.filter((e) => e.status === "active");
  const totalActive = activeEmployees.length;

  const current = currentRecords as unknown as AttendanceRow[];
  // previousRecords covers [now-2N+1, now]; the "previous" window is the older half.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - range);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const previousOnly = (previousRecords as unknown as AttendanceRow[]).filter((r) => r.date < cutoffStr);

  const totalSlots = totalActive * range;
  const presentCount = current.filter((r) => r.status !== "absent").length;
  const attendanceRate = totalSlots > 0 ? Math.round((presentCount / totalSlots) * 100) : 0;
  const lateArrivals = current.filter((r) => r.status === "late").length;
  const trackedAbsences = current.filter((r) => r.status === "absent").length;
  const missingCheckIns = Math.max(totalSlots - current.length, 0);
  const absences = trackedAbsences + missingCheckIns;
  const overtimeHours = computeOvertimeHours(current);

  const prevSlots = totalActive * range;
  const prevPresent = previousOnly.filter((r) => r.status !== "absent").length;
  const prevRate = prevSlots > 0 ? Math.round((prevPresent / prevSlots) * 100) : 0;
  const rateChange = pctChange(attendanceRate, prevRate);

  const trend = computeDailyTrend(current, totalActive);
  const departments = computeDepartmentDistribution(
    activeEmployees as unknown as Parameters<typeof computeDepartmentDistribution>[0]
  );
  const lateOffenders = computeLateOffenders(
    current as unknown as Parameters<typeof computeLateOffenders>[0],
    3
  );

  const attentionItems: AttentionItem[] = [];
  if (lateOffenders[0]) {
    attentionItems.push({
      id: "needs-attention",
      icon: "warning",
      message: `${lateOffenders[0].name} arrived late ${lateOffenders[0].count} times ${daysLabel.toLowerCase()}.`,
    });
  }
  if (prevSlots > 0) {
    attentionItems.push({
      id: "team-trend",
      icon: rateChange >= 0 ? "positive" : "trend",
      message: `Attendance rate is ${rateChange >= 0 ? "up" : "down"} ${Math.abs(rateChange)}% vs the previous period.`,
    });
  }
  const perfectAttendance = activeEmployees.find((e) => {
    const empRecords = current.filter((r) => r.employee_id === e.id);
    return empRecords.length === range && empRecords.every((r) => r.status === "present");
  });
  if (perfectAttendance) {
    attentionItems.push({
      id: "positive",
      icon: "positive",
      message: `${perfectAttendance.full_name} maintained perfect attendance ${daysLabel.toLowerCase()}.`,
    });
  }

  return (
    <InsightsView
      range={range as 7 | 30}
      attendanceRate={attendanceRate}
      lateArrivals={lateArrivals}
      absences={absences}
      overtimeHours={overtimeHours}
      trend={trend}
      departments={departments}
      attentionItems={attentionItems}
      present={presentCount}
      daysLabel={daysLabel}
    />
  );
}
