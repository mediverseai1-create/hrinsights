import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      headline="It happens to the best of us."
      subhead="We'll email you a secure link to get back into your account."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
