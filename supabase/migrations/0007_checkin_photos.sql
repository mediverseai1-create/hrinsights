-- Lets the check-in kiosk attach a photo to each arrival, and makes the
-- attendance table double as a real, functional check-in log (photo + name
-- + automatic arrival time).

alter table public.attendance_records
  add column if not exists photo_url text;

-- Dedicated public bucket for check-in photos. Public so admin dashboards
-- can render the photo directly from its URL without a signed-request roundtrip.
insert into storage.buckets (id, name, public)
values ('checkin-photos', 'checkin-photos', true)
on conflict (id) do nothing;

drop policy if exists "checkin-photos: anyone can upload" on storage.objects;
create policy "checkin-photos: anyone can upload"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'checkin-photos');

drop policy if exists "checkin-photos: public can view" on storage.objects;
create policy "checkin-photos: public can view"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'checkin-photos');

-- Replace record_check_in to accept an optional photo URL captured at the
-- kiosk. Old 2-arg calls still work because the third parameter defaults to null.
drop function if exists public.record_check_in(text, uuid);

create or replace function public.record_check_in(org_slug text, p_employee_id uuid, p_photo_url text default null)
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

  insert into public.attendance_records (organization_id, employee_id, date, check_in, status, photo_url)
  values (v_org_id, p_employee_id, current_date, v_now, v_status, p_photo_url)
  on conflict (employee_id, date)
  do update set check_in = excluded.check_in, status = excluded.status, photo_url = excluded.photo_url
  where public.attendance_records.check_in is null;

  return query
    select a.status, a.check_in
    from public.attendance_records a
    where a.employee_id = p_employee_id and a.date = current_date;
end;
$$;

grant execute on function public.record_check_in(text, uuid, text) to anon;
