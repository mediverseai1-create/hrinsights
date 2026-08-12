"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentOrg } from "@/lib/data/org";
import { letterSchema, type LetterInput } from "@/lib/validations/letter";
import { generateLetterDraft } from "@/lib/ai/writing-assistant";
import { PLANS } from "@/lib/constants";

export async function generateLetter(input: LetterInput) {
  const parsed = letterSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fill in all fields." };

  const { organization, userId } = await requireCurrentOrg();

  if (!PLANS[organization.plan].limits.aiWritingAssistant) {
    return {
      error: `The AI writing assistant is a Pro feature. Upgrade to Pro to generate letters.`,
    };
  }

  const supabase = await createClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("full_name")
    .eq("id", parsed.data.employeeId)
    .eq("organization_id", organization.id)
    .single();

  if (!employee) return { error: "Select a valid employee." };

  const result = await generateLetterDraft({
    documentType: parsed.data.documentType,
    tone: parsed.data.tone,
    employeeName: employee.full_name,
    organizationName: organization.name,
    prompt: parsed.data.prompt,
  });

  if (!result.configured) {
    return { notConfigured: true as const };
  }
  if (result.error || !result.content) {
    return { error: result.error ?? "Something went wrong generating the letter." };
  }

  const { data: letter, error } = await supabase
    .from("letters")
    .insert({
      organization_id: organization.id,
      employee_id: parsed.data.employeeId,
      created_by: userId,
      document_type: parsed.data.documentType,
      tone: parsed.data.tone,
      prompt: parsed.data.prompt,
      content: result.content,
      status: "draft",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/writing-assistant");
  return { success: true as const, letter };
}
