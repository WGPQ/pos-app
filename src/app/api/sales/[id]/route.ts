import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: Number(params.id) },
      include: { items: true, client: true },
    });

    if (!sale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    return NextResponse.json(
      { error: "Error obteniendo venta" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    if (body?.action !== "cancel") {
      return NextResponse.json(
        { error: "Acción no soportada" },
        { status: 400 }
      );
    }

    const sale = await prisma.sale.findUnique({
      where: { id: Number(params.id) },
      include: { items: true, client: true },
    });

    if (!sale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    if (sale.status === "Cancelled") {
      return NextResponse.json(
        { error: "La venta ya está anulada." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: { status: "Cancelled" },
        include: { items: true, client: true },
      });

      const productUpdates = await Promise.all(
        sale.items
          .filter((item) => item.productId !== null)
          .map(async (item) => {
            const product = await tx.product.findUnique({
              where: { id: item.productId as number },
            });

            if (!product) return null;

            const nextQuantity = product.quantity + item.quantity;
            return tx.product.update({
              where: { id: product.id },
              data: {
                quantity: nextQuantity,
                in_store: nextQuantity > 0,
              },
            });
          })
      );

      return {
        sale: updatedSale,
        updatedProducts: productUpdates.filter(Boolean),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error cancelling sale:", error);
    return NextResponse.json(
      { error: "Error anulando la venta" },
      { status: 500 }
    );
  }
}
