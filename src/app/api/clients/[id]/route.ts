import { prisma } from "@/lib/prisma";
import { getDefaultTenantContext } from "@/lib/default-tenant";
import { requireApiPermission } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireApiPermission("customer.view"); if (unauthorized) return unauthorized;
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const { id } = await params;
    const client = await prisma.client.findFirst({
      where: { id: Number(id), businessId },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json(
      { error: "Error obteniendo cliente" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireApiPermission("customer.update"); if (unauthorized) return unauthorized;
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const { id } = await params;
    const body = await req.json();
    const existing = await prisma.client.findFirst({ where: { id: Number(id), businessId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    const client = await prisma.client.update({
      where: { id: existing.id },
      data: {
        ci: body.ci,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
      },
    });
    await writeAuditLog(prisma, { businessId, actorUserId: userId, actorMembershipId: membershipId, action: "customer.update", entityType: "Client", entityId: client.id, metadata: { changedFields: Object.keys(body).filter((key) => key !== "businessId") } });

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json(
      { error: "Error actualizando cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireApiPermission("customer.delete"); if (unauthorized) return unauthorized;
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const { id } = await params;
    const deleted = await prisma.client.deleteMany({
      where: { id: Number(id), businessId },
    });
    if (deleted.count === 0) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    await writeAuditLog(prisma, { businessId, actorUserId: userId, actorMembershipId: membershipId, action: "customer.delete", entityType: "Client", entityId: id });

    return NextResponse.json({ message: "Cliente eliminado" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error eliminando cliente" },
      { status: 500 }
    );
  }
}
