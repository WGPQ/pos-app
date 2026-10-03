import { prisma } from "@/lib/prisma";
import { getDefaultTenantContext } from "@/lib/default-tenant";
import { hasPermission, requireApiPermission } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

// GET /api/products/:id
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireApiPermission("product.view"); if (unauthorized) return unauthorized;
    const canViewCost = await hasPermission("product.cost.view");
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id: Number(id), businessId },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(canViewCost ? product : { ...product, cost: null });
  } catch (error) {
    return NextResponse.json({ error: "Error obteniendo producto" }, { status: 500 });
  }
}

// PUT /api/products/:id
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireApiPermission("product.update"); if (unauthorized) return unauthorized;
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const { id } = await params;
    const body = await req.json();
    if (Object.hasOwn(body, "quantity")) {
      const stockPermission = await requireApiPermission("inventory.adjust");
      if (stockPermission) return stockPermission;
    }
    if (Object.hasOwn(body, "cost")) {
      const costPermission = await requireApiPermission("product.cost.view");
      if (costPermission) return costPermission;
    }
    const existing = await prisma.product.findFirst({ where: { id: Number(id), businessId }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

    const product = await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        category: body.category,
        sku: body.sku,
        quantity: body.quantity,
        price: body.price,
        cost: body.cost,
        in_store: Number.isInteger(Number(body.quantity)) ? Number(body.quantity) > 0 : undefined,
      },
    });
    await writeAuditLog(prisma, { businessId, actorUserId: userId, actorMembershipId: membershipId, action: "product.update", entityType: "Product", entityId: product.id, metadata: { changedFields: Object.keys(body).filter((key) => key !== "businessId") } });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Error actualizando producto" }, { status: 500 });
  }
}

// DELETE /api/products/:id
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireApiPermission("product.delete"); if (unauthorized) return unauthorized;
    const { businessId, membershipId, userId } = await getDefaultTenantContext();
    const { id } = await params;
    const deleted = await prisma.product.deleteMany({
      where: { id: Number(id), businessId },
    });
    if (deleted.count === 0) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    await writeAuditLog(prisma, { businessId, actorUserId: userId, actorMembershipId: membershipId, action: "product.delete", entityType: "Product", entityId: id });

    return NextResponse.json({ message: "Producto eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error eliminando producto" }, { status: 500 });
  }
}
