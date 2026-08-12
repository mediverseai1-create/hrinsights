import "server-only";

export interface DraftLetterInput {
  documentType: string;
  tone: string;
  employeeName: string;
  organizationName: string;
  prompt: string;
}

export interface DraftLetterResult {
  configured: boolean;
  content?: string;
  error?: string;
}

const DOC_TYPE_LABEL: Record<string, string> = {
  query: "query letter",
  warning: "warning letter",
  confirmation: "confirmation letter",
  reference: "reference letter",
  offer: "offer letter",
  termination: "termination letter",
};

function buildPrompt(input: DraftLetterInput) {
  const docLabel = DOC_TYPE_LABEL[input.documentType] ?? "HR letter";
  return [
    `Write a ${input.tone} ${docLabel} from ${input.organizationName}'s HR department to ${input.employeeName}.`,
    `Base it only on the following facts — do not invent details beyond them:`,
    input.prompt,
    `Format it as a complete, ready-to-send letter with a greeting and sign-off. Keep it concise and professional.`,
  ].join("\n\n");
}

/**
 * Drafts an HR letter via the Anthropic Messages API. Grounded strictly in
 * the facts the caller supplies — never invents attendance/performance data.
 * Returns { configured: false } untouched (no network call, no fake output)
 * when ANTHROPIC_API_KEY isn't set, so the UI can show a clear "coming soon"
 * state instead of pretending the feature works.
 */
export async function generateLetterDraft(input: DraftLetterInput): Promise<DraftLetterResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { configured: false };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 700,
        system:
          "You are an HR writing assistant. You draft formal, factual HR letters strictly from the facts provided by the caller. Never invent dates, numbers, or incidents that weren't given to you.",
        messages: [{ role: "user", content: buildPrompt(input) }],
      }),
    });

    if (!response.ok) {
      return { configured: true, error: `AI provider returned an error (${response.status}).` };
    }

    const data = await response.json();
    const content = data?.content?.[0]?.text as string | undefined;
    if (!content) return { configured: true, error: "The AI provider returned an empty response." };

    return { configured: true, content };
  } catch {
    return { configured: true, error: "Could not reach the AI provider. Please try again." };
  }
}
