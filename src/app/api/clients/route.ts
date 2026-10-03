import { prisma } from "@/lib/prisma";
import { getDefaultTenantContext } from "@/lib/default-tenant";
import { requireApiPermission } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const unauthorized = await requireApiPermission("customer.view"); if (unauthorized) return unauthorized;
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const clients = await prisma.client.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json(
      { error: "Error obteniendo clientes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const unauthorized = await requireApiPermission("customer.create"); if (unauthorized) return unauthorized;
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const body = await req.json();

    const client = await prisma.client.create({
      data: {
        businessId,
        ci: body.ci,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
      },
    });
    await writeAuditLog(prisma, { businessId, actorUserId: userId, actorMembershipId: membershipId, action: "customer.create", entityType: "Client", entityId: client.id });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Error creando cliente" },
      { status: 500 }
    );
  }
}
