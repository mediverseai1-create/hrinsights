import "server-only";
import { callGemini } from "@/lib/ai/gemini";

export interface CandidateReview {
  matchLevel: "strong" | "possible" | "weak";
  summary: string;
  strengths: string[];
  gaps: string[];
  missingInfo: string[];
}

export interface ReviewCandidateResult {
  configured: boolean;
  review?: CandidateReview;
  error?: string;
}

const SYSTEM = [
  "You are an HR recruiting assistant. You compare a candidate against a job's stated requirements",
  "using only the information given to you. Never infer or comment on protected characteristics",
  "(age, gender, ethnicity, religion, disability, marital/family status, sexual orientation, political",
  "or religious belief, health, or similar). Base every point strictly on job-relevant evidence in the",
  "candidate's text. If something isn't mentioned, list it under missingInfo rather than guessing.",
  'Respond with ONLY a JSON object matching this shape: { "matchLevel": "strong" | "possible" | "weak",',
  '"summary": string, "strengths": string[], "gaps": string[], "missingInfo": string[] }.',
].join(" ");

function buildPrompt(job: {
  title: string;
  description: string | null;
  requirements: string[];
  rawRequest: string;
}, candidate: { fullName: string; profileText: string }) {
  return [
    `Role: ${job.title}`,
    job.description ? `Job description:\n${job.description}` : `Hiring request (as described by HR):\n${job.rawRequest}`,
    job.requirements.length > 0 ? `Key requirements:\n- ${job.requirements.join("\n- ")}` : "",
    `Candidate: ${candidate.fullName}`,
    `Candidate background (as supplied):\n${candidate.profileText}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function reviewCandidate(
  job: { title: string; description: string | null; requirements: string[]; rawRequest: string },
  candidate: { fullName: string; profileText: string }
): Promise<ReviewCandidateResult> {
  const result = await callGemini({
    system: SYSTEM,
    prompt: buildPrompt(job, candidate),
    json: true,
  });

  if (!result.configured) return { configured: false };
  if (result.error || !result.content) {
    return { configured: true, error: result.error ?? "The AI provider returned an empty response." };
  }

  try {
    const parsed = JSON.parse(result.content) as CandidateReview;
    return { configured: true, review: parsed };
  } catch {
    return { configured: true, error: "Couldn't parse the AI provider's response." };
  }
}

export interface ExtractedJobDetails {
  suggestedTitle: string;
  location: string | null;
  employmentType: "full_time" | "part_time" | "contract" | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  requirements: string[];
  description: string;
}

const EXTRACT_SYSTEM = [
  "You turn a plain-language hiring request into a structured job posting. Extract only what is",
  "explicitly stated or clearly implied — never invent salary, location, or requirements that",
  "weren't mentioned. Write a short, professional job description from the request.",
  'Respond with ONLY a JSON object: { "suggestedTitle": string, "location": string | null,',
  '"employmentType": "full_time" | "part_time" | "contract" | null, "salaryMin": number | null,',
  '"salaryMax": number | null, "salaryCurrency": string | null, "requirements": string[],',
  '"description": string }.',
].join(" ");

export async function extractJobDetails(rawRequest: string): Promise<{
  configured: boolean;
  details?: ExtractedJobDetails;
  error?: string;
}> {
  const result = await callGemini({ system: EXTRACT_SYSTEM, prompt: rawRequest, json: true });

  if (!result.configured) return { configured: false };
  if (result.error || !result.content) {
    return { configured: true, error: result.error ?? "The AI provider returned an empty response." };
  }

  try {
    const parsed = JSON.parse(result.content) as ExtractedJobDetails;
    return { configured: true, details: parsed };
  } catch {
    return { configured: true, error: "Couldn't parse the AI provider's response." };
  }
}
