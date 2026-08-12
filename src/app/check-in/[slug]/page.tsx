import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CheckInKiosk } from "@/components/checkin/checkin-kiosk";

export const metadata: Metadata = { title: "Staff check-in" };

export default async function CheckInPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: orgName, error } = await supabase.rpc("get_org_public_name", { org_slug: slug });

  if (error) {
    throw new Error(`Couldn't load the check-in page: ${error.message}`);
  }
  if (!orgName) notFound();

  return <CheckInKiosk orgSlug={slug} orgName={orgName} />;
}
