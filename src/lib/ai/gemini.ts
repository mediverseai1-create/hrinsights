import "server-only";

export interface GeminiResult {
  configured: boolean;
  content?: string;
  error?: string;
}

/**
 * Thin wrapper around the Gemini API — the single AI reasoning layer for
 * every HRInsights AI feature (documents, recruiting review, HR assistant).
 * Returns { configured: false } untouched (no network call, no fake output)
 * when GEMINI_API_KEY isn't set, so callers can show a clear "coming soon"
 * state instead of pretending the feature works.
 */
export interface GeminiTurn {
  role: "user" | "model";
  text: string;
}

export async function callGemini({
  system,
  prompt,
  json = false,
  history = [],
}: {
  system: string;
  prompt: string;
  json?: boolean;
  history?: GeminiTurn[];
}): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { configured: false };

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [
            ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
            { role: "user", parts: [{ text: prompt }] },
          ],
          generationConfig: json ? { responseMimeType: "application/json" } : undefined,
        }),
      }
    );

    if (!response.ok) {
      return { configured: true, error: `AI provider returned an error (${response.status}).` };
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("");

    if (!content) return { configured: true, error: "The AI provider returned an empty response." };
    return { configured: true, content };
  } catch {
    return { configured: true, error: "Could not reach the AI provider. Please try again." };
  }
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}
