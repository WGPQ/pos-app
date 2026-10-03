import { prisma } from "@/lib/prisma";
import { getDefaultTenantContext } from "@/lib/default-tenant";
import { requireApiPermission } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const unauthorized = await requireApiPermission("business.settings.view"); if (unauthorized) return unauthorized;
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const settings = await prisma.storeSettings.upsert({ where: { businessId }, update: {}, create: { businessId, taxRate: 0.12 } });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "No se pudo cargar la configuración." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const unauthorized = await requireApiPermission("business.settings.update"); if (unauthorized) return unauthorized;
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const { taxRate } = await request.json(); const value = Number(taxRate);
    if (!Number.isFinite(value) || value < 0 || value > 1) return NextResponse.json({ error: "La tarifa de IVA debe estar entre 0 y 1." }, { status: 400 });
    const settings = await prisma.storeSettings.upsert({ where: { businessId }, update: { taxRate: value }, create: { businessId, taxRate: value } });
    await writeAuditLog(prisma, { businessId, actorUserId: userId, actorMembershipId: membershipId, action: "business.settings.update", entityType: "StoreSettings", entityId: settings.id, metadata: { changedFields: ["taxRate"] } });
    return NextResponse.json(settings);
  } catch { return NextResponse.json({ error: "No se pudo actualizar el IVA." }, { status: 500 }); }
}
