"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentOrg } from "@/lib/data/org";

const documentSchema = z.object({
  title: z.string().min(2, "Give this document a title"),
  content: z.string().min(20, "Paste at least a few sentences of content"),
});

export async function addCompanyDocument(input: { title: string; content: string }, source: "pasted" | "upload") {
  const parsed = documentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid document." };

  const { organization, userId } = await requireCurrentOrg();
  const supabase = await createClient();

  const { error } = await supabase.from("company_documents").insert({
    organization_id: organization.id,
    title: parsed.data.title,
    content: parsed.data.content,
    source,
    created_by: userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/knowledge");
  return { success: true as const };
}

export async function deleteCompanyDocument(id: string) {
  const { organization } = await requireCurrentOrg();
  const supabase = await createClient();

  const { error } = await supabase
    .from("company_documents")
    .delete()
    .eq("id", id)
    .eq("organization_id", organization.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/knowledge");
  return { success: true as const };
}
