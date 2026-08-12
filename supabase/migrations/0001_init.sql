-- HRInsights — core schema
-- Multi-tenant: every workforce table hangs off organization_id.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- profiles: one row per authenticated user (1:1 with auth.users)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- organizations
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  size text,
  country text,
  currency text not null default 'USD',
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists organization_members_user_id_idx on public.organization_members (user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- departments
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

-- ─────────────────────────────────────────────────────────────────────────
-- employees
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null,
  email text,
  department_id uuid references public.departments (id) on delete set null,
  role_title text,
  shift_start time not null default '08:00',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employees_organization_id_idx on public.employees (organization_id);
create index if not exists employees_department_id_idx on public.employees (department_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists employees_set_updated_at on public.employees;
create trigger employees_set_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- attendance_records — one row per employee per day
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  date date not null default current_date,
  check_in timestamptz,
  check_out timestamptz,
  status text not null default 'present' check (status in ('present', 'late', 'absent')),
  created_at timestamptz not null default now(),
  unique (employee_id, date)
);

create index if not exists attendance_records_org_date_idx on public.attendance_records (organization_id, date);

-- ─────────────────────────────────────────────────────────────────────────
-- csv_imports — audit trail of workforce data uploads
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.csv_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  uploaded_by uuid references auth.users (id) on delete set null,
  file_name text not null,
  row_count int not null default 0,
  status text not null default 'completed' check (status in ('completed', 'failed')),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- reports — saved/generated report snapshots
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  type text not null check (type in ('workforce_summary', 'department_analysis', 'attendance_trend')),
  period_start date,
  period_end date,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reports_organization_id_idx on public.reports (organization_id);

-- ─────────────────────────────────────────────────────────────────────────
-- letters — AI writing-assistant drafts (HR letters)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  employee_id uuid references public.employees (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  document_type text not null check (
    document_type in ('query', 'warning', 'confirmation', 'reference', 'termination', 'offer')
  ),
  tone text not null default 'firm' check (tone in ('firm', 'neutral', 'friendly')),
  prompt text not null,
  content text,
  status text not null default 'draft' check (status in ('draft', 'final')),
  created_at timestamptz not null default now()
);

create index if not exists letters_organization_id_idx on public.letters (organization_id);
