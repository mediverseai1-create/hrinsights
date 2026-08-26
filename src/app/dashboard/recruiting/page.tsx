import type { Metadata } from "next";
import { requireCurrentOrg } from "@/lib/data/org";
import { listJobPostings } from "@/lib/data/recruiting";
import { listDepartments } from "@/lib/data/employees";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { RecruitingView } from "@/components/dashboard/recruiting-view";

export const metadata: Metadata = { title: "Recruiting" };

export default async function RecruitingPage() {
  const { organization } = await requireCurrentOrg();
  const [postings, departments] = await Promise.all([
    listJobPostings(organization.id),
    listDepartments(organization.id),
  ]);

  return (
    <RecruitingView
      postings={postings}
      departments={departments}
      aiConfigured={isGeminiConfigured()}
    />
  );
}
