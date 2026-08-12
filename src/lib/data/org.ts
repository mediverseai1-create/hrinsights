import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database, MemberRole } from "@/lib/types/database";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export interface CurrentOrgContext {
  userId: string;
  fullName: string | null;
  email: string | null;
  organization: Organization;
  role: MemberRole;
}

/**
 * Loads the signed-in user's organization for dashboard pages. Redirects to
 * /login if unauthenticated (middleware normally catches this first) and to
 * /onboarding if the user hasn't created/joined an organization yet.
 *
 * Wrapped in React's `cache()` so every server component rendered for a
 * single request (layout + page + nested pages) shares one query instead of
 * re-fetching the organization on every level of the tree.
 */
export const requireCurrentOrg = cache(async (): Promise<CurrentOrgContext> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role, organizations(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership || !membership.organizations) {
    redirect("/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    fullName: profile?.full_name ?? null,
    email: profile?.email ?? user.email ?? null,
    organization: membership.organizations as unknown as Organization,
    role: membership.role,
  };
});
