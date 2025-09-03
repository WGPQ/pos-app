import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/products/:id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(params.id) },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Error obteniendo producto" }, { status: 500 });
  }
}

// PUT /api/products/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id: Number(params.id) },
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        category: body.category,
        sku: body.sku,
        quantity: body.quantity,
        price: body.price,
        cost: body.cost,
        in_store: body.in_store,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Error actualizando producto" }, { status: 500 });
  }
}

// DELETE /api/products/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "Producto eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error eliminando producto" }, { status: 500 });
  }
}
