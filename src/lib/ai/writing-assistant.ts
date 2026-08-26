import "server-only";
import { callGemini, type GeminiResult } from "@/lib/ai/gemini";

export interface DraftLetterInput {
  documentType: string;
  tone: string;
  employeeName: string;
  organizationName: string;
  prompt: string;
}

export type DraftLetterResult = GeminiResult;

const DOC_TYPE_LABEL: Record<string, string> = {
  query: "query letter",
  warning: "warning letter",
  confirmation: "confirmation letter",
  reference: "reference letter",
  offer: "offer letter",
  termination: "termination letter",
};

/**
 * Drafts an HR letter via Gemini, grounded strictly in the facts the caller
 * supplies — never invents attendance/performance data.
 */
export async function generateLetterDraft(input: DraftLetterInput): Promise<DraftLetterResult> {
  const docLabel = DOC_TYPE_LABEL[input.documentType] ?? "HR letter";

  return callGemini({
    system:
      "You are an HR writing assistant. You draft formal, factual HR letters strictly from the facts provided by the caller. Never invent dates, numbers, or incidents that weren't given to you.",
    prompt: [
      `Write a ${input.tone} ${docLabel} from ${input.organizationName}'s HR department to ${input.employeeName}.`,
      `Base it only on the following facts — do not invent details beyond them:`,
      input.prompt,
      `Format it as a complete, ready-to-send letter with a greeting and sign-off. Keep it concise and professional.`,
    ].join("\n\n"),
  });
}
