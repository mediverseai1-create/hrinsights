-- Lets the unauthenticated check-in kiosk page show the organization's name
-- without granting anon SELECT on the organizations table itself.

create or replace function public.get_org_public_name(org_slug text)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select o.name from public.organizations o where o.slug = org_slug;
$$;

grant execute on function public.get_org_public_name(text) to anon;
