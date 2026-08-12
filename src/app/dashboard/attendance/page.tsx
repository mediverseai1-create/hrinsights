import type { Metadata } from "next";
import { requireCurrentOrg } from "@/lib/data/org";
import { listEmployees, listDepartments } from "@/lib/data/employees";
import { listAttendanceForDate } from "@/lib/data/attendance";
import { AttendanceView, type AttendanceRowData } from "@/components/dashboard/attendance-view";

export const metadata: Metadata = { title: "Attendance" };

export default async function AttendancePage() {
  const { organization } = await requireCurrentOrg();
  const today = new Date().toISOString().slice(0, 10);

  const [employees, departments, todayRecords] = await Promise.all([
    listEmployees(organization.id),
    listDepartments(organization.id),
    listAttendanceForDate(organization.id, today),
  ]);

  const recordByEmployee = new Map(todayRecords.map((r) => [r.employee_id, r]));

  const rows: AttendanceRowData[] = employees
    .filter((e) => e.status === "active")
    .map((e) => {
      const record = recordByEmployee.get(e.id);
      return {
        employeeId: e.id,
        name: e.full_name,
        department: e.departments?.name ?? "Unassigned",
        checkIn: record?.check_in ?? null,
        checkOut: record?.check_out ?? null,
        status: record?.status ?? "not-checked-in",
        photoUrl: record?.photo_url ?? null,
      };
    });

  const present = rows.filter((r) => r.status === "present").length;
  const late = rows.filter((r) => r.status === "late").length;
  const absent = rows.filter((r) => r.status === "not-checked-in" || r.status === "absent").length;

  return (
    <AttendanceView
      rows={rows}
      departments={departments.map((d) => d.name)}
      present={present}
      late={late}
      absent={absent}
      orgSlug={organization.slug}
    />
  );
}
