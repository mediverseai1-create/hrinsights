import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns [] instead of throwing if the recruiting tables don't exist yet
 * (migration 0009 not yet run) — this is read from the Overview page, so a
 * pending migration should degrade to "no recruiting data" rather than
 * break a page that already worked before recruiting existed.
 */
export async function listJobPostings(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("*, departments(name), applications(id, stage)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function getJobPosting(organizationId: string, jobPostingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("*, departments(name)")
    .eq("organization_id", organizationId)
    .eq("id", jobPostingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function listApplicationsForJob(organizationId: string, jobPostingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*, candidates(*)")
    .eq("organization_id", organizationId)
    .eq("job_posting_id", jobPostingId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getResumeSignedUrl(resumePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("candidate-resumes")
    .createSignedUrl(resumePath, 60 * 60);

  if (error) return null;
  return data.signedUrl;
}
