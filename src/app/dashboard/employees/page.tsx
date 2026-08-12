import type { Metadata } from "next";
import { requireCurrentOrg } from "@/lib/data/org";
import { listEmployees, listDepartments } from "@/lib/data/employees";
import { EmployeesView } from "@/components/dashboard/employees-view";
import { PLANS } from "@/lib/constants";

export const metadata: Metadata = { title: "Employees" };

export default async function EmployeesPage() {
  const { organization } = await requireCurrentOrg();
  const [employees, departments] = await Promise.all([
    listEmployees(organization.id),
    listDepartments(organization.id),
  ]);

  return (
    <EmployeesView
      employees={employees}
      departments={departments}
      canImportCsv={PLANS[organization.plan].limits.csvImport}
    />
  );
}
