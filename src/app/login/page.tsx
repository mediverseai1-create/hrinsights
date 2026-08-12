import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthShell
      headline="Attendance, recorded to the minute."
      subhead="See who's in, who's late, and what needs your attention — the moment you log in."
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
