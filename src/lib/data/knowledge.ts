import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listCompanyDocuments(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_documents")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
