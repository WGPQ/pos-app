import { requirePageTenantContext } from "@/lib/tenant-context";
import AdminShell from "@/layout/AdminShell";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const context = await requirePageTenantContext();
  const business = await prisma.business.findUniqueOrThrow({
    where: { id: context.businessId },
    select: { name: true },
  });
  return { title: { default: `${business.name} | Inicio`, template: `${business.name} | %s` } };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await requirePageTenantContext();
  const membership = await prisma.businessMembership.findUniqueOrThrow({
    where: { id: context.membershipId },
    select: { role: { select: { name: true } } },
  });
  const business = await prisma.business.findUniqueOrThrow({ where: { id: context.businessId }, select: { name: true, logoUrl: true } });
  return <AdminShell business={business} userName={context.userName} roleName={membership.role.name}>{children}</AdminShell>;
}
