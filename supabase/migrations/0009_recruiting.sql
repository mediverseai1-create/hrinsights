-- HRInsights — Recruiting workspace
-- job_postings -> candidates -> applications (join table carrying pipeline stage)

create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  department_id uuid references public.departments (id) on delete set null,
  location text,
  employment_type text not null default 'full_time'
    check (employment_type in ('full_time', 'part_time', 'contract')),
  salary_min numeric,
  salary_max numeric,
  salary_currency text,
  raw_request text not null,
  description text,
  requirements jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('draft', 'open', 'closed')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_postings_organization_id_idx on public.job_postings (organization_id);

drop trigger if exists job_postings_set_updated_at on public.job_postings;
create trigger job_postings_set_updated_at
  before update on public.job_postings
  for each row execute function public.set_updated_at();

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  profile_text text,
  resume_path text,
  source text not null default 'manual' check (source in ('manual', 'application')),
  created_at timestamptz not null default now()
);

create index if not exists candidates_organization_id_idx on public.candidates (organization_id);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  job_posting_id uuid not null references public.job_postings (id) on delete cascade,
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  stage text not null default 'applied'
    check (stage in ('applied', 'reviewed', 'screening', 'interview', 'final_review', 'offer', 'hired', 'rejected')),
  ai_summary text,
  ai_match jsonb,
  ai_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_posting_id, candidate_id)
);

create index if not exists applications_job_posting_id_idx on public.applications (job_posting_id);
create index if not exists applications_organization_id_idx on public.applications (organization_id);

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

alter table public.job_postings enable row level security;
create policy "job_postings: members read" on public.job_postings for select using (public.is_org_member(organization_id));
create policy "job_postings: members write" on public.job_postings for insert with check (public.is_org_member(organization_id));
create policy "job_postings: members update" on public.job_postings for update using (public.is_org_member(organization_id));
create policy "job_postings: members delete" on public.job_postings for delete using (public.is_org_member(organization_id));

alter table public.candidates enable row level security;
create policy "candidates: members read" on public.candidates for select using (public.is_org_member(organization_id));
create policy "candidates: members write" on public.candidates for insert with check (public.is_org_member(organization_id));
create policy "candidates: members update" on public.candidates for update using (public.is_org_member(organization_id));
create policy "candidates: members delete" on public.candidates for delete using (public.is_org_member(organization_id));

alter table public.applications enable row level security;
create policy "applications: members read" on public.applications for select using (public.is_org_member(organization_id));
create policy "applications: members write" on public.applications for insert with check (public.is_org_member(organization_id));
create policy "applications: members update" on public.applications for update using (public.is_org_member(organization_id));
create policy "applications: members delete" on public.applications for delete using (public.is_org_member(organization_id));

-- Private bucket: resumes are only ever reached via org-scoped signed URLs,
-- never a public link like the check-in photos.
insert into storage.buckets (id, name, public)
values ('candidate-resumes', 'candidate-resumes', false)
on conflict (id) do nothing;

-- Uploaded paths are always "{organization_id}/{candidate_id}-{filename}", so
-- the first path segment doubles as the organization scope for both policies.
drop policy if exists "resumes: org members upload" on storage.objects;
create policy "resumes: org members upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'candidate-resumes'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "resumes: org members read" on storage.objects;
create policy "resumes: org members read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'candidate-resumes'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "resumes: org members delete" on storage.objects;
create policy "resumes: org members delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'candidate-resumes'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );
