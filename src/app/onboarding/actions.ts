"use server";

import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";
import { DEFAULT_DEPARTMENTS } from "@/lib/constants";

export async function completeOnboarding(input: OnboardingInput) {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please fill in all required fields." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired. Please sign in again." };
  }

  const { organizationName, industry, size, country, currency } = parsed.data;

  const baseSlug = slugify(organizationName) || "organization";
  const slug = `${baseSlug}-${randomBytes(4).toString("hex")}`;

  // Single atomic RPC — creates the org, the owner membership, and starter
  // departments together in one transaction, so a mid-flow failure can never
  // leave an orphaned/ownerless organization behind (see migration 0006).
  const { error } = await supabase.rpc("create_organization_with_owner", {
    p_name: organizationName,
    p_slug: slug,
    p_industry: industry,
    p_size: size,
    p_country: country,
    p_currency: currency,
    p_departments: [...DEFAULT_DEPARTMENTS],
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true as const };
}
