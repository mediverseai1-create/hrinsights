"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mic, Paperclip, Sparkles, Users } from "lucide-react";
import { jobIntakeSchema, type JobIntakeInput } from "@/lib/validations/recruiting";
import { createJobPosting } from "@/app/dashboard/recruiting/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Label, FieldError } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

interface JobPostingListItem {
  id: string;
  title: string;
  status: string;
  departments: { name: string } | null;
  applications: { id: string; stage: string }[];
}

export function RecruitingView({
  postings,
  departments,
  aiConfigured,
}: {
  postings: JobPostingListItem[];
  departments: { id: string; name: string }[];
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobIntakeInput>({ resolver: zodResolver(jobIntakeSchema) });

  async function onSubmit(values: JobIntakeInput) {
    setServerError(null);
    const result = await createJobPosting(values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    router.push(`/dashboard/recruiting/${result?.jobPostingId}`);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Recruiting</h1>
      <p className="mt-1 text-sm text-ink-500">Describe who you need, and HRInsights sets up the rest.</p>

      <Card className="mt-5">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="rawRequest">What would you like to hire for?</Label>
              <div className="relative">
                <Textarea
                  id="rawRequest"
                  className="min-h-28 pr-20"
                  placeholder="e.g. We need a senior frontend developer in Lagos. React/Next.js experience is important. Budget is ₦800k–₦1.2m monthly and we'd like someone within 30 days."
                  {...register("rawRequest")}
                />
                <div className="absolute bottom-2.5 right-2.5 flex gap-1">
                  <button
                    type="button"
                    disabled
                    title="Voice input — coming soon"
                    className="rounded-md p-1.5 text-ink-300 cursor-not-allowed"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Upload a job description — coming soon"
                    className="rounded-md p-1.5 text-ink-300 cursor-not-allowed"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <FieldError>{errors.rawRequest?.message}</FieldError>
              {!aiConfigured && (
                <p className="mt-1 text-xs text-ink-400">
                  AI extraction isn&apos;t configured yet, so you&apos;ll fill in the job description and
                  requirements yourself after this — everything else here still works.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Role title</Label>
                <Input id="title" placeholder="e.g. Senior Frontend Developer" {...register("title")} />
                <FieldError>{errors.title?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select id="department" {...register("department")} defaultValue="">
                  <option value="" disabled>
                    Select department
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </Select>
                <FieldError>{errors.department?.message}</FieldError>
              </div>
            </div>

            {serverError && <p className="text-sm text-danger-600">{serverError}</p>}

            <Button type="submit" disabled={isSubmitting}>
              <Sparkles className="h-4 w-4" />
              {isSubmitting ? "Setting up…" : "Start hiring"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-ink-900">Open roles</h2>
        {postings.length === 0 ? (
          <EmptyState
            className="mt-3"
            icon={Users}
            title="No roles yet"
            description="Describe your first hiring need above to open a recruiting workspace."
          />
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {postings.map((p) => {
              const total = p.applications.length;
              const active = p.applications.filter((a) => !["hired", "rejected"].includes(a.stage)).length;
              return (
                <Link key={p.id} href={`/dashboard/recruiting/${p.id}`}>
                  <Card className="h-full p-5 transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-ink-900">{p.title}</h3>
                      <Badge tone={p.status === "open" ? "success" : "neutral"}>{p.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-400">{p.departments?.name ?? "Unassigned"}</p>
                    <p className="mt-4 text-sm text-ink-700">
                      {total} applicant{total === 1 ? "" : "s"}
                      {active > 0 && <span className="text-ink-400"> · {active} active</span>}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
