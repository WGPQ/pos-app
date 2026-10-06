import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth";
import { getAuthorizationContext, requireApiPermission } from "@/lib/authorization";
import { CategoryError, parseCategory } from "@/lib/categories";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  const denied = await requireApiAuth(); if (denied) return denied;
  try {
    const context = await getAuthorizationContext();
    if (!["product.view", "product.create", "product.update", "business.settings.view"].some(p => context.permissions.has(p))) return NextResponse.json({ error: "No tienes permiso para consultar categorías." }, { status: 403 });
    const all = new URL(request.url).searchParams.get("all") === "1";
    return NextResponse.json(await prisma.category.findMany({ where: { businessId: context.businessId, ...(all ? {} : { active: true }) }, include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } }));
  } catch { return NextResponse.json({ error: "No se pudieron cargar las categorías." }, { status: 500 }); }
}

export async function POST(request: Request) {
  const denied = await requireApiPermission("business.settings.update"); if (denied) return denied;
  try {
    const context = await getAuthorizationContext();
    const input = parseCategory(await request.json());
    const result = await prisma.$transaction(async tx => {
      const category = await tx.category.create({ data: { ...input, businessId: context.businessId } });
      await writeAuditLog(tx, { businessId: context.businessId, actorUserId: context.userId, actorMembershipId: context.membershipId, action: "category.create", entityType: "Category", entityId: category.id });
      return category;
    }, { maxWait: 10_000, timeout: 30_000 });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof CategoryError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Ya existe una categoría con ese nombre." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo crear la categoría." }, { status: 500 });
  }
}
