import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


// GET /api/products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usesPagination = ["search", "category", "stockStatus", "page", "pageSize"].some((key) => searchParams.has(key));
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category")?.trim();
    const stockStatus = searchParams.get("stockStatus");
    const exportAll = searchParams.get("export") === "1";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
    const where = {
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { sku: { contains: search, mode: "insensitive" as const } }] } : {}),
      ...(category ? { category } : {}),
      ...(stockStatus === "OUT" ? { quantity: 0 } : stockStatus === "IN" ? { quantity: { gt: 0 } } : stockStatus === "LOW" ? { quantity: { gt: 0, lte: 5 } } : {}),
    };
    if (exportAll) return NextResponse.json(await prisma.product.findMany({ where, orderBy: { name: "asc" } }));
    if (!usesPagination) return NextResponse.json(await prisma.product.findMany({ orderBy: { createdAt: "desc" } }));
    const [data, total] = await prisma.$transaction([
      prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.product.count({ where }),
    ]);
    return NextResponse.json({ data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return NextResponse.json({ error: "Error obteniendo productos" }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const quantity = Number(body.quantity);
    const price = Number(body.price);
    const cost = Number(body.cost);
    const minStock = Number(body.minStock ?? 5);
    if (!body.name?.trim() || !body.sku?.trim() || !body.category?.trim() || !Number.isInteger(quantity) || quantity < 0 || !Number.isFinite(price) || price < 0 || !Number.isFinite(cost) || cost < 0 || !Number.isInteger(minStock) || minStock < 0) {
      return NextResponse.json({ error: "Revisa los campos obligatorios y valores numéricos." }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        image: body.image,
        category: body.category,
        sku: body.sku,
        quantity,
        minStock,
        price,
        cost,
        in_store: quantity > 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.log({ error });

    return NextResponse.json({ error: "Error creando producto" }, { status: 500 });
  }
}
