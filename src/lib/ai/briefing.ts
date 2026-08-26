import "server-only";
import { callGemini } from "@/lib/ai/gemini";

const SYSTEM = [
  "You write a short daily HR briefing (2-3 sentences, plain language, no bullet points) from the",
  "workspace context given to you. Only state facts present in the context — never invent numbers,",
  "names, or events. Prioritize what's most operationally important: absences, lateness patterns,",
  "candidates awaiting review, and anything else genuinely worth a manager's attention today.",
].join(" ");

export async function generateBriefing(context: string, greetingName: string) {
  return callGemini({
    system: SYSTEM,
    prompt: `Greet ${greetingName} briefly, then summarize today based on:\n\n${context}`,
  });
}
