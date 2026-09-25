import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const dayStart = (offset = 0) => {
  const date = new Date();
  date.setUTCHours(5, 0, 0, 0); // midnight in Ecuador (UTC-5)
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
};

export async function GET() {
  try {
    const today = dayStart(); const tomorrow = dayStart(1);
    const completedToday = { status: "COMPLETED", createdAt: { gte: today, lt: tomorrow } };
    const [todayMetrics, totalProducts, totalCustomers, lowStockCount, recentSales, topProducts] = await Promise.all([
      prisma.sale.aggregate({ where: completedToday, _sum: { total: true }, _count: { _all: true } }),
      prisma.product.count(), prisma.client.count(),
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "Product" WHERE quantity <= "minStock"`,
      prisma.sale.findMany({ where: { status: "COMPLETED" }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, receiptNumber: true, total: true, createdAt: true, client: { select: { name: true } } } }),
      prisma.saleItem.groupBy({ by: ["productName", "productSku"], where: { sale: { status: "COMPLETED", createdAt: { gte: today, lt: tomorrow } } }, _sum: { quantity: true, subtotal: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
    ]);
    const salesOverview = await Promise.all(Array.from({ length: 7 }, async (_, index) => {
      const start = dayStart(index - 6); const end = dayStart(index - 5);
      const metrics = await prisma.sale.aggregate({ where: { status: "COMPLETED", createdAt: { gte: start, lt: end } }, _sum: { total: true }, _count: { _all: true } });
      return { date: start.toISOString().slice(0, 10), total: Number(metrics._sum.total ?? 0), transactions: metrics._count._all };
    }));
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
