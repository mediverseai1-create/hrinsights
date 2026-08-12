-- HRInsights — public staff check-in kiosk support
--
-- The check-in link (/check-in/[org-slug]) is shared with staff and opened
-- without signing in, so it cannot rely on the normal member-only RLS
-- policies. Instead of relaxing RLS on employees/attendance_records, we
-- expose two narrow, security-definer RPCs that reveal only what the kiosk
-- needs (an employee's id and name) and only ever write an attendance row
-- for the employee that was picked, scoped to their own organization.

create or replace function public.get_checkin_roster(org_slug text)
returns table (employee_id uuid, full_name text)
language sql
security definer
stable
set search_path = public
as $$
  select e.id, e.full_name
  from public.employees e
  join public.organizations o on o.id = e.organization_id
  where o.slug = org_slug
    and e.status = 'active'
  order by e.full_name;
$$;

create or replace function public.record_check_in(org_slug text, p_employee_id uuid)
returns table (status text, check_in timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_shift_start time;
  v_status text;
  v_now timestamptz := now();
begin
  select o.id into v_org_id
  from public.organizations o
  where o.slug = org_slug;

  if v_org_id is null then
    raise exception 'Unknown organization';
  end if;

  select e.shift_start into v_shift_start
  from public.employees e
  where e.id = p_employee_id
    and e.organization_id = v_org_id
    and e.status = 'active';

  if v_shift_start is null then
    raise exception 'Employee not found for this organization';
  end if;

  v_status := case when v_now::time > (v_shift_start + interval '5 minutes') then 'late' else 'present' end;

  insert into public.attendance_records (organization_id, employee_id, date, check_in, status)
  values (v_org_id, p_employee_id, current_date, v_now, v_status)
  on conflict (employee_id, date)
  do update set check_in = excluded.check_in, status = excluded.status
  where public.attendance_records.check_in is null;

  return query
    select a.status, a.check_in
    from public.attendance_records a
    where a.employee_id = p_employee_id and a.date = current_date;
end;
$$;

create or replace function public.record_check_out(org_slug text, p_employee_id uuid)
returns table (check_out timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  select o.id into v_org_id from public.organizations o where o.slug = org_slug;
  if v_org_id is null then
    raise exception 'Unknown organization';
  end if;

  update public.attendance_records a
  set check_out = now()
  where a.employee_id = p_employee_id
    and a.organization_id = v_org_id
    and a.date = current_date
    and a.check_in is not null;

  return query
    select a.check_out
    from public.attendance_records a
    where a.employee_id = p_employee_id and a.date = current_date;
end;
$$;

-- Allow the anonymous (unauthenticated) role to call the three RPCs above —
-- table-level RLS is untouched, so this grants no direct table access.
grant execute on function public.get_checkin_roster(text) to anon;
grant execute on function public.record_check_in(text, uuid) to anon;
grant execute on function public.record_check_out(text, uuid) to anon;
