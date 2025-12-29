import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: Number(params.id) },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json(
      { error: "Error obteniendo cliente" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const client = await prisma.client.update({
      where: { id: Number(params.id) },
      data: {
        ci: body.ci,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json(
      { error: "Error actualizando cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.client.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "Cliente eliminado" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error eliminando cliente" },
      { status: 500 }
    );
  }
}
