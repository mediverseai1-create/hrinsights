import type { Metadata } from "next";
import { requireCurrentOrg } from "@/lib/data/org";
import { SettingsView } from "@/components/dashboard/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { fullName, email, organization, role } = await requireCurrentOrg();

  return (
    <SettingsView
      fullName={fullName}
      email={email}
      organization={{
        organizationName: organization.name,
        industry: organization.industry ?? "",
        size: organization.size ?? "",
        country: organization.country ?? "",
        currency: organization.currency,
        plan: organization.plan,
      }}
      role={role}
    />
  );
}
