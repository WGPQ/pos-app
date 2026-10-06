import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export class TenantContextError extends Error {
  constructor() {
    super("No active business membership or branch is available for this session.");
  }
}

export type TenantContext = {
  userId: number;
  userName: string;
  sessionId: string;
  membershipId: number;
  businessId: number;
  branchId: number;
};

export async function getTenantContext(): Promise<TenantContext> {
  const auth = await getAuthContext();
  if (!auth) throw new TenantContextError();

  const session = await prisma.session.findUnique({
    where: { id: auth.sessionId },
    select: { activeBusinessId: true, activeBranchId: true },
  });
  if (!session?.activeBusinessId || !session.activeBranchId) throw new TenantContextError();

  const membership = await prisma.businessMembership.findFirst({
    where: {
      userId: auth.user.id,
      businessId: session.activeBusinessId,
      status: "ACTIVE",
      business: { status: "ACTIVE" },
      branches: {
        some: {
          branchId: session.activeBranchId,
          branch: { businessId: session.activeBusinessId, status: "ACTIVE" },
        },
      },
    },
    select: { id: true },
  });
  if (!membership) throw new TenantContextError();

  return {
    userId: auth.user.id,
    userName: auth.user.name,
    sessionId: auth.sessionId,
    membershipId: membership.id,
    businessId: session.activeBusinessId,
    branchId: session.activeBranchId,
  };
}

export async function requirePageTenantContext(): Promise<TenantContext> {
  try {
    return await getTenantContext();
  } catch {
    redirect("/auth/login?error=access");
  }
}

export async function setActiveTenantContext(input: { userId: number; sessionId: string; businessId: number; branchId: number }) {
  const membership = await prisma.businessMembership.findFirst({
    where: {
      userId: input.userId,
      businessId: input.businessId,
      status: "ACTIVE",
      business: { status: "ACTIVE" },
      branches: { some: { branchId: input.branchId, branch: { businessId: input.businessId, status: "ACTIVE" } } },
    },
    select: { id: true },
  });
  if (!membership) throw new TenantContextError();

  await prisma.session.update({
    where: { id: input.sessionId },
    data: { activeBusinessId: input.businessId, activeBranchId: input.branchId },
  });
  return getTenantContext();
}
