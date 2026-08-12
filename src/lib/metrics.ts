import type { AttendanceStatus } from "@/lib/types/database";

export interface AttendanceRow {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
}

export interface EmployeeRow {
  id: string;
  full_name: string;
  status: "active" | "inactive";
  department_id: string | null;
}

export function computeTodayStats(records: AttendanceRow[], totalActiveEmployees: number) {
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const trackedAbsent = records.filter((r) => r.status === "absent").length;
  const noRecord = Math.max(totalActiveEmployees - records.length, 0);
  const absent = trackedAbsent + noRecord;

  return { present, late, absent, total: totalActiveEmployees };
}

/** Groups a date-range of attendance records into a per-day attendance rate. */
export function computeDailyTrend(records: AttendanceRow[], totalActiveEmployees: number) {
  const byDate = new Map<string, AttendanceRow[]>();
  for (const record of records) {
    const list = byDate.get(record.date) ?? [];
    list.push(record);
    byDate.set(record.date, list);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayRecords]) => {
      const present = dayRecords.filter((r) => r.status !== "absent").length;
      const rate = totalActiveEmployees > 0 ? Math.round((present / totalActiveEmployees) * 100) : 0;
      return { date, rate, present, late: dayRecords.filter((r) => r.status === "late").length };
    });
}

export function computeDepartmentDistribution(
  employees: { department_id: string | null; departments: { name: string } | null }[]
) {
  const counts = new Map<string, number>();
  for (const emp of employees) {
    const name = emp.departments?.name ?? "Unassigned";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/** Employees whose late count within the recent window meets/exceeds the threshold. */
export function computeLateOffenders(
  records: (AttendanceRow & { employees: { full_name: string } | null })[],
  threshold = 3
) {
  const counts = new Map<string, { name: string; count: number }>();
  for (const r of records) {
    if (r.status !== "late" || !r.employees) continue;
    const entry = counts.get(r.employee_id) ?? { name: r.employees.full_name, count: 0 };
    entry.count += 1;
    counts.set(r.employee_id, entry);
  }
  return Array.from(counts.values())
    .filter((e) => e.count >= threshold)
    .sort((a, b) => b.count - a.count);
}

const STANDARD_SHIFT_HOURS = 8;

/** Sum of hours worked beyond an 8-hour day, across all completed shifts in the range. */
export function computeOvertimeHours(records: AttendanceRow[]) {
  let totalHours = 0;
  for (const r of records) {
    if (!r.check_in || !r.check_out) continue;
    const hours = (new Date(r.check_out).getTime() - new Date(r.check_in).getTime()) / 3_600_000;
    if (hours > STANDARD_SHIFT_HOURS) totalHours += hours - STANDARD_SHIFT_HOURS;
  }
  return Math.round(totalHours * 10) / 10;
}

export function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}
