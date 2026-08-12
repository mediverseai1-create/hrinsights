import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listEmployees(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*, departments(id, name)")
    .eq("organization_id", organizationId)
    .order("full_name");

  if (error) throw new Error(error.message);
  return data;
}

export async function listDepartments(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function countEmployees(organizationId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  return count ?? 0;
}
