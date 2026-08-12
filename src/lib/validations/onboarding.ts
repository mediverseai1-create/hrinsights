import { z } from "zod";

export const onboardingSchema = z.object({
  organizationName: z.string().min(2, "Enter your organization name"),
  industry: z.string().min(1, "Select an industry"),
  size: z.string().min(1, "Select an organization size"),
  country: z.string().min(1, "Enter your country"),
  currency: z.string().min(1, "Select a currency"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
