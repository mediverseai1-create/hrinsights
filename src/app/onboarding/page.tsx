import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/brand/logo";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata: Metadata = { title: "Set up your organization" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cream-100 px-6 py-12">
      <div className="mx-auto mb-10 w-full max-w-lg">
        <Logo />
      </div>
      <OnboardingForm />
    </div>
  );
}
