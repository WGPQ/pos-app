import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizationContext, requireApiPermission } from "@/lib/authorization";
import { membershipSelect, parseUserInput, UserManagementError, userManagementResponse, userTransactionOptions, validateUserAccess } from "@/lib/user-management";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireApiPermission("user.manage"); if (denied) return denied;
  try {
    const context = await getAuthorizationContext();
    const id = Number((await params).id);
    if (!Number.isSafeInteger(id) || id <= 0) throw new UserManagementError("Usuario inválido.");
    const input = parseUserInput(await request.json());
    const result = await prisma.$transaction(async tx => {
      const allowed = await validateUserAccess(tx, context, input);
      const target = await tx.businessMembership.findFirst({ where: { id, businessId: context.businessId }, include: { user: true, branches: true, role: { include: { permissions: { include: { permission: true } } } } } });
      if (!target) throw new UserManagementError("Usuario no encontrado.", 404);
      if (target.role.permissions.some(p => !allowed.has(p.permission.key))) throw new UserManagementError("No puedes modificar usuarios con permisos superiores a los tuyos.", 403);
      if (target.userId === context.userId && (input.status !== "ACTIVE" || input.roleId !== target.roleId || !input.branchIds.includes(context.branchId))) throw new UserManagementError("No puedes desactivar tu acceso, cambiar tu propio rol ni quitar tu sucursal actual.");
      const profileChanged = input.name !== target.user.name || input.email !== target.user.email;
      if (profileChanged) {
        const otherMemberships = await tx.businessMembership.count({ where: { userId: target.userId, businessId: { not: context.businessId } } });
        if (otherMemberships) throw new UserManagementError("Esta cuenta participa en otros negocios. Solo puedes modificar su rol, estado y sucursales aquí.");
        await tx.user.update({ where: { id: target.userId }, data: { name: input.name, email: input.email } });
        if (input.email !== target.user.email) {
          await tx.passwordResetToken.updateMany({ where: { userId: target.userId, usedAt: null }, data: { usedAt: new Date() } });
        }
      }
      await tx.membershipBranch.deleteMany({ where: { membershipId: id } });
      const membership = await tx.businessMembership.update({ where: { id }, data: { roleId: input.roleId, status: input.status, branches: { create: input.branchIds.map(branchId => ({ branchId })) } }, select: membershipSelect });
      await tx.session.updateMany({ where: { userId: target.userId, activeBusinessId: context.businessId, revokedAt: null, ...(target.userId === context.userId ? { id: { not: context.sessionId } } : {}) }, data: { revokedAt: new Date() } });
      await writeAuditLog(tx, { businessId: context.businessId, actorUserId: context.userId, actorMembershipId: context.membershipId, action: "user.update", entityType: "BusinessMembership", entityId: id, metadata: { roleId: input.roleId, branchIds: input.branchIds, status: input.status } });
      return membership;
    }, userTransactionOptions);
    return NextResponse.json(result);
  } catch (error) { return userManagementResponse(error); }
}
