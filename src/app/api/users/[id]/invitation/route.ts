import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizationContext, requireApiPermission } from "@/lib/authorization";
import { deliverUserInvitation } from "@/lib/user-invitation";
import { recoveryMailConfig } from "@/lib/password-recovery";
import { UserManagementError, userManagementResponse } from "@/lib/user-management";
import { isLoginRateLimited, loginRateLimitKey, recordFailedLogin } from "@/lib/login-rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireApiPermission("user.manage"); if (denied) return denied;
  try {
    const context = await getAuthorizationContext();
    const id = Number((await params).id);
    if (!Number.isSafeInteger(id) || id <= 0) throw new UserManagementError("Usuario inválido.");
    const key = `invite:${context.membershipId}:${loginRateLimitKey(request, "")}`;
    const retryAfter = isLoginRateLimited(key);
    if (retryAfter) return NextResponse.json({ error: "Demasiadas invitaciones. Intenta más tarde." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    recordFailedLogin(key);
    recoveryMailConfig();
    const member = await prisma.businessMembership.findFirst({ where: { id, businessId: context.businessId, status: "ACTIVE", user: { status: "ACTIVE" } }, include: { user: { select: { id: true, email: true } }, business: { select: { name: true } }, role: { include: { permissions: { include: { permission: true } } } } } });
    if (!member) throw new UserManagementError("No se encontró un usuario activo en este negocio.", 404);
    if (member.role.permissions.some(p => !context.permissions.has(p.permission.key))) throw new UserManagementError("No puedes invitar usuarios con permisos superiores a los tuyos.", 403);
    const invitationSent = await deliverUserInvitation(member.user, member.business.name);
    return NextResponse.json({ invitationSent, message: invitationSent ? "Invitación aceptada por el servicio de correo." : "No se pudo enviar la invitación. Intenta nuevamente más tarde." }, { status: invitationSent ? 200 : 503 });
  } catch (error) { return userManagementResponse(error); }
}
