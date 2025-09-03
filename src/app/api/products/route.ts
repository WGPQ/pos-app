import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Error obteniendo productos" }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        category: body.category,
        sku: body.sku,
        quantity: body.quantity,
        price: body.price,
        cost: body.cost,
        in_store: body.in_store ?? true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.log({ error });

    return NextResponse.json({ error: "Error creando producto" }, { status: 500 });
  }
}
