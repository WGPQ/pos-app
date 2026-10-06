import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import type { AuthorizationContext } from "@/lib/authorization";

// Allow remote database round trips while retaining a bounded transaction.
export const userTransactionOptions = { maxWait: 10_000, timeout: 30_000 };

export class UserManagementError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function parseUserInput(body: unknown) {
  const b = body as Record<string, unknown> | null;
  const name = typeof b?.name === "string" ? b.name.trim() : "";
  const email = typeof b?.email === "string" ? b.email.trim().toLowerCase() : "";
  const roleId = b?.roleId;
  const branchIds = b?.branchIds;
  const status = b?.status;
  if (!name || name.length > 100) throw new UserManagementError("El nombre es obligatorio y admite hasta 100 caracteres.");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UserManagementError("Ingresa un correo válido.");
  if (typeof roleId !== "number" || !Number.isSafeInteger(roleId) || roleId <= 0) throw new UserManagementError("Selecciona un rol válido.");
  if (!Array.isArray(branchIds) || !branchIds.length || branchIds.some(id => typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0)) throw new UserManagementError("Selecciona al menos una sucursal válida.");
  if (status !== "ACTIVE" && status !== "INACTIVE") throw new UserManagementError("Estado inválido.");
  return { name, email, roleId, branchIds: [...new Set(branchIds)] as number[], status };
}

export const membershipSelect = {
  id: true, status: true,
  user: { select: { id: true, name: true, email: true, status: true } },
  role: { select: { id: true, key: true, name: true } },
  branches: { select: { branch: { select: { id: true, name: true } } } },
} satisfies Prisma.BusinessMembershipSelect;

export async function validateUserAccess(tx: Prisma.TransactionClient, context: AuthorizationContext, input: ReturnType<typeof parseUserInput>) {
  // Serialize membership changes and recheck authority after obtaining the lock.
  await tx.$queryRaw`SELECT "id" FROM "Business" WHERE "id" = ${context.businessId} FOR UPDATE`;
  const actor = await tx.businessMembership.findFirst({ where: {
    id: context.membershipId, businessId: context.businessId, userId: context.userId, status: "ACTIVE",
    user: { status: "ACTIVE" }, branches: { some: { branchId: context.branchId } },
    role: { permissions: { some: { permission: { key: "user.manage" } } } },
  }, select: { role: { select: { permissions: { select: { permission: { select: { key: true } } } } } } } });
  if (!actor) throw new UserManagementError("No tienes permiso para administrar usuarios.", 403);
  const role = await tx.role.findUnique({ where: { id: input.roleId }, include: { permissions: { include: { permission: true } } } });
  const allowed = new Set(actor.role.permissions.map(p => p.permission.key));
  if (!role || role.permissions.some(p => !allowed.has(p.permission.key))) throw new UserManagementError("No puedes asignar un rol con permisos superiores a los tuyos.", 403);
  const branches = await tx.branch.count({ where: { id: { in: input.branchIds }, businessId: context.businessId, status: "ACTIVE" } });
  if (branches !== input.branchIds.length) throw new UserManagementError("Las sucursales deben estar activas y pertenecer al negocio actual.");
  return allowed;
}

export function userManagementResponse(error: unknown) {
  if (error instanceof UserManagementError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "No se pudo crear o actualizar la cuenta con ese correo. Usa otro correo." }, { status: 409 });
  if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2028", "P2024"].includes(error.code)) return NextResponse.json({ error: "La base de datos tardó demasiado en guardar el usuario. Recarga el listado antes de intentar nuevamente." }, { status: 503 });
  if (error instanceof SyntaxError) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  return NextResponse.json({ error: "No fue posible completar la operación de usuarios." }, { status: 500 });
}
