import * as argon2 from "argon2";
import { randomBytes } from "crypto";
import { recoveryMailConfig } from "@/lib/password-recovery";
import { deliverUserInvitation } from "@/lib/user-invitation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizationContext, requireApiPermission } from "@/lib/authorization";
import { membershipSelect, parseUserInput, userManagementResponse, userTransactionOptions, validateUserAccess } from "@/lib/user-management";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const denied = await requireApiPermission("user.view"); if (denied) return denied;
  try {
    const context = await getAuthorizationContext();
    const [users, roles, branches] = await Promise.all([
      prisma.businessMembership.findMany({ where: { businessId: context.businessId }, select: membershipSelect, orderBy: { createdAt: "desc" } }),
      prisma.role.findMany({ include: { permissions: { include: { permission: true } } }, orderBy: { name: "asc" } }),
      prisma.branch.findMany({ where: { businessId: context.businessId, status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]);
    return NextResponse.json({ users, branches, currentUserId: context.userId, roles: roles.filter(r => r.permissions.every(p => context.permissions.has(p.permission.key))).map(({ id, name, key }) => ({ id, name, key })) });
  } catch (error) { return userManagementResponse(error); }
}

export async function POST(request: Request) {
  const denied = await requireApiPermission("user.manage"); if (denied) return denied;
  try {
    const context = await getAuthorizationContext();
    const input = parseUserInput(await request.json());
    recoveryMailConfig();
    const business = await prisma.business.findUniqueOrThrow({ where: { id: context.businessId }, select: { name: true } });
    // A random, undisclosed password prevents login until the recipient sets one.
    const passwordHash = await argon2.hash(randomBytes(32).toString("base64url"), { type: argon2.argon2id });
    const result = await prisma.$transaction(async tx => {
      await validateUserAccess(tx, context, input);
      const user = await tx.user.create({ data: { name: input.name, email: input.email, passwordHash } });
      const membership = await tx.businessMembership.create({ data: { userId: user.id, businessId: context.businessId, roleId: input.roleId, status: input.status, branches: { create: input.branchIds.map(branchId => ({ branchId })) } }, select: membershipSelect });
      await writeAuditLog(tx, { businessId: context.businessId, actorUserId: context.userId, actorMembershipId: context.membershipId, action: "user.create", entityType: "BusinessMembership", entityId: membership.id, metadata: { roleId: input.roleId, branchIds: input.branchIds, status: input.status } });
      return membership;
    }, userTransactionOptions);
    const invitationSent = input.status === "ACTIVE" && await deliverUserInvitation(result.user, business.name);
    return NextResponse.json({ ...result, invitationSent }, { status: 201 });
  } catch (error) { return userManagementResponse(error); }
}
