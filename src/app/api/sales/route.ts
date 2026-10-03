import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getDefaultTenantContext } from "@/lib/default-tenant";
import { requireApiPermission } from "@/lib/authorization";
import { writeAuditLog } from "@/lib/audit";
import { NextResponse } from "next/server";

const FINAL_CONSUMER_CI = "9999999999";
const PAYMENT_METHODS = new Set(["CASH", "CARD", "BANK_TRANSFER", "OTHER"]);
type SaleItemRequest = { productId: number; quantity: number };
const currency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const receiptDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).replaceAll("-", "");

export async function GET(request: Request) {
  try {
    const unauthorized = await requireApiPermission("sale.view"); if (unauthorized) return unauthorized;
    const { businessId, branchId } = await getDefaultTenantContext();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
    const search = searchParams.get("search")?.trim();
    const paymentMethod = searchParams.get("paymentMethod");
    const status = searchParams.get("status");
    const where = {
      businessId,
      branchId,
      ...(status ? { status } : {}), ...(paymentMethod ? { paymentMethod } : {}),
      ...(search ? { OR: [{ receiptNumber: { contains: search, mode: "insensitive" as const } }, { client: { name: { contains: search, mode: "insensitive" as const } } }, { client: { ci: { contains: search, mode: "insensitive" as const } } }] } : {}),
    };
    const [data, total] = await prisma.$transaction([
      prisma.sale.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include: { items: true, client: true, cashSession: { select: { id: true, status: true } } } }),
      prisma.sale.count({ where }),
    ]);
    return NextResponse.json({ data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    console.error("Error fetching sales", error);
    return NextResponse.json({ error: "Error obteniendo ventas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const unauthorized = await requireApiPermission("sale.create"); if (unauthorized) return unauthorized;
    const { businessId, branchId, membershipId, userId, userName } = await getDefaultTenantContext();
    const body = await req.json();
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const paymentMethod = String(body.paymentMethod ?? "CASH");
    const discount = currency(Number(body.discount ?? 0));
    const amountReceived = body.amountReceived === undefined || body.amountReceived === "" ? null : currency(Number(body.amountReceived));
    if (!rawItems.length) return NextResponse.json({ error: "Agrega al menos un producto a la venta." }, { status: 400 });
    if (!PAYMENT_METHODS.has(paymentMethod)) return NextResponse.json({ error: "Método de pago inválido." }, { status: 400 });
    if (!Number.isFinite(discount) || discount < 0 || (amountReceived !== null && (!Number.isFinite(amountReceived) || amountReceived < 0))) return NextResponse.json({ error: "Los valores de cobro no son válidos." }, { status: 400 });
    const itemMap = new Map<number, number>();
    for (const item of rawItems as SaleItemRequest[]) {
      const productId = Number(item.productId); const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) return NextResponse.json({ error: "Hay un producto o cantidad inválida en la venta." }, { status: 400 });
      itemMap.set(productId, (itemMap.get(productId) ?? 0) + quantity);
    }
    const sale = await prisma.$transaction(async (tx) => {
      const cashSession = await tx.cashSession.findFirst({ where: { businessId, branchId, status: "OPEN" }, orderBy: { openedAt: "desc" } });
      if (!cashSession) throw new Error("OPEN_CASH_SESSION_REQUIRED");
      const products = await tx.product.findMany({ where: { businessId, id: { in: [...itemMap.keys()] } } });
      if (products.length !== itemMap.size) throw new Error("PRODUCT_NOT_FOUND");
      const items = products.map((product) => { const quantity = itemMap.get(product.id)!; return { productId: product.id, productName: product.name, productSku: product.sku, unitPrice: Number(product.price), quantity, subtotal: currency(Number(product.price) * quantity) }; });
      const subtotal = currency(items.reduce((sum, item) => sum + item.subtotal, 0));
      if (discount > subtotal) throw new Error("INVALID_DISCOUNT");
      const settings = await tx.storeSettings.upsert({ where: { businessId }, update: {}, create: { businessId, taxRate: 0.12 } });
      const tax = currency((subtotal - discount) * Number(settings.taxRate)); const total = currency(subtotal - discount + tax);
      if (paymentMethod === "CASH" && (amountReceived === null || amountReceived < total)) throw new Error("INSUFFICIENT_CASH");
      for (const product of products) {
        const updated = await tx.product.updateMany({ where: { id: product.id, businessId, quantity: { gte: itemMap.get(product.id)! } }, data: { quantity: { decrement: itemMap.get(product.id)! } } });
        if (updated.count !== 1) throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
      }
      await tx.product.updateMany({ where: { businessId, id: { in: products.map((p) => p.id) }, quantity: { lte: 0 } }, data: { in_store: false } });
      const client = body.isFinalConsumer
        ? await tx.client.upsert({ where: { businessId_ci: { businessId, ci: FINAL_CONSUMER_CI } }, update: {}, create: { businessId, ci: FINAL_CONSUMER_CI, name: "Consumidor Final" } })
        : await tx.client.findFirst({ where: { id: Number(body.clientId), businessId } });
      if (!client) throw new Error("INVALID_CLIENT");
      const draft = await tx.sale.create({ data: { businessId, branchId, cashierMembershipId: membershipId, receiptNumber: `PENDING-${randomUUID()}`, subtotal, discount, tax, total, paymentMethod, amountReceived: paymentMethod === "CASH" ? amountReceived : null, change: paymentMethod === "CASH" ? currency((amountReceived ?? 0) - total) : 0, status: "COMPLETED", cashierName: userName, cashSessionId: cashSession.id, clientId: client.id, items: { create: items } } });
      const completed = await tx.sale.update({ where: { id: draft.id }, data: { receiptNumber: `V-${receiptDate()}-${String(draft.id).padStart(6, "0")}` }, include: { items: true, client: true, cashSession: true } });
      await writeAuditLog(tx, { businessId, branchId, actorUserId: userId, actorMembershipId: membershipId, action: "sale.create", entityType: "Sale", entityId: completed.id, metadata: { receiptNumber: completed.receiptNumber, itemCount: items.length } });
      return completed;
    });
    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const errors: Record<string, string> = { OPEN_CASH_SESSION_REQUIRED: "Debes abrir caja antes de registrar ventas.", PRODUCT_NOT_FOUND: "Uno o más productos ya no existen.", INVALID_DISCOUNT: "El descuento no puede superar el subtotal.", INSUFFICIENT_CASH: "El efectivo recibido es menor al total.", INVALID_CLIENT: "El cliente seleccionado no es válido." };
    const friendly = code.startsWith("INSUFFICIENT_STOCK:") ? `Stock insuficiente para ${code.split(":")[1]}.` : errors[code];
    if (friendly) return NextResponse.json({ error: friendly }, { status: 400 });
    console.error("Error creating sale", error);
    return NextResponse.json({ error: "No fue posible registrar la venta. Inténtalo nuevamente." }, { status: 500 });
  }
}
