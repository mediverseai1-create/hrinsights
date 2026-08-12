"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Copy, Printer, Check } from "lucide-react";
import { letterSchema, type LetterInput } from "@/lib/validations/letter";
import { generateLetter } from "@/app/dashboard/writing-assistant/actions";
import { LETTER_DOCUMENT_TYPES, LETTER_TONES } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Textarea, Label, FieldError } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

interface EmployeeOption {
  id: string;
  full_name: string;
}

interface RecentLetter {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
  employees: { full_name: string } | null;
}

export function WritingAssistantView({
  employees,
  recentLetters,
  canUseAi,
}: {
  employees: EmployeeOption[];
  recentLetters: RecentLetter[];
  canUseAi: boolean;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LetterInput>({
    resolver: zodResolver(letterSchema),
    defaultValues: { documentType: "query", tone: "firm" },
  });

  async function onSubmit(values: LetterInput) {
    setServerError(null);
    setNotConfigured(false);
    setContent(null);

    if (!canUseAi) {
      setServerError("The AI writing assistant is a Pro feature. Upgrade to Pro to generate letters.");
      return;
    }

    const result = await generateLetter(values);
    if (result?.notConfigured) {
      setNotConfigured(true);
      return;
    }
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setContent(result?.letter?.content ?? null);
  }

  function handleCopy() {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Writing Assistant</h1>
      <p className="mt-1 text-sm text-ink-500">Create an HR letter grounded in what actually happened.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Letter details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentType">Document type</Label>
                  <Select id="documentType" {...register("documentType")}>
                    {LETTER_DOCUMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select id="tone" {...register("tone")}>
                    {LETTER_TONES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="employeeId">Employee</Label>
                <Select id="employeeId" {...register("employeeId")} defaultValue="">
                  <option value="" disabled>
                    Select employee
                  </option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.full_name}
                    </option>
                  ))}
                </Select>
                <FieldError>{errors.employeeId?.message}</FieldError>
              </div>

              <div>
                <Label htmlFor="prompt">What happened?</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g. Arrived late four times this week, most recently at 8:27am on Monday."
                  {...register("prompt")}
                />
                <FieldError>{errors.prompt?.message}</FieldError>
                <p className="mt-1 text-xs text-ink-400">
                  Be specific — the letter is generated only from what you describe here.
                </p>
              </div>

              {serverError && <p className="text-sm text-danger-600">{serverError}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Sparkles className="h-4 w-4" />
                {isSubmitting ? "Generating…" : "Generate draft"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="min-h-[260px]">
            <CardHeader>
              <CardTitle>Draft</CardTitle>
            </CardHeader>
            <CardContent>
              {notConfigured ? (
                <EmptyState
                  icon={Sparkles}
                  title="AI writing assistant — coming soon"
                  description="This organization hasn't connected an AI provider yet. Once ANTHROPIC_API_KEY is configured on the server, letters will generate here."
                  className="border-none bg-transparent py-6"
                />
              ) : content ? (
                <div>
                  <div className="whitespace-pre-wrap rounded-lg bg-cream-50 p-4 text-sm text-ink-900">
                    {content}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy}>
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.print()}>
                      <Printer className="h-3.5 w-3.5" />
                      Print / Save as PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-400">Fill in the form and generate a draft to preview it here.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent documents</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLetters.length === 0 ? (
                <p className="text-sm text-ink-400">No drafts yet.</p>
              ) : (
                <ul className="divide-y divide-ink-900/6">
                  {recentLetters.map((l) => (
                    <li key={l.id} className="flex items-center justify-between py-2.5 text-sm">
                      <div>
                        <p className="font-medium capitalize text-ink-900">
                          {l.document_type} — {l.employees?.full_name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-ink-400">{formatDate(l.created_at)}</p>
                      </div>
                      <Badge tone={l.status === "final" ? "success" : "neutral"}>{l.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
