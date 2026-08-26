import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCurrentOrg } from "@/lib/data/org";
import { getJobPosting, listApplicationsForJob } from "@/lib/data/recruiting";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { JobPostingWorkspace } from "@/components/dashboard/job-posting-workspace";

export const metadata: Metadata = { title: "Recruiting" };

export default async function JobPostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { organization } = await requireCurrentOrg();

  const job = await getJobPosting(organization.id, id);
  if (!job) notFound();

  const applications = await listApplicationsForJob(organization.id, id);

  return <JobPostingWorkspace job={job} applications={applications} aiConfigured={isGeminiConfigured()} />;
}
