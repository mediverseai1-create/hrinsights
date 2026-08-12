"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentOrg } from "@/lib/data/org";
import { z } from "zod";
import { onboardingSchema } from "@/lib/validations/onboarding";

const profileSchema = z.object({ fullName: z.string().min(2, "Enter your full name") });

export async function updateProfile(input: { fullName: string }) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter a valid name." };

  const { userId } = await requireCurrentOrg();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { success: true as const };
}

export async function updateOrganization(input: {
  organizationName: string;
  industry: string;
  size: string;
  country: string;
  currency: string;
}) {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fill in all fields." };

  const { organization, role } = await requireCurrentOrg();
  if (role !== "owner" && role !== "admin") {
    return { error: "Only owners and admins can update organization details." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.organizationName,
      industry: parsed.data.industry,
      size: parsed.data.size,
      country: parsed.data.country,
      currency: parsed.data.currency,
    })
    .eq("id", organization.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true as const };
}
