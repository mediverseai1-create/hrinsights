"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";
import { completeOnboarding } from "@/app/onboarding/actions";
import { INDUSTRIES, ORG_SIZES, CURRENCIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, FieldError } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function OnboardingForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { currency: "USD" },
  });

  async function onSubmit(values: OnboardingInput) {
    setServerError(null);
    const result = await completeOnboarding(values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="p-8">
        <h1 className="text-xl font-semibold text-ink-900">Tell us about your organization</h1>
        <p className="mt-1 text-sm text-ink-500">
          This sets up your workspace. You can change these details later in Settings.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="organizationName">Organization name</Label>
            <Input id="organizationName" placeholder="Incomio Limited" {...register("organizationName")} />
            <FieldError>{errors.organizationName?.message}</FieldError>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select id="industry" {...register("industry")} defaultValue="">
                <option value="" disabled>
                  Select industry
                </option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </Select>
              <FieldError>{errors.industry?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="size">Organization size</Label>
              <Select id="size" {...register("size")} defaultValue="">
                <option value="" disabled>
                  Select size
                </option>
                {ORG_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} employees
                  </option>
                ))}
              </Select>
              <FieldError>{errors.size?.message}</FieldError>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="Nigeria" {...register("country")} />
              <FieldError>{errors.country?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select id="currency" {...register("currency")}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <FieldError>{errors.currency?.message}</FieldError>
            </div>
          </div>

          {serverError && <p className="text-sm text-danger-600">{serverError}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Setting up…" : "Continue to dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
