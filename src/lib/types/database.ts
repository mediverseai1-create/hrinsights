// Hand-written to match supabase/migrations/*.sql. If the schema changes,
// update this file (or regenerate via `supabase gen types typescript`).

export type Plan = "free" | "starter" | "pro";
export type MemberRole = "owner" | "admin" | "member";
export type EmployeeStatus = "active" | "inactive";
export type AttendanceStatus = "present" | "late" | "absent";
export type LetterDocType =
  | "query"
  | "warning"
  | "confirmation"
  | "reference"
  | "termination"
  | "offer";
export type LetterTone = "firm" | "neutral" | "friendly";
export type ReportType = "workforce_summary" | "department_analysis" | "attendance_trend";
export type EmploymentType = "full_time" | "part_time" | "contract";
export type JobPostingStatus = "draft" | "open" | "closed";
export type CandidateSource = "manual" | "application";
export type ApplicationStage =
  | "applied"
  | "reviewed"
  | "screening"
  | "interview"
  | "final_review"
  | "offer"
  | "hired"
  | "rejected";
export type CompanyDocumentSource = "pasted" | "upload";

export interface Database {
  public: {
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; email: string | null; created_at: string };
        Insert: { id: string; full_name?: string | null; email?: string | null };
        Update: { full_name?: string | null; email?: string | null };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          industry: string | null;
          size: string | null;
          country: string | null;
          currency: string;
          plan: Plan;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          industry?: string | null;
          size?: string | null;
          country?: string | null;
          currency?: string;
          plan?: Plan;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: MemberRole;
          created_at: string;
        };
        Insert: { id?: string; organization_id: string; user_id: string; role?: MemberRole };
        Update: { role?: MemberRole };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      departments: {
        Row: { id: string; organization_id: string; name: string; created_at: string };
        Insert: { id?: string; organization_id: string; name: string };
        Update: { name?: string };
        Relationships: [];
      };
      employees: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string;
          email: string | null;
          department_id: string | null;
          role_title: string | null;
          shift_start: string;
          status: EmployeeStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          full_name: string;
          email?: string | null;
          department_id?: string | null;
          role_title?: string | null;
          shift_start?: string;
          status?: EmployeeStatus;
        };
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey";
            columns: ["department_id"];
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
        ];
      };
      attendance_records: {
        Row: {
          id: string;
          organization_id: string;
          employee_id: string;
          date: string;
          check_in: string | null;
          check_out: string | null;
          status: AttendanceStatus;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          employee_id: string;
          date?: string;
          check_in?: string | null;
          check_out?: string | null;
          status?: AttendanceStatus;
          photo_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["attendance_records"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey";
            columns: ["employee_id"];
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      csv_imports: {
        Row: {
          id: string;
          organization_id: string;
          uploaded_by: string | null;
          file_name: string;
          row_count: number;
          status: "completed" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          uploaded_by?: string | null;
          file_name: string;
          row_count?: number;
          status?: "completed" | "failed";
        };
        Update: Partial<Database["public"]["Tables"]["csv_imports"]["Insert"]>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          organization_id: string;
          created_by: string | null;
          type: ReportType;
          period_start: string | null;
          period_end: string | null;
          data: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          created_by?: string | null;
          type: ReportType;
          period_start?: string | null;
          period_end?: string | null;
          data: Record<string, unknown>;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
        Relationships: [];
      };
      letters: {
        Row: {
          id: string;
          organization_id: string;
          employee_id: string | null;
          created_by: string | null;
          document_type: LetterDocType;
          tone: LetterTone;
          prompt: string;
          content: string | null;
          status: "draft" | "final";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          employee_id?: string | null;
          created_by?: string | null;
          document_type: LetterDocType;
          tone?: LetterTone;
          prompt: string;
          content?: string | null;
          status?: "draft" | "final";
        };
        Update: Partial<Database["public"]["Tables"]["letters"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "letters_employee_id_fkey";
            columns: ["employee_id"];
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      job_postings: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          department_id: string | null;
          location: string | null;
          employment_type: EmploymentType;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string | null;
          raw_request: string;
          description: string | null;
          requirements: string[];
          status: JobPostingStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          department_id?: string | null;
          location?: string | null;
          employment_type?: EmploymentType;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          raw_request: string;
          description?: string | null;
          requirements?: string[];
          status?: JobPostingStatus;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["job_postings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "job_postings_department_id_fkey";
            columns: ["department_id"];
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
        ];
      };
      candidates: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          profile_text: string | null;
          resume_path: string | null;
          source: CandidateSource;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          profile_text?: string | null;
          resume_path?: string | null;
          source?: CandidateSource;
        };
        Update: Partial<Database["public"]["Tables"]["candidates"]["Insert"]>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          organization_id: string;
          job_posting_id: string;
          candidate_id: string;
          stage: ApplicationStage;
          ai_summary: string | null;
          ai_match: Record<string, unknown> | null;
          ai_reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          job_posting_id: string;
          candidate_id: string;
          stage?: ApplicationStage;
          ai_summary?: string | null;
          ai_match?: Record<string, unknown> | null;
          ai_reviewed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "applications_job_posting_id_fkey";
            columns: ["job_posting_id"];
            referencedRelation: "job_postings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_candidate_id_fkey";
            columns: ["candidate_id"];
            referencedRelation: "candidates";
            referencedColumns: ["id"];
          },
        ];
      };
      company_documents: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          content: string;
          source: CompanyDocumentSource;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          content: string;
          source?: CompanyDocumentSource;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["company_documents"]["Insert"]>;
        Relationships: [];
      };
    };
    Functions: {
      create_organization_with_owner: {
        Args: {
          p_name: string;
          p_slug: string;
          p_industry: string;
          p_size: string;
          p_country: string;
          p_currency: string;
          p_departments: string[];
        };
        Returns: Database["public"]["Tables"]["organizations"]["Row"];
      };
      get_checkin_roster: {
        Args: { org_slug: string };
        Returns: { employee_id: string; full_name: string }[];
      };
      record_check_in: {
        Args: { org_slug: string; p_employee_id: string; p_photo_url?: string | null };
        Returns: { status: AttendanceStatus; check_in: string }[];
      };
      record_check_out: {
        Args: { org_slug: string; p_employee_id: string };
        Returns: { check_out: string }[];
      };
      get_org_public_name: {
        Args: { org_slug: string };
        Returns: string;
      };
    };
  };
}
