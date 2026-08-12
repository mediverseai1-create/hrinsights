"use client";

import { useRef, useState } from "react";
import { Upload, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseEmployeeCsv, type CsvParseResult } from "@/lib/csv";
import { importEmployeesCsv } from "@/app/dashboard/employees/actions";

type Step = "select" | "preview" | "done";

export function CsvImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>("select");
  const [fileName, setFileName] = useState("");
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("select");
    setFileName("");
    setParseResult(null);
    setImportedCount(0);
    setServerError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    const text = await file.text();
    const result = parseEmployeeCsv(text);
    setParseResult(result);
    setStep("preview");
  }

  async function handleConfirmImport() {
    if (!parseResult || parseResult.rows.length === 0) return;
    setImporting(true);
    setServerError(null);
    const result = await importEmployeesCsv(parseResult.rows, fileName);
    setImporting(false);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setImportedCount(result?.imported ?? 0);
    setStep("done");
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Import workforce data" className="max-w-lg">
      {step === "select" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-500">
            Upload a CSV of your employees. Each row needs at least a full name and department.
          </p>
          <a
            href="/sample-employees-template.csv"
            download
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-800"
          >
            <Download className="h-3.5 w-3.5" />
            Download sample template
          </a>
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-900/15 bg-cream-50 py-10 text-center hover:border-forest-700/40"
          >
            <Upload className="h-6 w-6 text-ink-400" />
            <span className="text-sm font-medium text-ink-900">Click to select a CSV file</span>
            <span className="text-xs text-ink-400">.csv up to 5MB</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {step === "preview" && parseResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink-900">{fileName}</p>
            <div className="flex gap-2">
              <Badge tone="success">{parseResult.rows.length} valid</Badge>
              {parseResult.errors.length > 0 && (
                <Badge tone="danger">{parseResult.errors.length} errors</Badge>
              )}
            </div>
          </div>

          {parseResult.errors.length > 0 && (
            <div className="max-h-32 overflow-y-auto rounded-lg bg-danger-50 p-3 text-xs text-danger-600">
              {parseResult.errors.slice(0, 10).map((e, i) => (
                <p key={i}>
                  Row {e.row}: {e.message}
                </p>
              ))}
              {parseResult.errors.length > 10 && <p>…and {parseResult.errors.length - 10} more</p>}
            </div>
          )}

          {parseResult.rows.length > 0 && (
            <div className="max-h-56 overflow-y-auto rounded-lg border border-ink-900/8">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-cream-50">
                  <tr>
                    <th className="px-3 py-2 font-medium text-ink-500">Name</th>
                    <th className="px-3 py-2 font-medium text-ink-500">Department</th>
                    <th className="px-3 py-2 font-medium text-ink-500">Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-900/6">
                  {parseResult.rows.slice(0, 50).map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5 text-ink-900">{r.full_name}</td>
                      <td className="px-3 py-1.5 text-ink-700">{r.department}</td>
                      <td className="px-3 py-1.5 text-ink-700">{r.shift_start || "08:00"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {serverError && <p className="text-sm text-danger-600">{serverError}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={reset}>
              Choose a different file
            </Button>
            <Button onClick={handleConfirmImport} disabled={importing || parseResult.rows.length === 0}>
              {importing ? "Importing…" : `Import ${parseResult.rows.length} employees`}
            </Button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-success-600" />
          <p className="mt-3 text-sm font-semibold text-ink-900">
            Imported {importedCount} of {parseResult?.rows.length ?? 0} employees
          </p>
          {parseResult && importedCount < parseResult.rows.length && (
            <p className="mt-1 flex items-center gap-1 text-xs text-warning-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Some rows failed to import — check for duplicate emails.
            </p>
          )}
          <Button className="mt-5" onClick={handleClose}>
            Done
          </Button>
        </div>
      )}
    </Dialog>
  );
}
