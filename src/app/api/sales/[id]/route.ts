import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = await prisma.sale.findUnique({ where: { id: Number(id) }, include: { items: true, client: true, cashSession: true } });
  return sale ? NextResponse.json(sale) : NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await req.json(); const reason = String(body.reason ?? "").trim();
    if (body.action !== "cancel" || !reason) return NextResponse.json({ error: "Indica el motivo de la anulación." }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: Number(id) }, include: { items: true } });
      if (!sale) throw new Error("NOT_FOUND"); if (sale.status !== "COMPLETED") throw new Error("NOT_CANCELLABLE");
      await tx.sale.update({ where: { id: sale.id }, data: { status: "CANCELLED", cancellationReason: reason, cancelledAt: new Date(), cancelledBy: "Elizabeth Oña" } });
      const updatedProducts = await Promise.all(sale.items.filter((item) => item.productId).map((item) => tx.product.update({ where: { id: item.productId! }, data: { quantity: { increment: item.quantity }, in_store: true } })));
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
