import { z } from "zod";

export const letterSchema = z.object({
  documentType: z.enum(["query", "warning", "confirmation", "reference", "offer", "termination"]),
  employeeId: z.string().min(1, "Select an employee"),
  tone: z.enum(["firm", "neutral", "friendly"]),
  prompt: z.string().min(10, "Describe what happened in a bit more detail"),
});

export type LetterInput = z.infer<typeof letterSchema>;
