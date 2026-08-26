import type { Metadata } from "next";
import { requireCurrentOrg } from "@/lib/data/org";
import { createClient } from "@/lib/supabase/server";
import { WritingAssistantView } from "@/components/dashboard/writing-assistant-view";
import { PLANS } from "@/lib/constants";

export const metadata: Metadata = { title: "Documents" };

export default async function WritingAssistantPage() {
  const { organization } = await requireCurrentOrg();
  const supabase = await createClient();

  const [{ data: employees }, { data: letters }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, full_name")
      .eq("organization_id", organization.id)
      .eq("status", "active")
      .order("full_name"),
    supabase
      .from("letters")
      .select("id, document_type, status, created_at, employees(full_name)")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <WritingAssistantView
      employees={employees ?? []}
      recentLetters={(letters ?? []) as never}
      canUseAi={PLANS[organization.plan].limits.aiWritingAssistant}
    />
  );
}
