"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeInput } from "@/lib/validations/employee";
import { addEmployee, updateEmployee } from "@/app/dashboard/employees/actions";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, FieldError } from "@/components/ui/input";

export interface EditableEmployee {
  id: string;
  full_name: string;
  email: string | null;
  role_title: string | null;
  shift_start: string;
  departments: { name: string } | null;
}

export function EmployeeFormDialog({
  open,
  onClose,
  departments,
  employee,
}: {
  open: boolean;
  onClose: () => void;
  departments: { id: string; name: string }[];
  employee?: EditableEmployee | null;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = Boolean(employee);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: employee?.full_name ?? "",
      email: employee?.email ?? "",
      department: employee?.departments?.name ?? departments[0]?.name ?? "",
      roleTitle: employee?.role_title ?? "",
      shiftStart: employee?.shift_start?.slice(0, 5) ?? "08:00",
    },
  });

  async function onSubmit(values: EmployeeInput) {
    setServerError(null);
    const result = isEdit && employee ? await updateEmployee(employee.id, values) : await addEmployee(values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit employee" : "Add employee"}
      description={isEdit ? undefined : "Add a new person to your workspace."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" placeholder="Enter full name" {...register("fullName")} />
          <FieldError>{errors.fullName?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="Enter work email" {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select id="department" {...register("department")}>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </Select>
            <FieldError>{errors.department?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="shiftStart">Shift start time</Label>
            <Input id="shiftStart" type="time" {...register("shiftStart")} />
            <FieldError>{errors.shiftStart?.message}</FieldError>
          </div>
        </div>
        <div>
          <Label htmlFor="roleTitle">Role / title (optional)</Label>
          <Input id="roleTitle" placeholder="e.g. Support Agent" {...register("roleTitle")} />
        </div>

        {serverError && <p className="text-sm text-danger-600">{serverError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Save employee"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
