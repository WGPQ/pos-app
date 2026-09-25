import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.storeSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1, taxRate: 0.12 } });
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  try {
    const { taxRate } = await request.json(); const value = Number(taxRate);
    if (!Number.isFinite(value) || value < 0 || value > 1) return NextResponse.json({ error: "La tarifa de IVA debe estar entre 0 y 1." }, { status: 400 });
    const settings = await prisma.storeSettings.upsert({ where: { id: 1 }, update: { taxRate: value }, create: { id: 1, taxRate: value } });
    return NextResponse.json(settings);
  } catch { return NextResponse.json({ error: "No se pudo actualizar el IVA." }, { status: 500 }); }
}
