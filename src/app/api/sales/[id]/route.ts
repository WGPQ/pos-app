import { prisma } from "@/lib/prisma";
import { getDefaultTenantContext } from "@/lib/default-tenant";
import { requireApiPermission } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireApiPermission("sale.view"); if (unauthorized) return unauthorized;
  const { id } = await params;
  const { businessId, branchId } = await getDefaultTenantContext();
  const sale = await prisma.sale.findFirst({ where: { id: Number(id), businessId, branchId }, include: { items: true, client: true, cashSession: true } });
  return sale ? NextResponse.json(sale) : NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireApiPermission("sale.cancel"); if (unauthorized) return unauthorized;
    const { businessId, branchId, membershipId, userId, userName } = await getDefaultTenantContext();
    const { id } = await params; const body = await req.json(); const reason = String(body.reason ?? "").trim();
    if (body.action !== "cancel" || !reason) return NextResponse.json({ error: "Indica el motivo de la anulación." }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({ where: { id: Number(id), businessId, branchId }, include: { items: true } });
      if (!sale) throw new Error("NOT_FOUND"); if (sale.status !== "COMPLETED") throw new Error("NOT_CANCELLABLE");
      await tx.sale.update({ where: { id: sale.id }, data: { status: "CANCELLED", cancellationReason: reason, cancelledAt: new Date(), cancelledBy: userName, cancelledByMembershipId: membershipId } });
      const updatedProducts = await Promise.all(sale.items.filter((item) => item.productId).map(async (item) => {
        const updated = await tx.product.updateMany({ where: { id: item.productId!, businessId }, data: { quantity: { increment: item.quantity }, in_store: true } });
        if (updated.count !== 1) throw new Error("PRODUCT_NOT_FOUND");
        return tx.product.findUniqueOrThrow({ where: { id: item.productId! } });
      }));
      await writeAuditLog(tx, { businessId, branchId, actorUserId: userId, actorMembershipId: membershipId, action: "sale.cancel", entityType: "Sale", entityId: sale.id, metadata: { restoredItemCount: updatedProducts.length } });
      return { sale: await tx.sale.findUniqueOrThrow({ where: { id: sale.id }, include: { items: true, client: true } }), updatedProducts };
    });
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "NOT_FOUND") return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    if (code === "NOT_CANCELLABLE") return NextResponse.json({ error: "Solo se pueden anular ventas completadas." }, { status: 400 });
    console.error("Error cancelling sale", error); return NextResponse.json({ error: "No fue posible anular la venta." }, { status: 500 });
  }
}
