-- HRInsights — idempotent RLS repair.
-- Safe to run any number of times: drops each policy first (if it exists),
-- then recreates it. Use this if onboarding/employee/attendance actions are
-- failing with "new row violates row-level security policy".

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
drop policy if exists "profiles: read own row" on public.profiles;
create policy "profiles: read own row" on public.profiles for select using (id = auth.uid());
drop policy if exists "profiles: update own row" on public.profiles;
create policy "profiles: update own row" on public.profiles for update using (id = auth.uid());

alter table public.organizations enable row level security;
drop policy if exists "organizations: members can read" on public.organizations;
create policy "organizations: members can read" on public.organizations
  for select using (public.is_org_member(id));
drop policy if exists "organizations: authenticated users can create" on public.organizations;
create policy "organizations: authenticated users can create" on public.organizations
  for insert with check (auth.uid() is not null);
drop policy if exists "organizations: owners/admins can update" on public.organizations;
create policy "organizations: owners/admins can update" on public.organizations
  for update using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organizations.id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

alter table public.organization_members enable row level security;
drop policy if exists "members: read own organization roster" on public.organization_members;
create policy "members: read own organization roster" on public.organization_members
  for select using (public.is_org_member(organization_id));
drop policy if exists "members: user can add self" on public.organization_members;
create policy "members: user can add self" on public.organization_members
  for insert with check (user_id = auth.uid());
drop policy if exists "members: owners/admins manage roster" on public.organization_members;
create policy "members: owners/admins manage roster" on public.organization_members
  for delete using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organization_members.organization_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

alter table public.departments enable row level security;
drop policy if exists "departments: members read" on public.departments;
create policy "departments: members read" on public.departments for select using (public.is_org_member(organization_id));
drop policy if exists "departments: members write" on public.departments;
create policy "departments: members write" on public.departments for insert with check (public.is_org_member(organization_id));
drop policy if exists "departments: members update" on public.departments;
create policy "departments: members update" on public.departments for update using (public.is_org_member(organization_id));
drop policy if exists "departments: members delete" on public.departments;
create policy "departments: members delete" on public.departments for delete using (public.is_org_member(organization_id));

alter table public.employees enable row level security;
drop policy if exists "employees: members read" on public.employees;
create policy "employees: members read" on public.employees for select using (public.is_org_member(organization_id));
drop policy if exists "employees: members write" on public.employees;
create policy "employees: members write" on public.employees for insert with check (public.is_org_member(organization_id));
drop policy if exists "employees: members update" on public.employees;
create policy "employees: members update" on public.employees for update using (public.is_org_member(organization_id));
drop policy if exists "employees: members delete" on public.employees;
create policy "employees: members delete" on public.employees for delete using (public.is_org_member(organization_id));

alter table public.attendance_records enable row level security;
drop policy if exists "attendance: members read" on public.attendance_records;
create policy "attendance: members read" on public.attendance_records for select using (public.is_org_member(organization_id));
drop policy if exists "attendance: members write" on public.attendance_records;
create policy "attendance: members write" on public.attendance_records for insert with check (public.is_org_member(organization_id));
drop policy if exists "attendance: members update" on public.attendance_records;
create policy "attendance: members update" on public.attendance_records for update using (public.is_org_member(organization_id));
drop policy if exists "attendance: members delete" on public.attendance_records;
create policy "attendance: members delete" on public.attendance_records for delete using (public.is_org_member(organization_id));

alter table public.csv_imports enable row level security;
drop policy if exists "csv_imports: members read" on public.csv_imports;
create policy "csv_imports: members read" on public.csv_imports for select using (public.is_org_member(organization_id));
drop policy if exists "csv_imports: members write" on public.csv_imports;
create policy "csv_imports: members write" on public.csv_imports for insert with check (public.is_org_member(organization_id));

alter table public.reports enable row level security;
drop policy if exists "reports: members read" on public.reports;
create policy "reports: members read" on public.reports for select using (public.is_org_member(organization_id));
drop policy if exists "reports: members write" on public.reports;
create policy "reports: members write" on public.reports for insert with check (public.is_org_member(organization_id));
drop policy if exists "reports: members delete" on public.reports;
create policy "reports: members delete" on public.reports for delete using (public.is_org_member(organization_id));

alter table public.letters enable row level security;
drop policy if exists "letters: members read" on public.letters;
create policy "letters: members read" on public.letters for select using (public.is_org_member(organization_id));
drop policy if exists "letters: members write" on public.letters;
create policy "letters: members write" on public.letters for insert with check (public.is_org_member(organization_id));
drop policy if exists "letters: members update" on public.letters;
create policy "letters: members update" on public.letters for update using (public.is_org_member(organization_id));
drop policy if exists "letters: members delete" on public.letters;
create policy "letters: members delete" on public.letters for delete using (public.is_org_member(organization_id));
