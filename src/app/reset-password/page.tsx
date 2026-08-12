import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      headline="Almost there."
      subhead="Choose a new password to finish securing your account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
