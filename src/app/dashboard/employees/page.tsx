import type { Metadata } from "next";
import { requireCurrentOrg } from "@/lib/data/org";
import { listEmployees, listDepartments } from "@/lib/data/employees";
import { EmployeesView } from "@/components/dashboard/employees-view";
import { PLANS } from "@/lib/constants";

export const metadata: Metadata = { title: "People" };

export default async function EmployeesPage() {
  const { organization } = await requireCurrentOrg();
  const [employees, departments] = await Promise.all([
    listEmployees(organization.id),
    listDepartments(organization.id),
  ]);

  const activeCount = employees.filter((e) => e.status === "active").length;
  const maxEmployees = PLANS[organization.plan].limits.maxEmployees;

  return (
    <EmployeesView
      employees={employees}
      departments={departments}
      canImportCsv={PLANS[organization.plan].limits.csvImport}
      planName={PLANS[organization.plan].name}
      employeeCount={activeCount}
      maxEmployees={maxEmployees}
    />
  );
}
