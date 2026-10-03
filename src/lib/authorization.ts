import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth";
import { getTenantContext, TenantContext, TenantContextError } from "@/lib/tenant-context";
import { prisma } from "@/lib/prisma";

export class PermissionDeniedError extends Error {
  constructor(readonly permission: string) {
    super(`Missing permission: ${permission}`);
  }
}

export type AuthorizationContext = TenantContext & { permissions: Set<string> };

export async function getAuthorizationContext(): Promise<AuthorizationContext> {
  const tenant = await getTenantContext();
  const membership = await prisma.businessMembership.findUnique({
    where: { id: tenant.membershipId },
    select: { role: { select: { permissions: { select: { permission: { select: { key: true } } } } } } },
  });
  const permissions = new Set(membership?.role.permissions.map(({ permission: item }) => item.key) ?? []);
  return { ...tenant, permissions };
}

export async function requirePermission(permission: string): Promise<AuthorizationContext> {
  const context = await getAuthorizationContext();
  const { permissions } = context;
  if (!permissions.has(permission)) throw new PermissionDeniedError(permission);
  return context;
}

export async function hasPermission(permission: string): Promise<boolean> {
  try {
    await requirePermission(permission);
    return true;
  } catch {
    return false;
  }
}

export async function requireApiPermission(permission: string): Promise<NextResponse | null> {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    await requirePermission(permission);
    return null;
  } catch (error) {
    if (error instanceof PermissionDeniedError || error instanceof TenantContextError) {
      return NextResponse.json({ error: "No tienes permiso para realizar esta acción." }, { status: 403 });
    }
    return NextResponse.json({ error: "No se pudo validar la autorización." }, { status: 500 });
  }
}
