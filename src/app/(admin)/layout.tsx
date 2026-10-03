import { requirePageTenantContext } from "@/lib/tenant-context";
import AdminShell from "@/layout/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageTenantContext();
  return <AdminShell>{children}</AdminShell>;
}
