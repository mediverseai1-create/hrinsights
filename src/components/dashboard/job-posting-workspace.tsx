"use client";

import { useMemo, useState, useTransition } from "react";
import { UserPlus, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { AddCandidateDialog } from "@/components/dashboard/add-candidate-dialog";
import { moveApplicationStage, rerunAiReview } from "@/app/dashboard/recruiting/actions";
import { cn, formatDate } from "@/lib/utils";
import type { ApplicationStage } from "@/lib/types/database";
import type { CandidateReview } from "@/lib/ai/recruiting";

const STAGES: { value: ApplicationStage; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "reviewed", label: "Reviewed" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "final_review", label: "Final review" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

const MATCH_TONE = { strong: "success", possible: "warning", weak: "neutral" } as const;

interface Candidate {
  id: string;
  full_name: string;
  email: string | null;
  profile_text: string | null;
}

interface Application {
  id: string;
  stage: ApplicationStage;
  ai_summary: string | null;
  ai_match: Record<string, unknown> | null;
  ai_reviewed_at: string | null;
  created_at: string;
  candidates: Candidate;
}

interface Job {
  id: string;
  organization_id: string;
  title: string;
  status: string;
  location: string | null;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  description: string | null;
  requirements: string[];
  raw_request: string;
  departments: { name: string } | null;
}

const TABS = ["Overview", "Candidates", "Screening", "Interviews", "Shortlist", "Activity"] as const;

export function JobPostingWorkspace({
  job,
  applications,
  aiConfigured,
}: {
  job: Job;
  applications: Application[];
  aiConfigured: boolean;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Candidates");
  const [addOpen, setAddOpen] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<ApplicationStage, number>();
    for (const a of applications) map.set(a.stage, (map.get(a.stage) ?? 0) + 1);
    return map;
  }, [applications]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-ink-900">{job.title}</h1>
            <Badge tone={job.status === "open" ? "success" : "neutral"}>{job.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {job.departments?.name ?? "Unassigned"}
            {job.location && ` · ${job.location}`} · {applications.length} applicant
            {applications.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Add candidate
        </Button>
      </div>

      {/* Pipeline strip */}
      <div className="mt-5 flex flex-wrap gap-2">
        {STAGES.filter((s) => s.value !== "rejected").map((s) => (
          <span
            key={s.value}
            className="flex items-center gap-1.5 rounded-full border border-ink-900/10 bg-white px-3 py-1.5 text-xs text-ink-700"
          >
            {s.label}
            <Badge tone="neutral">{counts.get(s.value) ?? 0}</Badge>
          </span>
        ))}
      </div>

      <div className="mt-6 flex gap-1 border-b border-ink-900/8">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
              tab === t ? "border-forest-800 text-forest-900" : "border-transparent text-ink-400 hover:text-ink-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "Overview" && <OverviewTab job={job} />}

        {tab === "Candidates" && (
          <CandidatesTab applications={applications} aiConfigured={aiConfigured} />
        )}

        {(tab === "Screening" || tab === "Interviews" || tab === "Shortlist") && (
          <EmptyState
            icon={Sparkles}
            title={`${tab} — coming soon`}
            description={`AI-assisted ${tab.toLowerCase()} is planned for a future update. For now, manage candidates from the Candidates tab.`}
          />
        )}

        {tab === "Activity" && <ActivityTab applications={applications} />}
      </div>

      <AddCandidateDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        jobPostingId={job.id}
        organizationId={job.organization_id}
        aiConfigured={aiConfigured}
      />
    </div>
  );
}

function OverviewTab({ job }: { job: Job }) {
  const salary =
    job.salary_min || job.salary_max
      ? `${job.salary_currency ?? ""} ${job.salary_min ?? "?"}–${job.salary_max ?? "?"}`.trim()
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <Card>
        <CardHeader>
          <CardTitle>Job description</CardTitle>
        </CardHeader>
        <CardContent>
          {job.description ? (
            <p className="whitespace-pre-wrap text-sm text-ink-700">{job.description}</p>
          ) : (
            <p className="text-sm text-ink-400">
              No description generated yet. Original request:
              <span className="mt-2 block whitespace-pre-wrap text-ink-700">{job.raw_request}</span>
            </p>
          )}

          {job.requirements.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Key requirements</p>
              <ul className="mt-2 space-y-1.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="text-sm text-ink-700">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-400">Employment type</span>
            <span className="capitalize text-ink-900">{job.employment_type.replace("_", " ")}</span>
          </div>
          {job.location && (
            <div className="flex justify-between">
              <span className="text-ink-400">Location</span>
              <span className="text-ink-900">{job.location}</span>
            </div>
          )}
          {salary && (
            <div className="flex justify-between">
              <span className="text-ink-400">Salary</span>
              <span className="text-ink-900">{salary}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CandidatesTab({ applications, aiConfigured }: { applications: Application[]; aiConfigured: boolean }) {
  if (applications.length === 0) {
    return (
      <EmptyState
        icon={UserPlus}
        title="No candidates yet"
        description="Add a candidate to start building the pipeline for this role."
      />
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((a) => (
        <CandidateCard key={a.id} application={a} aiConfigured={aiConfigured} />
      ))}
    </div>
  );
}

function CandidateCard({ application, aiConfigured }: { application: Application; aiConfigured: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const review = application.ai_match as unknown as CandidateReview | null;

  function handleStageChange(stage: ApplicationStage) {
    startTransition(() => {
      moveApplicationStage(application.id, stage);
    });
  }

  async function handleRunReview() {
    setReviewing(true);
    setReviewError(null);
    const result = await rerunAiReview(application.id);
    setReviewing(false);
    if (result?.error) setReviewError(result.error);
    if (result?.notConfigured) setReviewError("AI review isn't configured yet — add a GEMINI_API_KEY to enable it.");
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink-900">{application.candidates.full_name}</p>
          <p className="text-xs text-ink-400">{application.candidates.email ?? "No email on file"}</p>
        </div>
        <div className="flex items-center gap-2">
          {review && <Badge tone={MATCH_TONE[review.matchLevel]}>{review.matchLevel} match</Badge>}
          <Select
            value={application.stage}
            onChange={(e) => handleStageChange(e.target.value as ApplicationStage)}
            disabled={pending}
            className="h-8 w-36 text-xs"
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {application.ai_summary ? (
        <p className="mt-3 text-sm text-ink-700">{application.ai_summary}</p>
      ) : (
        <p className="mt-3 text-sm text-ink-400">
          {aiConfigured
            ? application.candidates.profile_text
              ? "Not reviewed yet."
              : "Add a background summary to enable AI review."
            : "AI review isn't configured yet."}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        {application.candidates.profile_text && (
          <button
            onClick={handleRunReview}
            disabled={reviewing}
            className="flex items-center gap-1.5 text-xs font-medium text-forest-800 hover:underline disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {reviewing ? "Reviewing…" : application.ai_summary ? "Re-run AI review" : "Run AI review"}
          </button>
        )}
        {review && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-900"
          >
            {expanded ? "Hide evidence" : "Show evidence"}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {reviewError && <p className="mt-2 text-xs text-danger-600">{reviewError}</p>}

      {expanded && review && (
        <div className="mt-3 grid gap-3 rounded-lg bg-cream-50 p-3 sm:grid-cols-3">
          <EvidenceList label="Strengths" items={review.strengths} tone="success" />
          <EvidenceList label="Gaps" items={review.gaps} tone="warning" />
          <EvidenceList label="Missing info" items={review.missingInfo} tone="neutral" />
        </div>
      )}
    </Card>
  );
}

function EvidenceList({ label, items, tone }: { label: string; items: string[]; tone: "success" | "warning" | "neutral" }) {
  const mark = tone === "success" ? "✓" : tone === "warning" ? "•" : "?";
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      {items.length === 0 ? (
        <p className="mt-1 text-xs text-ink-400">None noted</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-ink-700">
              {mark} {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActivityTab({ applications }: { applications: Application[] }) {
  const events = applications
    .flatMap((a) => [
      { at: a.created_at, text: `${a.candidates.full_name} was added to the pipeline.` },
      ...(a.ai_reviewed_at
        ? [{ at: a.ai_reviewed_at, text: `AI review completed for ${a.candidates.full_name}.` }]
        : []),
    ])
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  if (events.length === 0) {
    return <EmptyState title="No activity yet" description="Activity will appear here as candidates move through the pipeline." />;
  }

  return (
    <ul className="space-y-3">
      {events.map((e, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-700" />
          <div>
            <p className="text-ink-900">{e.text}</p>
            <p className="text-xs text-ink-400">{formatDate(e.at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
