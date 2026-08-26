-- HRInsights — Company Knowledge
-- Plain-text policy/handbook content the HR Assistant can ground answers in.
-- (PDF/DOCX text extraction is out of scope for now — pasted text and
-- .txt/.md uploads only; the UI is explicit about this.)

create table if not exists public.company_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  content text not null,
  source text not null default 'pasted' check (source in ('pasted', 'upload')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists company_documents_organization_id_idx on public.company_documents (organization_id);

alter table public.company_documents enable row level security;
create policy "company_documents: members read" on public.company_documents for select using (public.is_org_member(organization_id));
create policy "company_documents: members write" on public.company_documents for insert with check (public.is_org_member(organization_id));
create policy "company_documents: members delete" on public.company_documents for delete using (public.is_org_member(organization_id));
