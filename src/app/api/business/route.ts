import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizationContext, requireApiPermission } from "@/lib/authorization";
import { parseBusinessProfile } from "@/lib/business-profile";
import { writeAuditLog } from "@/lib/audit";

const select = { id: true, name: true, logoUrl: true, currency: true, timezone: true, slug: true, catalogEnabled: true };

export async function GET() {
  const denied = await requireApiPermission("business.settings.view"); if (denied) return denied;
  try {
    const context = await getAuthorizationContext();
    return NextResponse.json(await prisma.business.findUniqueOrThrow({ where: { id: context.businessId }, select }));
  } catch { return NextResponse.json({ error: "No se pudo cargar el negocio." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  const denied = await requireApiPermission("business.settings.update"); if (denied) return denied;
  try {
    const context = await getAuthorizationContext();
    let input;
    try { input = parseBusinessProfile(await request.json(), process.env.CLOUDINARY_CLOUD_NAME, context.businessId); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos." }, { status: 400 }); }
    const business = await prisma.$transaction(async tx => {
      const result = await tx.business.update({ where: { id: context.businessId }, data: input, select });
      await writeAuditLog(tx, { businessId: context.businessId, actorUserId: context.userId, actorMembershipId: context.membershipId, action: "business.profile.update", entityType: "Business", entityId: context.businessId, metadata: { changedFields: Object.keys(input) } });
      return result;
    }, { maxWait: 10_000, timeout: 30_000 });
    return NextResponse.json(business);
  } catch { return NextResponse.json({ error: "No se pudo guardar la información del negocio." }, { status: 500 }); }
}
