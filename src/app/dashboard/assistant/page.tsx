import type { Metadata } from "next";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { AssistantView } from "@/components/dashboard/assistant-view";

export const metadata: Metadata = { title: "HR Assistant" };

export default function AssistantPage() {
  return <AssistantView aiConfigured={isGeminiConfigured()} />;
}
