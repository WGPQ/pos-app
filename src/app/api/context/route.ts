import { NextResponse } from "next/server";
import { getAuthContext, requireApiAuth } from "@/lib/auth";
import { getTenantContext, setActiveTenantContext, TenantContextError } from "@/lib/tenant-context";
import { getAuthorizationContext } from "@/lib/authorization";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const context = await getAuthorizationContext();
    return NextResponse.json({ ...context, permissions: [...context.permissions] });
  } catch {
    return NextResponse.json({ error: "No hay un negocio o sucursal activa autorizada." }, { status: 403 });
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    const body = await request.json();
    const businessId = Number(body.businessId);
    const branchId = Number(body.branchId);
    if (!Number.isInteger(businessId) || businessId <= 0 || !Number.isInteger(branchId) || branchId <= 0) {
      return NextResponse.json({ error: "Negocio o sucursal inválidos." }, { status: 400 });
    }
    await setActiveTenantContext({ userId: auth.user.id, sessionId: auth.sessionId, businessId, branchId });
    const context = await getAuthorizationContext();
    return NextResponse.json({ ...context, permissions: [...context.permissions] });
  } catch (error) {
    if (error instanceof TenantContextError) return NextResponse.json({ error: "No tienes acceso a ese negocio o sucursal." }, { status: 403 });
    return NextResponse.json({ error: "No se pudo cambiar el contexto." }, { status: 500 });
  }
}
