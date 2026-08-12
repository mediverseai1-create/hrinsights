"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentOrg } from "@/lib/data/org";

export async function manualCheckIn(employeeId: string) {
  const { organization } = await requireCurrentOrg();
  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("shift_start")
    .eq("id", employeeId)
    .eq("organization_id", organization.id)
    .single();

  if (!employee) return { error: "Employee not found." };

  const now = new Date();
  const [h, m] = employee.shift_start.split(":").map(Number);
  const shiftMinutes = h * 60 + m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const status = nowMinutes > shiftMinutes + 5 ? "late" : "present";

  const { error } = await supabase.from("attendance_records").upsert(
    {
      organization_id: organization.id,
      employee_id: employeeId,
      date: now.toISOString().slice(0, 10),
      check_in: now.toISOString(),
      status,
    },
    { onConflict: "employee_id,date" }
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard");
  return { success: true as const };
}

export async function manualCheckOut(employeeId: string) {
  const { organization } = await requireCurrentOrg();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("attendance_records")
    .update({ check_out: new Date().toISOString() })
    .eq("organization_id", organization.id)
    .eq("employee_id", employeeId)
    .eq("date", today);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/attendance");
  return { success: true as const };
}
