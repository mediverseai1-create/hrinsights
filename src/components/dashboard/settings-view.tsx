"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";
import { updateProfile, updateOrganization } from "@/app/dashboard/settings/actions";
import { signOut } from "@/app/auth/actions";
import { INDUSTRIES, ORG_SIZES, CURRENCIES, PLANS, type PlanId } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Select, Label, FieldError } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({ fullName: z.string().min(2, "Enter your full name") });
type ProfileInput = z.infer<typeof profileSchema>;

export function SettingsView({
  fullName,
  email,
  organization,
  role,
}: {
  fullName: string | null;
  email: string | null;
  organization: OnboardingInput & { plan: PlanId };
  role: string;
}) {
  const [profileSaved, setProfileSaved] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);
  const canEditOrg = role === "owner" || role === "admin";

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: fullName ?? "" },
  });

  const orgForm = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: organization,
  });

  async function onProfileSubmit(values: ProfileInput) {
    setProfileError(null);
    setProfileSaved(false);
    const result = await updateProfile(values);
    if (result?.error) {
      setProfileError(result.error);
      return;
    }
    setProfileSaved(true);
  }

  async function onOrgSubmit(values: OnboardingInput) {
    setOrgError(null);
    setOrgSaved(false);
    const result = await updateOrganization(values);
    if (result?.error) {
      setOrgError(result.error);
      return;
    }
    setOrgSaved(true);
  }

  const plan = PLANS[organization.plan];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your profile, organization, and plan.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>{email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="max-w-sm space-y-3">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...profileForm.register("fullName")} />
              <FieldError>{profileForm.formState.errors.fullName?.message}</FieldError>
            </div>
            {profileError && <p className="text-sm text-danger-600">{profileError}</p>}
            {profileSaved && <p className="text-sm text-success-600">Saved.</p>}
            <Button type="submit" size="sm" disabled={profileForm.formState.isSubmitting}>
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>
            {canEditOrg ? "Visible to everyone on your team." : "Only owners and admins can edit this."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={orgForm.handleSubmit(onOrgSubmit)} className="max-w-md space-y-3">
            <div>
              <Label htmlFor="organizationName">Organization name</Label>
              <Input id="organizationName" disabled={!canEditOrg} {...orgForm.register("organizationName")} />
              <FieldError>{orgForm.formState.errors.organizationName?.message}</FieldError>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select id="industry" disabled={!canEditOrg} {...orgForm.register("industry")}>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="size">Size</Label>
                <Select id="size" disabled={!canEditOrg} {...orgForm.register("size")}>
                  {ORG_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s} employees
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" disabled={!canEditOrg} {...orgForm.register("country")} />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select id="currency" disabled={!canEditOrg} {...orgForm.register("currency")}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {orgError && <p className="text-sm text-danger-600">{orgError}</p>}
            {orgSaved && <p className="text-sm text-success-600">Saved.</p>}
            {canEditOrg && (
              <Button type="submit" size="sm" disabled={orgForm.formState.isSubmitting}>
                Save
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan &amp; billing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-cream-50 p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink-900">{plan.name}</p>
                <Badge tone="brand">{plan.priceLabel}/mo</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-500">{plan.tagline}</p>
            </div>
            <ButtonLink href="/pricing" variant="outline">
              {organization.plan === "pro" ? "Manage plan" : "Upgrade"}
            </ButtonLink>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium text-ink-900">Sign out</p>
            <p className="text-xs text-ink-400">You&apos;ll need to sign in again to access your dashboard.</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
