"use server";

import { requireCurrentOrg } from "@/lib/data/org";
import { buildAssistantContext, askAssistant } from "@/lib/ai/assistant";
import type { GeminiTurn } from "@/lib/ai/gemini";

export async function sendAssistantMessage(history: GeminiTurn[], question: string) {
  if (!question.trim()) return { error: "Type a question first." };

  const { organization } = await requireCurrentOrg();
  const context = await buildAssistantContext(organization.id, organization.name);
  const result = await askAssistant(context, history, question);

  if (!result.configured) return { notConfigured: true as const };
  if (result.error || !result.content) {
    return { error: result.error ?? "Something went wrong. Please try again." };
  }

  return { success: true as const, answer: result.content };
}
