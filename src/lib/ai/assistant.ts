import "server-only";
import { createClient } from "@/lib/supabase/server";
import { callGemini, type GeminiTurn, type GeminiResult } from "@/lib/ai/gemini";

const KNOWLEDGE_DOC_CHAR_LIMIT = 1500;
const MAX_KNOWLEDGE_DOCS = 6;

/**
 * Pulls a compact, real snapshot of this organization's own data — the HR
 * Assistant is only ever grounded in what's actually stored, never invented.
 */
export async function buildAssistantContext(organizationId: string, organizationName: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: employees }, { data: todayAttendance }, { data: postings }, { data: docs }] =
    await Promise.all([
      supabase
        .from("employees")
        .select("id, full_name, department_id, status, departments(name)")
        .eq("organization_id", organizationId)
        .eq("status", "active"),
      supabase
        .from("attendance_records")
        .select("employee_id, status, check_in, employees(full_name)")
        .eq("organization_id", organizationId)
        .eq("date", today),
      supabase
        .from("job_postings")
        .select("id, title, status, applications(id, stage)")
        .eq("organization_id", organizationId),
      supabase
        .from("company_documents")
        .select("title, content")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(MAX_KNOWLEDGE_DOCS),
    ]);

  const activeEmployees = employees ?? [];
  const attendanceToday = todayAttendance ?? [];
  const present = attendanceToday.filter((a) => a.status === "present").length;
  const late = attendanceToday.filter((a) => a.status === "late").length;
  const checkedInIds = new Set(attendanceToday.map((a) => a.employee_id));
  const notCheckedIn = activeEmployees.filter((e) => !checkedInIds.has(e.id));

  const lateToday = attendanceToday
    .filter((a) => a.status === "late")
    .map((a) => (a.employees as unknown as { full_name: string } | null)?.full_name)
    .filter(Boolean);

  const jobSummaries = (postings ?? []).map((p) => {
    const apps = p.applications as unknown as { stage: string }[];
    const active = apps.filter((a) => !["hired", "rejected"].includes(a.stage)).length;
    return `- "${p.title}" (${p.status}): ${apps.length} applicant(s), ${active} active in pipeline`;
  });

  const knowledgeSections = (docs ?? []).map(
    (d) => `--- ${d.title} ---\n${d.content.slice(0, KNOWLEDGE_DOC_CHAR_LIMIT)}`
  );

  return [
    `Organization: ${organizationName}`,
    `Active employees: ${activeEmployees.length}`,
    `Today's attendance: ${present} present, ${late} late, ${notCheckedIn.length} not checked in yet.`,
    lateToday.length > 0 ? `Late today: ${lateToday.join(", ")}.` : "",
    notCheckedIn.length > 0
      ? `Not checked in yet: ${notCheckedIn.map((e) => e.full_name).join(", ")}.`
      : "",
    jobSummaries.length > 0 ? `Open recruiting:\n${jobSummaries.join("\n")}` : "No active job postings.",
    knowledgeSections.length > 0
      ? `Company knowledge documents:\n${knowledgeSections.join("\n\n")}`
      : "No company knowledge documents uploaded yet.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

const SYSTEM = [
  "You are the HR Assistant inside HRInsights, a workforce management platform. Answer only from the",
  "workspace context you're given below — real employee, attendance, recruiting, and company-policy",
  "data for this specific organization. If the answer isn't in the context, say plainly that you don't",
  "have that information rather than guessing. Never infer or discuss protected characteristics (age,",
  "gender, ethnicity, religion, disability, health, etc.). Keep answers concise and directly useful to",
  "an HR manager. When you use a company knowledge document, mention its title as the source.",
].join(" ");

export async function askAssistant(
  context: string,
  history: GeminiTurn[],
  question: string
): Promise<GeminiResult> {
  return callGemini({
    system: `${SYSTEM}\n\nWorkspace context:\n${context}`,
    prompt: question,
    history,
  });
}
