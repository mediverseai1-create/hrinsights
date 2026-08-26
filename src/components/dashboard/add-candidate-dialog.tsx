"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip } from "lucide-react";
import { candidateSchema, type CandidateInput } from "@/lib/validations/recruiting";
import { addCandidate } from "@/app/dashboard/recruiting/actions";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/input";

export function AddCandidateDialog({
  open,
  onClose,
  jobPostingId,
  organizationId,
  aiConfigured,
}: {
  open: boolean;
  onClose: () => void;
  jobPostingId: string;
  organizationId: string;
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CandidateInput>({ resolver: zodResolver(candidateSchema) });

  function handleClose() {
    reset();
    setResumeFile(null);
    setServerError(null);
    onClose();
  }

  async function onSubmit(values: CandidateInput) {
    setServerError(null);

    let resumePath: string | null = null;
    if (resumeFile) {
      const supabase = createClient();
      const path = `${organizationId}/${crypto.randomUUID()}-${resumeFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("candidate-resumes")
        .upload(path, resumeFile);
      if (uploadError) {
        setServerError(`Couldn't upload resume: ${uploadError.message}`);
        return;
      }
      resumePath = path;
    }

    const result = await addCandidate(jobPostingId, values, resumePath);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    router.refresh();
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Add candidate">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" placeholder="Candidate's full name" {...register("fullName")} />
          <FieldError>{errors.fullName?.message}</FieldError>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" {...register("phone")} />
          </div>
        </div>
        <div>
          <Label htmlFor="profileText">Background / CV summary</Label>
          <Textarea
            id="profileText"
            className="min-h-32"
            placeholder="Paste their CV text, LinkedIn summary, or a description of their experience — this is what HRInsights reads to compare them against the role."
            {...register("profileText")}
          />
          <FieldError>{errors.profileText?.message}</FieldError>
          {!aiConfigured && (
            <p className="mt-1 text-xs text-ink-400">
              AI review isn&apos;t configured yet, so this is stored for your own reference only.
            </p>
          )}
        </div>
        <div>
          <Label>Resume file (optional)</Label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-900/15 bg-cream-50 px-3 py-2.5 text-sm text-ink-500 hover:border-forest-700/40">
            <Paperclip className="h-4 w-4" />
            {resumeFile ? resumeFile.name : "Attach a resume (kept for reference, not read by AI yet)"}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {serverError && <p className="text-sm text-danger-600">{serverError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add candidate"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
