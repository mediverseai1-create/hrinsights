"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentOrg } from "@/lib/data/org";
import { jobIntakeSchema, candidateSchema, type JobIntakeInput, type CandidateInput } from "@/lib/validations/recruiting";
import { extractJobDetails, reviewCandidate } from "@/lib/ai/recruiting";
import type { ApplicationStage } from "@/lib/types/database";

async function resolveDepartmentId(organizationId: string, name: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("departments")
    .select("id")
    .eq("organization_id", organizationId)
    .ilike("name", name)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("departments")
    .insert({ organization_id: organizationId, name })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return created.id;
}

export async function createJobPosting(input: JobIntakeInput) {
  const parsed = jobIntakeSchema.safeParse(input);
  if (!parsed.success) return { error: "Tell us the role title, department, and what you need." };

  const { organization, userId } = await requireCurrentOrg();
  const supabase = await createClient();
  const departmentId = await resolveDepartmentId(organization.id, parsed.data.department);

  // Best-effort AI extraction — the posting is created either way; this just
  // pre-fills description/requirements/location/salary when Gemini is configured.
  const extraction = await extractJobDetails(parsed.data.rawRequest);
  const details = extraction.configured ? extraction.details : undefined;

  const { data: posting, error } = await supabase
    .from("job_postings")
    .insert({
      organization_id: organization.id,
      title: parsed.data.title,
      department_id: departmentId,
      raw_request: parsed.data.rawRequest,
      description: details?.description ?? null,
      requirements: details?.requirements ?? [],
      location: details?.location ?? null,
      employment_type: details?.employmentType ?? "full_time",
      salary_min: details?.salaryMin ?? null,
      salary_max: details?.salaryMax ?? null,
      salary_currency: details?.salaryCurrency ?? null,
      created_by: userId,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/recruiting");
  return { success: true as const, jobPostingId: posting.id as string };
}

export async function addCandidate(jobPostingId: string, input: CandidateInput, resumePath: string | null) {
  const parsed = candidateSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the candidate details." };

  const { organization } = await requireCurrentOrg();
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("job_postings")
    .select("title, description, requirements, raw_request")
    .eq("id", jobPostingId)
    .eq("organization_id", organization.id)
    .single();

  if (!job) return { error: "Job posting not found." };

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .insert({
      organization_id: organization.id,
      full_name: parsed.data.fullName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      profile_text: parsed.data.profileText || null,
      resume_path: resumePath,
      source: "manual",
    })
    .select()
    .single();

  if (candidateError) return { error: candidateError.message };

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .insert({
      organization_id: organization.id,
      job_posting_id: jobPostingId,
      candidate_id: candidate.id,
      stage: "applied",
    })
    .select()
    .single();

  if (applicationError) return { error: applicationError.message };

  if (parsed.data.profileText) {
    await runAiReviewInternal(application.id, {
      title: job.title,
      description: job.description,
      requirements: (job.requirements as string[]) ?? [],
      rawRequest: job.raw_request,
      candidateName: parsed.data.fullName,
      profileText: parsed.data.profileText,
    });
  }

  revalidatePath(`/dashboard/recruiting/${jobPostingId}`);
  return { success: true as const };
}

async function runAiReviewInternal(
  applicationId: string,
  job: { title: string; description: string | null; requirements: string[]; rawRequest: string; candidateName: string; profileText: string }
) {
  const supabase = await createClient();
  const result = await reviewCandidate(
    { title: job.title, description: job.description, requirements: job.requirements, rawRequest: job.rawRequest },
    { fullName: job.candidateName, profileText: job.profileText }
  );

  if (!result.configured || !result.review) return;

  await supabase
    .from("applications")
    .update({
      ai_summary: result.review.summary,
      ai_match: result.review as unknown as Record<string, unknown>,
      ai_reviewed_at: new Date().toISOString(),
      stage: "reviewed",
    })
    .eq("id", applicationId);
}

export async function rerunAiReview(applicationId: string) {
  const { organization } = await requireCurrentOrg();
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("applications")
    .select("job_posting_id, candidates(full_name, profile_text)")
    .eq("id", applicationId)
    .eq("organization_id", organization.id)
    .single();

  if (!application?.candidates) return { error: "Application not found." };
  const candidate = application.candidates as unknown as { full_name: string; profile_text: string | null };

  if (!candidate.profile_text) {
    return { error: "Add a background summary for this candidate before running AI review." };
  }

  const { data: job } = await supabase
    .from("job_postings")
    .select("title, description, requirements, raw_request")
    .eq("id", application.job_posting_id)
    .single();

  if (!job) return { error: "Job posting not found." };

  const result = await reviewCandidate(
    { title: job.title, description: job.description, requirements: (job.requirements as string[]) ?? [], rawRequest: job.raw_request },
    { fullName: candidate.full_name, profileText: candidate.profile_text }
  );

  if (!result.configured) return { notConfigured: true as const };
  if (result.error || !result.review) return { error: result.error ?? "AI review failed." };

  await supabase
    .from("applications")
    .update({
      ai_summary: result.review.summary,
      ai_match: result.review as unknown as Record<string, unknown>,
      ai_reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  revalidatePath(`/dashboard/recruiting/${application.job_posting_id}`);
  return { success: true as const };
}

export async function moveApplicationStage(applicationId: string, stage: ApplicationStage) {
  const { organization } = await requireCurrentOrg();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .update({ stage })
    .eq("id", applicationId)
    .eq("organization_id", organization.id)
    .select("job_posting_id")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/recruiting/${data.job_posting_id}`);
  return { success: true as const };
}
