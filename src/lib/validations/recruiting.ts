import { z } from "zod";

export const jobIntakeSchema = z.object({
  rawRequest: z.string().min(15, "Tell us a bit more about the role you need to fill"),
  title: z.string().min(2, "Give the role a short title"),
  department: z.string().min(1, "Select a department"),
});
export type JobIntakeInput = z.infer<typeof jobIntakeSchema>;

export const candidateSchema = z.object({
  fullName: z.string().min(2, "Enter the candidate's full name"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  profileText: z
    .string()
    .min(20, "Paste a summary of their background — this is what HRInsights reads")
    .optional()
    .or(z.literal("")),
});
export type CandidateInput = z.infer<typeof candidateSchema>;
