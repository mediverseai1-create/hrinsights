-- Bug fix: the check-in kiosk RPCs were only granted to the `anon` role, so
-- the kiosk silently 404'd (or errored) whenever it was opened in a browser
-- that happened to already have a logged-in session (which runs queries as
-- `authenticated`, not `anon`). These RPCs already validate everything they
-- need internally (org slug, employee membership) — they don't rely on the
-- caller's role for security — so it's safe to grant execute to both roles.

grant execute on function public.get_checkin_roster(text) to authenticated;
grant execute on function public.record_check_in(text, uuid, text) to authenticated;
grant execute on function public.record_check_out(text, uuid) to authenticated;
grant execute on function public.get_org_public_name(text) to authenticated;
