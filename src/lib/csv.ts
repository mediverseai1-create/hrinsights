import Papa from "papaparse";
import { csvRowSchema, type CsvRow } from "@/lib/validations/employee";

export interface CsvParseResult {
  rows: CsvRow[];
  errors: { row: number; message: string }[];
}

const REQUIRED_HEADERS = ["full_name", "department"];

export function parseEmployeeCsv(fileText: string): CsvParseResult {
  const parsed = Papa.parse<Record<string, string>>(fileText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  const errors: { row: number; message: string }[] = [];

  const headers = parsed.meta.fields ?? [];
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return { rows: [], errors: [{ row: 0, message: `Missing required column(s): ${missing.join(", ")}` }] };
  }

  const rows: CsvRow[] = [];
  parsed.data.forEach((raw, index) => {
    const candidate = {
      full_name: raw.full_name?.trim() ?? "",
      email: raw.email?.trim() ?? "",
      department: raw.department?.trim() ?? "",
      role_title: raw.role_title?.trim() ?? "",
      shift_start: raw.shift_start?.trim() ?? "",
    };
    const result = csvRowSchema.safeParse(candidate);
    if (!result.success) {
      errors.push({ row: index + 2, message: result.error.issues[0]?.message ?? "Invalid row" });
      return;
    }
    rows.push(result.data);
  });

  return { rows, errors };
}

export const SAMPLE_CSV_CONTENT = `full_name,email,department,role_title,shift_start
Amaka Okafor,amaka.o@company.com,Sales,Account Executive,08:00
Tunde Adisa,tunde.a@company.com,Operations,Ops Associate,08:00
David Edet,david.e@company.com,Customer Support,Support Agent,08:00
`;
