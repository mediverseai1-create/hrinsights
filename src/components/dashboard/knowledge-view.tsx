"use client";

import { useRef, useState } from "react";
import { BookOpen, Upload, Trash2 } from "lucide-react";
import { addCompanyDocument, deleteCompanyDocument } from "@/app/dashboard/knowledge/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface CompanyDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  created_at: string;
}

export function KnowledgeView({
  documents,
  aiConfigured,
}: {
  documents: CompanyDocument[];
  aiConfigured: boolean;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave(source: "pasted" | "upload") {
    setSaving(true);
    setError(null);
    const result = await addCompanyDocument({ title, content }, source);
    setSaving(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setTitle("");
    setContent("");
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("text/") && !file.name.match(/\.(txt|md)$/i)) {
      setError("Only plain text (.txt) or markdown (.md) files are supported right now — PDF/DOCX parsing is coming soon.");
      return;
    }
    const text = await file.text();
    setTitle((prev) => prev || file.name.replace(/\.[^.]+$/, ""));
    setContent(text);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this document? The HR Assistant will no longer use it.")) return;
    setDeletingId(id);
    await deleteCompanyDocument(id);
    setDeletingId(null);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Company Knowledge</h1>
      <p className="mt-1 text-sm text-ink-500">
        Upload policies and handbooks. The HR Assistant answers from these — never guesses.
      </p>
      {!aiConfigured && (
        <p className="mt-1 text-xs text-warning-600">
          AI isn&apos;t configured yet, so documents are stored but not yet used to answer questions.
        </p>
      )}

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Add knowledge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="doc-title">Title</Label>
            <Input
              id="doc-title"
              placeholder="e.g. Leave Policy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="doc-content">Content</Label>
            <Textarea
              id="doc-content"
              className="min-h-40"
              placeholder="Paste the policy text here, or upload a .txt/.md file below."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-dashed border-ink-900/15 bg-cream-50 px-3 py-2.5 text-sm text-ink-500 hover:border-forest-700/40"
          >
            <Upload className="h-4 w-4" />
            Upload a .txt or .md file instead
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {error && <p className="text-sm text-danger-600">{error}</p>}

          <Button onClick={() => handleSave("pasted")} disabled={saving || !title || !content}>
            {saving ? "Saving…" : "Add document"}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-ink-900">Documents</h2>
        {documents.length === 0 ? (
          <EmptyState
            className="mt-3"
            icon={BookOpen}
            title="No knowledge added yet"
            description="Add your employee handbook, leave policy, or SOPs above so the HR Assistant can answer questions from them."
          />
        ) : (
          <div className="mt-3 space-y-2">
            {documents.map((d) => (
              <Card key={d.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-900">{d.title}</p>
                    <Badge tone="neutral">{d.source}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">
                    Added {formatDate(d.created_at)} · {d.content.length.toLocaleString()} characters
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(d.id)}
                  disabled={deletingId === d.id}
                  className="rounded-md p-1.5 text-ink-400 hover:bg-danger-50 hover:text-danger-600"
                  aria-label={`Remove ${d.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
