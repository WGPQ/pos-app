import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SaleItemRequest = {
  productId: number;
  quantity: number;
};

const buildReceiptNumber = () => `REC-${Date.now()}`;

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, client: true },
    });

    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json(
      { error: "Error obteniendo ventas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const clientIdRaw = body.clientId;
    const isFinalConsumer = Boolean(body.isFinalConsumer);

    if (!rawItems.length) {
      return NextResponse.json(
        { error: "No hay productos para registrar la venta." },
        { status: 400 }
      );
    }

    if (!isFinalConsumer && (clientIdRaw === null || clientIdRaw === undefined)) {
      return NextResponse.json(
        { error: "Debe seleccionar un cliente válido." },
        { status: 400 }
      );
    }

    const itemMap = new Map<number, number>();
    for (const item of rawItems as SaleItemRequest[]) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || productId <= 0) {
        return NextResponse.json(
          { error: "Producto inválido en la venta." },
          { status: 400 }
        );
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: "Cantidad inválida en la venta." },
          { status: 400 }
        );
      }
      itemMap.set(productId, (itemMap.get(productId) ?? 0) + quantity);
    }

    const productIds = Array.from(itemMap.keys());
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Algunos productos no existen en el inventario." },
        { status: 400 }
      );
    }

    let client = null;
    if (!isFinalConsumer) {
      const clientId = Number(clientIdRaw);
      if (!Number.isInteger(clientId) || clientId <= 0) {
        return NextResponse.json(
          { error: "Debe seleccionar un cliente válido." },
          { status: 400 }
        );
      }
      client = await prisma.client.findUnique({
        where: { id: clientId },
      });
      if (!client) {
        return NextResponse.json(
          { error: "El cliente no existe." },
          { status: 400 }
        );
      }
    }

    const saleItemsData = [];
    const updates: Array<{ id: number; quantity: number }> = [];
    let total = 0;

    for (const product of products) {
      const requestedQuantity = itemMap.get(product.id) ?? 0;
      if (product.quantity < requestedQuantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}.` },
          { status: 400 }
        );
      }
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * requestedQuantity;
      total += subtotal;

      saleItemsData.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        unitPrice,
        quantity: requestedQuantity,
        subtotal,
      });

      const nextQuantity = product.quantity - requestedQuantity;
      updates.push({ id: product.id, quantity: nextQuantity });
    }

    const receiptNumber = buildReceiptNumber();
    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          receiptNumber,
          total,
          status: "Completed",
          clientId: client?.id ?? null,
          items: {
            create: saleItemsData,
          },
        },
        include: { items: true, client: true },
      });

      const updatedProducts = await Promise.all(
        updates.map((update) =>
          tx.product.update({
            where: { id: update.id },
            data: {
              quantity: update.quantity,
              in_store: update.quantity > 0,
            },
          })
        )
      );

      return { sale, updatedProducts };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Error al registrar la venta" },
      { status: 500 }
    );
  }
}
