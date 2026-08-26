"use client";

import { useMemo, useState } from "react";
import { Plus, Upload, Search, Pencil, Trash2, Lock } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeFormDialog, type EditableEmployee } from "@/components/dashboard/employee-form-dialog";
import { CsvImportDialog } from "@/components/dashboard/csv-import-dialog";
import { deleteEmployee } from "@/app/dashboard/employees/actions";

export interface EmployeeListItem extends EditableEmployee {
  status: "active" | "inactive";
}

export function EmployeesView({
  employees,
  departments,
  canImportCsv,
  planName,
  employeeCount,
  maxEmployees,
}: {
  employees: EmployeeListItem[];
  departments: { id: string; name: string }[];
  canImportCsv: boolean;
  planName: string;
  employeeCount: number;
  maxEmployees: number;
}) {
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<EditableEmployee | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const atLimit = employeeCount >= maxEmployees;

  function openAddDialog() {
    if (atLimit) return;
    setEditing(null);
    setFormOpen(true);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        e.departments?.name.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q)
    );
  }, [employees, query]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from your workspace?`)) return;
    setDeletingId(id);
    await deleteEmployee(id);
    setDeletingId(null);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">People</h1>
          <p className="mt-1 text-sm text-ink-500">
            Add and manage the people in your workspace.{" "}
            {Number.isFinite(maxEmployees) && (
              <span className="text-ink-400">
                {employeeCount} of {maxEmployees} used on {planName}.
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => (canImportCsv && !atLimit ? setImportOpen(true) : undefined)}
            disabled={!canImportCsv || atLimit}
            title={
              !canImportCsv
                ? "Upgrade to Starter or Pro to import CSV files"
                : atLimit
                ? `You've reached the ${maxEmployees}-employee limit on ${planName}`
                : undefined
            }
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={openAddDialog} disabled={atLimit} title={atLimit ? `You've reached the ${maxEmployees}-employee limit on ${planName}` : undefined}>
            {atLimit ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            Add employee
          </Button>
        </div>
      </div>

      {atLimit && (
        <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-warning-600/20 bg-warning-50 p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-warning-600">
            You&apos;ve reached the {maxEmployees}-employee limit on the {planName} plan. Upgrade to add
            more people.
          </p>
          <ButtonLink href="/pricing" size="sm" variant="secondary">
            View plans
          </ButtonLink>
        </div>
      )}

      <div className="relative mt-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          placeholder="Search employees…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-ink-900/8 bg-white">
        {filtered.length === 0 ? (
          <EmptyState
            title={employees.length === 0 ? "No employees yet" : "No matches"}
            description={
              employees.length === 0
                ? "Add your first employee, or import a CSV to get started."
                : "Try a different search term."
            }
            action={
              employees.length === 0 && (
                <Button onClick={openAddDialog} disabled={atLimit}>
                  <Plus className="h-4 w-4" />
                  Add employee
                </Button>
              )
            }
            className="border-none"
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Employee</Th>
                <Th>Email</Th>
                <Th>Department</Th>
                <Th>Shift start</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((emp) => (
                <Tr key={emp.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-950 text-xs font-semibold text-cream-50">
                        {emp.full_name.charAt(0).toUpperCase()}
                      </span>
                      {emp.full_name}
                    </div>
                  </Td>
                  <Td className="text-ink-500">{emp.email || "—"}</Td>
                  <Td>{emp.departments?.name ?? "Unassigned"}</Td>
                  <Td>{emp.shift_start?.slice(0, 5)}</Td>
                  <Td>
                    <Badge tone={emp.status === "active" ? "success" : "neutral"}>{emp.status}</Badge>
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(emp);
                          setFormOpen(true);
                        }}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-cream-200 hover:text-ink-900"
                        aria-label={`Edit ${emp.full_name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.full_name)}
                        disabled={deletingId === emp.id}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-danger-50 hover:text-danger-600"
                        aria-label={`Remove ${emp.full_name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>

      <EmployeeFormDialog
        key={formOpen ? (editing ? `edit-${editing.id}` : "add") : "closed"}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        departments={departments}
        employee={editing}
      />
      <CsvImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
