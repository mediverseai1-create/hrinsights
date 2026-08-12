import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listAttendanceForDate(organizationId: string, date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*, employees(id, full_name, department_id, shift_start, departments(name))")
    .eq("organization_id", organizationId)
    .eq("date", date);

  if (error) throw new Error(error.message);
  return data;
}

/** Attendance records for the last `days` calendar days (inclusive of today), oldest first. */
export async function listAttendanceRange(organizationId: string, days: number) {
  const supabase = await createClient();
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  const { data, error } = await supabase
    .from("attendance_records")
    .select("*, employees(id, full_name, department_id)")
    .eq("organization_id", organizationId)
    .gte("date", start.toISOString().slice(0, 10))
    .lte("date", end.toISOString().slice(0, 10))
    .order("date");

  if (error) throw new Error(error.message);
  return data;
}
