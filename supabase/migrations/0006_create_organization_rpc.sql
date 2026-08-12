-- HRInsights — atomic organization creation.
--
-- Onboarding previously did 3 separate inserts (organizations,
-- organization_members, departments) from the client. If any step after the
-- first failed (network blip, etc.), it left an orphaned organizations row
-- with no owner — and since the slug was deterministic, retries collided
-- with it and could never succeed. Wrapping all three inserts in one
-- SECURITY DEFINER function makes them atomic: either the whole workspace
-- is created, or none of it is.

create or replace function public.create_organization_with_owner(
  p_name text,
  p_slug text,
  p_industry text,
  p_size text,
  p_country text,
  p_currency text,
  p_departments text[]
)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org public.organizations;
  v_department text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.organizations (name, slug, industry, size, country, currency)
  values (p_name, p_slug, p_industry, p_size, p_country, p_currency)
  returning * into v_org;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_org.id, auth.uid(), 'owner');

  foreach v_department in array p_departments loop
    insert into public.departments (organization_id, name) values (v_org.id, v_department);
  end loop;

  return v_org;
end;
$$;

grant execute on function public.create_organization_with_owner(text, text, text, text, text, text, text[]) to authenticated;

-- One-time cleanup: remove any orphaned organization rows left behind by the
-- old multi-step onboarding flow (an org with zero members can never be
-- accessed by anyone, so it's definitely leftover junk, not real data).
delete from public.organizations o
where not exists (
  select 1 from public.organization_members m where m.organization_id = o.id
);
