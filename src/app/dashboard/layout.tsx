import { requireCurrentOrg } from "@/lib/data/org";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { fullName, email, organization } = await requireCurrentOrg();

  return (
    <div className="flex min-h-screen bg-cream-100">
      <Sidebar fullName={fullName} email={email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          organizationName={organization.name}
          plan={organization.plan}
          fullName={fullName}
          email={email}
        />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
