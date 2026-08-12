import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <AuthShell
      headline="Workforce data your whole team can trust."
      subhead="Set up your organization, add your team, and get a clear read on attendance and trends."
    >
      <SignUpForm />
    </AuthShell>
  );
}
