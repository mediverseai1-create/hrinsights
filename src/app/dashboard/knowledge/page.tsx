import type { Metadata } from "next";
import { requireCurrentOrg } from "@/lib/data/org";
import { listCompanyDocuments } from "@/lib/data/knowledge";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { KnowledgeView } from "@/components/dashboard/knowledge-view";

export const metadata: Metadata = { title: "Company Knowledge" };

export default async function KnowledgePage() {
  const { organization } = await requireCurrentOrg();
  const documents = await listCompanyDocuments(organization.id);

  return <KnowledgeView documents={documents} aiConfigured={isGeminiConfigured()} />;
}
