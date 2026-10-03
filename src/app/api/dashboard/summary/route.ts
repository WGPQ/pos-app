import { prisma } from "@/lib/prisma";
import { getDefaultTenantContext } from "@/lib/default-tenant";
import { requireApiPermission } from "@/lib/authorization";
import { NextResponse } from "next/server";

const dayStart = (offset = 0) => {
  const date = new Date();
  date.setUTCHours(5, 0, 0, 0); // midnight in Ecuador (UTC-5)
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
};

export async function GET() {
  try {
    const unauthorized = await requireApiPermission("dashboard.view"); if (unauthorized) return unauthorized;
    const { businessId, branchId } = await getDefaultTenantContext();
    const today = dayStart(); const tomorrow = dayStart(1);
    const completedToday = { businessId, branchId, status: "COMPLETED", createdAt: { gte: today, lt: tomorrow } };
    // This provider has a strict connection cap. Keep dashboard work sequential so
    // one browser request cannot create thirteen concurrent database operations.
    const todayMetrics = await prisma.sale.aggregate({ where: completedToday, _sum: { total: true }, _count: { _all: true } });
    const totalProducts = await prisma.product.count({ where: { businessId } });
    const totalCustomers = await prisma.client.count({ where: { businessId } });
    const lowStockCount = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "Product" WHERE "businessId" = ${businessId} AND quantity <= "minStock"`;
    const recentSales = await prisma.sale.findMany({ where: { businessId, branchId, status: "COMPLETED" }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, receiptNumber: true, total: true, createdAt: true, client: { select: { name: true } } } });
    const topProducts = await prisma.saleItem.groupBy({ by: ["productName", "productSku"], where: { sale: { businessId, branchId, status: "COMPLETED", createdAt: { gte: today, lt: tomorrow } } }, _sum: { quantity: true, subtotal: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 });
    const salesOverview = [];
    for (let index = 0; index < 7; index += 1) {
      const start = dayStart(index - 6); const end = dayStart(index - 5);
      const metrics = await prisma.sale.aggregate({ where: { businessId, branchId, status: "COMPLETED", createdAt: { gte: start, lt: end } }, _sum: { total: true }, _count: { _all: true } });
      salesOverview.push({ date: start.toISOString().slice(0, 10), total: Number(metrics._sum.total ?? 0), transactions: metrics._count._all });
    }
    const todaySales = Number(todayMetrics._sum.total ?? 0);
    return NextResponse.json({
      todaySales, todayGrossProfit: 0, todayTransactions: todayMetrics._count._all,
      averageTicket: todayMetrics._count._all ? todaySales / todayMetrics._count._all : 0,
      totalProducts, totalCustomers, lowStockCount: Number(lowStockCount[0]?.count ?? 0), salesOverview, topProducts, recentSales,
    });
  } catch (error) {
    console.error("Dashboard summary failed", error);
    return NextResponse.json({ error: "No se pudo cargar el resumen del dashboard." }, { status: 500 });
  }
}
