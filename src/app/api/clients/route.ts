import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json(
      { error: "Error obteniendo clientes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const client = await prisma.client.create({
      data: {
        ci: body.ci,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Error creando cliente" },
      { status: 500 }
    );
  }
}
