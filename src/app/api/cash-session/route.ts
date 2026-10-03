import { prisma } from "@/lib/prisma";
import { getDefaultTenantContext } from "@/lib/default-tenant";
import { requireApiPermission } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

const asMoney = (value: unknown) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export async function GET() {
  try {
    const unauthorized = await requireApiPermission("cash.view"); if (unauthorized) return unauthorized;
    const { branchId } = await getDefaultTenantContext();
    const session = await prisma.cashSession.findFirst({ where: { branchId, status: "OPEN" }, orderBy: { openedAt: "desc" } });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "No se pudo cargar la caja." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const unauthorized = await requireApiPermission("cash.open"); if (unauthorized) return unauthorized;
    const { businessId, branchId, membershipId, userId, userName } = await getDefaultTenantContext();
    const body = await request.json(); const openingAmount = asMoney(body.openingAmount);
    if (!Number.isFinite(openingAmount) || openingAmount < 0) return NextResponse.json({ error: "Ingresa un monto de apertura válido." }, { status: 400 });
    const session = await prisma.$transaction(async (tx) => {
      const active = await tx.cashSession.findFirst({ where: { branchId, status: "OPEN" } });
      if (active) throw new Error("ALREADY_OPEN");
      const created = await tx.cashSession.create({ data: { businessId, branchId, openedByMembershipId: membershipId, openingAmount, notes: String(body.notes ?? "").trim() || null, cashierName: userName } });
      await writeAuditLog(tx, { businessId, branchId, actorUserId: userId, actorMembershipId: membershipId, action: "cash.open", entityType: "CashSession", entityId: created.id });
      return created;
    });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_OPEN") return NextResponse.json({ error: "Ya existe una caja abierta." }, { status: 400 });
    return NextResponse.json({ error: "No se pudo abrir caja." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const unauthorized = await requireApiPermission("cash.close"); if (unauthorized) return unauthorized;
    const { businessId, branchId, membershipId, userId } = await getDefaultTenantContext();
    const body = await request.json(); const closingAmount = asMoney(body.closingAmount);
    if (!Number.isFinite(closingAmount) || closingAmount < 0) return NextResponse.json({ error: "Ingresa el efectivo contado." }, { status: 400 });
    const session = await prisma.$transaction(async (tx) => {
      const active = await tx.cashSession.findFirst({ where: { businessId, branchId, status: "OPEN" }, orderBy: { openedAt: "desc" } });
      if (!active) throw new Error("NO_OPEN_SESSION");
      const aggregate = await tx.sale.aggregate({ where: { businessId, branchId, cashSessionId: active.id, status: "COMPLETED", paymentMethod: "CASH" }, _sum: { total: true } });
      const expectedAmount = asMoney(Number(active.openingAmount) + Number(aggregate._sum.total ?? 0));
      const closed = await tx.cashSession.update({ where: { id: active.id }, data: { status: "CLOSED", closedAt: new Date(), closedByMembershipId: membershipId, expectedAmount, closingAmount, difference: asMoney(closingAmount - expectedAmount) } });
      await writeAuditLog(tx, { businessId, branchId, actorUserId: userId, actorMembershipId: membershipId, action: "cash.close", entityType: "CashSession", entityId: closed.id });
      return closed;
    });
    return NextResponse.json({ session });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_OPEN_SESSION") return NextResponse.json({ error: "No hay una caja abierta." }, { status: 400 });
    return NextResponse.json({ error: "No se pudo cerrar caja." }, { status: 500 });
  }
}
