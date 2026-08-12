import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { requireCurrentOrg } from "@/lib/data/org";
import { listEmployees } from "@/lib/data/employees";
import { listAttendanceForDate, listAttendanceRange } from "@/lib/data/attendance";
import { computeLateOffenders } from "@/lib/metrics";
import { StatCard } from "@/components/ui/stat-card";
import { ButtonLink } from "@/components/ui/button";
import { TodaysAttendanceTable, type TodayRow } from "@/components/dashboard/todays-attendance-table";
import { NeedsAttention, type AttentionItem } from "@/components/dashboard/needs-attention";

export const metadata: Metadata = { title: "Overview" };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function OverviewPage() {
  const { organization, fullName } = await requireCurrentOrg();
  const today = new Date().toISOString().slice(0, 10);

  const [employees, todayRecords, weekRecords] = await Promise.all([
    listEmployees(organization.id),
    listAttendanceForDate(organization.id, today),
    listAttendanceRange(organization.id, 7),
  ]);

  const activeEmployees = employees.filter((e) => e.status === "active");
  const recordByEmployee = new Map(todayRecords.map((r) => [r.employee_id, r]));

  const rows: TodayRow[] = activeEmployees.map((e) => {
    const record = recordByEmployee.get(e.id);
    return {
      id: e.id,
      name: e.full_name,
      department: e.departments?.name ?? "Unassigned",
      checkIn: record?.check_in ?? null,
      status: record?.status ?? "not-checked-in",
    };
  });

  const present = rows.filter((r) => r.status === "present").length;
  const late = rows.filter((r) => r.status === "late").length;
  const absent = rows.filter((r) => r.status === "not-checked-in" || r.status === "absent").length;

  const lateOffenders = computeLateOffenders(
    weekRecords as unknown as Parameters<typeof computeLateOffenders>[0],
    3
  );

  const noCheckIn = rows.filter((r) => r.status === "not-checked-in").slice(0, 3);

  const attentionItems: AttentionItem[] = [
    ...lateOffenders.slice(0, 2).map((o, i) => ({
      id: `late-${i}`,
      icon: "warning" as const,
      message: `${o.name} has arrived late ${o.count} times this week.`,
      href: "/dashboard/attendance",
      actionLabel: "Review",
    })),
    ...noCheckIn.map((r) => ({
      id: `nocheckin-${r.id}`,
      icon: "absent" as const,
      message: `No check-in yet — ${r.name}.`,
      href: "/dashboard/attendance",
      actionLabel: "Follow up",
    })),
  ].slice(0, 4);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">
            {greeting()}
            {fullName ? `, ${fullName.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-ink-500">Here&apos;s what&apos;s happening with your team today.</p>
        </div>
        <ButtonLink href="/dashboard/employees">
          <Plus className="h-4 w-4" />
          Add employee
        </ButtonLink>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total employees" value={activeEmployees.length} />
        <StatCard label="Present" value={present} />
        <StatCard label="Late" value={late} tone="warning" />
        <StatCard label="Absent" value={absent} tone="danger" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <TodaysAttendanceTable rows={rows} />
        <NeedsAttention items={attentionItems} />
      </div>
    </div>
  );
}
