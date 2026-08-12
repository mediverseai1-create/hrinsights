"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentOrg } from "@/lib/data/org";
import { employeeSchema, type EmployeeInput, type CsvRow } from "@/lib/validations/employee";
import { PLANS, type PlanId } from "@/lib/constants";

async function assertUnderEmployeeLimit(organizationId: string, plan: PlanId, adding: number) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  const limit = PLANS[plan].limits.maxEmployees;
  if ((count ?? 0) + adding > limit) {
    return `Your ${PLANS[plan].name} plan is limited to ${limit} employees. Upgrade to add more.`;
  }
  return null;
}

async function resolveDepartmentId(organizationId: string, name: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("departments")
    .select("id")
    .eq("organization_id", organizationId)
    .ilike("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("departments")
    .insert({ organization_id: organizationId, name })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return created.id;
}

export async function addEmployee(input: EmployeeInput) {
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the form for errors." };

  const { organization } = await requireCurrentOrg();
  const limitError = await assertUnderEmployeeLimit(organization.id, organization.plan, 1);
  if (limitError) return { error: limitError };

  const supabase = await createClient();
  const departmentId = await resolveDepartmentId(organization.id, parsed.data.department);

  const { error } = await supabase.from("employees").insert({
    organization_id: organization.id,
    full_name: parsed.data.fullName,
    email: parsed.data.email || null,
    department_id: departmentId,
    role_title: parsed.data.roleTitle || null,
    shift_start: parsed.data.shiftStart,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/employees");
  revalidatePath("/dashboard");
  return { success: true as const };
}

export async function updateEmployee(id: string, input: EmployeeInput) {
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the form for errors." };

  const { organization } = await requireCurrentOrg();
  const supabase = await createClient();
  const departmentId = await resolveDepartmentId(organization.id, parsed.data.department);

  const { error } = await supabase
    .from("employees")
    .update({
      full_name: parsed.data.fullName,
      email: parsed.data.email || null,
      department_id: departmentId,
      role_title: parsed.data.roleTitle || null,
      shift_start: parsed.data.shiftStart,
    })
    .eq("id", id)
    .eq("organization_id", organization.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/employees");
  return { success: true as const };
}

export async function deleteEmployee(id: string) {
  const { organization } = await requireCurrentOrg();
  const supabase = await createClient();

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id)
    .eq("organization_id", organization.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/employees");
  revalidatePath("/dashboard");
  return { success: true as const };
}

export async function importEmployeesCsv(rows: CsvRow[], fileName: string) {
  const { organization, userId } = await requireCurrentOrg();
  const supabase = await createClient();

  if (!PLANS[organization.plan].limits.csvImport) {
    return { error: `CSV import isn't available on the ${PLANS[organization.plan].name} plan. Upgrade to Starter or Pro.` };
  }

  const limitError = await assertUnderEmployeeLimit(organization.id, organization.plan, rows.length);
  if (limitError) return { error: limitError };

  const departmentCache = new Map<string, string>();
  let imported = 0;

  for (const row of rows) {
    const key = row.department.toLowerCase();
    let departmentId = departmentCache.get(key);
    if (!departmentId) {
      departmentId = await resolveDepartmentId(organization.id, row.department);
      departmentCache.set(key, departmentId);
    }

    const { error } = await supabase.from("employees").insert({
      organization_id: organization.id,
      full_name: row.full_name,
      email: row.email || null,
      department_id: departmentId,
      role_title: row.role_title || null,
      shift_start: row.shift_start || "08:00",
    });

    if (!error) imported += 1;
  }

  await supabase.from("csv_imports").insert({
    organization_id: organization.id,
    uploaded_by: userId,
    file_name: fileName,
    row_count: imported,
    status: imported > 0 ? "completed" : "failed",
  });

  revalidatePath("/dashboard/employees");
  revalidatePath("/dashboard");
  return { success: true as const, imported, total: rows.length };
}
