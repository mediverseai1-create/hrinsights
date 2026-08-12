"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export function SignUpForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(values: SignUpInput) {
    setServerError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    // Email confirmation is required before a session exists.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Check your email</h1>
        <p className="mt-2 text-sm text-ink-500">
          We&apos;ve sent a confirmation link to your inbox. Click it to activate your account and
          start setting up your organization.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-forest-800">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Create your account</h1>
      <p className="mt-1 text-sm text-ink-500">Start understanding your workforce in minutes.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" placeholder="Favour Adeyemi" {...register("fullName")} />
          <FieldError>{errors.fullName?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" {...register("password")} />
          <FieldError>{errors.password?.message}</FieldError>
        </div>

        {serverError && <p className="text-sm text-danger-600">{serverError}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-forest-800">
          Sign in
        </Link>
      </p>
    </div>
  );
}
